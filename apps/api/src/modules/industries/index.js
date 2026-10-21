import {Router} from 'express';
import {z} from 'zod';
import {prisma} from '../../../lib/prisma.js';
import {requireAuth} from '../../../middleware/auth.js';
import {requirePermission} from '../../../middleware/permissions.js';
import {PROFILES,SECTORS} from './catalog.js';
import {recommendBusinessModules} from './engine.js';
const router=Router();
router.use(requireAuth,requirePermission('modules.read'));
router.get('/sectors',(_req,res)=>res.json({ok:true,sectors:SECTORS}));
router.get('/profiles',(req,res)=>{
 const q=String(req.query.q??'').trim().toLocaleLowerCase('es');
 res.json({ok:true,profiles:PROFILES.filter(p=>!q||p.name.toLocaleLowerCase('es').includes(q)||p.slug.includes(q))});
});
const requestSchema=z.object({activities:z.array(z.string()).min(1).max(30)});
router.post('/recommend',async(req,res,next)=>{
 const parsed=requestSchema.safeParse(req.body);
 if(!parsed.success)return res.status(400).json({ok:false,message:'Actividades inválidas'});
 try {
  const available=await prisma.module.findMany({where:{active:true},select:{key:true,name:true}});
  return res.json({ok:true,recommendation:recommendBusinessModules(parsed.data.activities,available)});
 }catch(error){if(error.message==='Actividad no reconocida')return res.status(400).json({ok:false,message:error.message});next(error);}
});

router.get('/company',async(req,res,next)=>{
 try{
  const activities=await prisma.companyIndustryProfile.findMany({where:{companyId:req.auth.companyId},orderBy:[{isPrimary:'desc'},{createdAt:'asc'}]});
  res.json({ok:true,activities});
 }catch(error){next(error)}
});
router.put('/company',requirePermission('modules.manage'),async(req,res,next)=>{
 const parsed=requestSchema.safeParse(req.body);
 if(!parsed.success)return res.status(400).json({ok:false,message:'Actividades inválidas'});
 const activities=[...new Set(parsed.data.activities)];
 if(activities.some(key=>!PROFILES.some(profile=>profile.slug===key)))return res.status(400).json({ok:false,message:'Actividad no reconocida'});
 try{
  await prisma.$transaction(async tx=>{
   await tx.companyIndustryProfile.deleteMany({where:{companyId:req.auth.companyId}});
   await tx.companyIndustryProfile.createMany({data:activities.map((activityKey,index)=>({companyId:req.auth.companyId,activityKey,isPrimary:index===0}))});
  });
  res.json({ok:true,activities});
 }catch(error){next(error)}
});
export default {id:'industries',routes:[{path:'/api/industries',router}]};
