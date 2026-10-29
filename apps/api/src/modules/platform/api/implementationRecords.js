import {Router} from 'express';
import {z} from 'zod';
import {prisma} from '../../../lib/prisma.js';
import {requirePlatformAuth,requirePlatformSession,requireRecentReauth} from '../../../middleware/auth.js';
import {requirePermission} from '../../../middleware/permissions.js';
import {createPlatformProspect,transitionPlatformImplementation,ImplementationOperationError} from '../domain/implementationService.js';

const router=Router();
router.use(requirePlatformAuth,requirePlatformSession,requirePermission('platform.manage'));
router.use((request,response,next)=>{
  response.set('Cache-Control','no-store');
  // The schema must be deployed and verified before this flag is enabled.
  if(process.env.PLATFORM_IMPLEMENTATIONS_ENABLED!=='true'){
    return response.status(503).json({
      ok:false,code:'IMPLEMENTATIONS_NOT_ENABLED',
      message:'El registro de implementaciones requiere habilitación y migración verificada',
    });
  }
  return next();
});

const createSchema=z.strictObject({
  name:z.string().trim().min(2).max(120),
  contactEmail:z.email().max(254).transform(value=>value.trim().toLowerCase()),
  industryKey:z.string().trim().min(1).max(100).nullable().optional(),
  scianCode:z.string().regex(/^\d{2,6}$/).nullable().optional(),
  notes:z.string().trim().max(2000).nullable().optional(),
  requestedModuleKeys:z.array(z.string().regex(/^[a-z0-9_-]{2,48}$/)).max(30).refine(
    list=>new Set(list).size===list.length,'Los módulos solicitados no pueden repetirse',
  ).optional(),
});
const transitionSchema=z.strictObject({
  toStage:z.enum(['CONFIGURATION','PAUSED','CANCELLED']),
  reason:z.string().trim().min(10).max(500),
});
const uuidSchema=z.uuid();
const idSchema=z.string().cuid();

function sendError(response,error,next){
  if(error instanceof ImplementationOperationError){
    return response.status(error.status).json({ok:false,code:error.code,message:error.message});
  }
  if(error?.code==='P2021'||error?.code==='P2022'){
    return response.status(503).json({ok:false,code:'IMPLEMENTATION_SCHEMA_NOT_READY',message:'La migración de implementaciones no está disponible'});
  }
  return next(error);
}

router.get('/',async(request,response,next)=>{
  try{
    const take=Math.min(Math.max(Number.parseInt(String(request.query.limit||30),10)||30,1),100);
    const records=await prisma.platformImplementation.findMany({
      orderBy:[{createdAt:'desc'},{id:'desc'}],take,
      select:{
        id:true,name:true,kind:true,stage:true,companyId:true,
        industryKey:true,scianCode:true,contactEmail:true,planKey:true,
        requestedModuleKeys:true,ownerUserId:true,targetDate:true,
        createdAt:true,updatedAt:true,
      },
    });
    return response.json({ok:true,records,source:'platform-implementation-ledger',limit:take});
  }catch(error){return sendError(response,error,next)}
});

router.get('/:id',async(request,response,next)=>{
  try{
    const id=idSchema.safeParse(request.params.id);
    if(!id.success)return response.status(400).json({ok:false,message:'Identificador inválido'});
    const record=await prisma.platformImplementation.findUnique({
      where:{id:id.data},include:{events:{orderBy:{createdAt:'desc'},take:50}},
    });
    if(!record)return response.status(404).json({ok:false,message:'Registro no encontrado'});
    return response.json({ok:true,record});
  }catch(error){return sendError(response,error,next)}
});

// Mutations require a fresh Super Admin reauthentication. They do not create tenants.
router.post('/',requireRecentReauth(600),async(request,response,next)=>{
  try{
    const parsed=createSchema.safeParse(request.body);
    const key=uuidSchema.safeParse(request.headers['idempotency-key']);
    if(!parsed.success||!key.success)return response.status(400).json({
      ok:false,code:'IMPLEMENTATION_INPUT_INVALID',
      message:'Datos de prospecto o clave de idempotencia inválidos',
    });
    const result=await createPlatformProspect(prisma,{...parsed.data,requestKey:key.data},request.auth.sub,{ipAddress:request.ip});
    return response.status(result.created?201:200).json({ok:true,...result});
  }catch(error){return sendError(response,error,next)}
});

router.patch('/:id/stage',requireRecentReauth(600),async(request,response,next)=>{
  try{
    const id=idSchema.safeParse(request.params.id);
    const parsed=transitionSchema.safeParse(request.body);
    if(!id.success||!parsed.success)return response.status(400).json({
      ok:false,code:'IMPLEMENTATION_INPUT_INVALID',message:'Etapa, motivo o identificador inválido',
    });
    const record=await transitionPlatformImplementation(prisma,{
      id:id.data,toStage:parsed.data.toStage,reason:parsed.data.reason,
    },request.auth.sub,{ipAddress:request.ip});
    return response.json({ok:true,record});
  }catch(error){return sendError(response,error,next)}
});
export default router;
