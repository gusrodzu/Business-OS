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
export default {id:'industries',routes:[{path:'/api/industries',router}]};
