import {Router} from 'express';
import {z} from 'zod';
import {prisma} from '../../../lib/prisma.js';
import {requireAuth} from '../../../middleware/auth.js';
import {requireAuthenticatedSelfService} from '../../../middleware/selfService.js';

const router=Router();
router.use(requireAuth);
const person={id:true,firstName:true,lastName:true};
const sendSchema=z.object({text:z.string().trim().min(1).max(4000),clientId:z.string().uuid()});
const wrap=fn=>async(req,res,next)=>{try{await fn(req,res);}catch(error){next(error);}};
const peerWhere=req=>({id:req.params.peerId,companyId:req.auth.companyId,active:true,NOT:{id:req.auth.sub}});
const scope=req=>({companyId:req.auth.companyId,OR:[{senderId:req.auth.sub,recipientId:req.params.peerId},{senderId:req.params.peerId,recipientId:req.auth.sub}]});
router.get('/contacts',wrap(async(req,res)=>{
 const contacts=await prisma.user.findMany({where:{companyId:req.auth.companyId,active:true,NOT:{id:req.auth.sub}},select:person,orderBy:[{firstName:'asc'},{id:'asc'}],take:250});
 res.json({ok:true,me:req.auth.sub,contacts});
}));
router.get('/direct/:peerId',wrap(async(req,res)=>{
 if(!await prisma.user.findFirst({where:peerWhere(req),select:{id:true}}))return res.status(404).json({ok:false,message:'Contacto no encontrado'});
 const messages=await prisma.messengerDirectMessage.findMany({where:scope(req),orderBy:[{createdAt:'desc'},{id:'desc'}],take:100});
 res.json({ok:true,messages:messages.reverse()});
}));
router.post('/direct/:peerId',requireAuthenticatedSelfService,wrap(async(req,res)=>{
 const parsed=sendSchema.safeParse(req.body);
 if(!parsed.success)return res.status(400).json({ok:false,message:'Mensaje inválido'});
 const {companyId,sub:senderId}=req.auth,recipientId=req.params.peerId;
 const message=await prisma.$transaction(async tx=>{
  if(!await tx.user.findFirst({where:peerWhere(req),select:{id:true}}))return null;
  const existing=await tx.messengerDirectMessage.findUnique({where:{companyId_senderId_clientId:{companyId,senderId,clientId:parsed.data.clientId}}});
  if(existing)return existing.recipientId===recipientId&&existing.text===parsed.data.text?existing:false;
  const item=await tx.messengerDirectMessage.create({data:{companyId,senderId,recipientId,...parsed.data}});
  await tx.notification.create({data:{companyId,userId:recipientId,type:'INFO',title:'Nuevo mensaje',message:'Tienes un mensaje nuevo en Mensajes.'}});
  return item;
 });
 if(message===null)return res.status(404).json({ok:false,message:'Contacto no encontrado'});
 if(message===false)return res.status(409).json({ok:false,message:'Identificador de envío ya utilizado'});
 res.json({ok:true,message});
}));
export default router;
