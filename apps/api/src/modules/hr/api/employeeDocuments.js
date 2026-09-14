import {Router} from 'express';
import {z} from 'zod';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {prisma} from '../../../lib/prisma.js';
import {requireAuth} from '../../../middleware/auth.js';
import {requirePermission} from '../../../middleware/permissions.js';
import {deletePrivateObject, getPrivateObject, isPrivateStorageRef, putPrivateObject} from '../../../lib/privateStorage.js';
import {assertExpectedFileSignature} from '../../../lib/fileSignatures.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDirectory = path.resolve(__dirname, '../../../../uploads');
await fs.mkdir(uploadsDirectory, {recursive: true});

const allowedExtensions = new Set(['.pdf','.jpg','.jpeg','.png','.webp','.doc','.docx']);
const allowedMimeTypes = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {fileSize: 10 * 1024 * 1024, files: 1, fields: 20, parts: 24, fieldNameSize: 100, fieldNestingDepth: 5, fieldArrayIndexLimit: 100},
  fileFilter: (_request, file, callback) => {
    if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(path.extname(file.originalname).toLowerCase())) {
      callback(new Error('Formato no permitido. Usa PDF, JPG, PNG, WEBP, DOC o DOCX.'));
      return;
    }
    callback(null, true);
  },
});

const router = Router();
router.use(requireAuth);

const documentSchema = z.object({
  employeeId: z.string().cuid(),
  type: z.enum(['IDENTIFICATION','TAX_DOCUMENT','SOCIAL_SECURITY','ADDRESS_PROOF','CONTRACT','CURP','BIRTH_CERTIFICATE','EDUCATION','MEDICAL','CONFIDENTIALITY','OTHER']),
  name: z.string().trim().min(2).max(160),
  fileUrl: z.string().trim().refine((value) => !value || /^https?:\/\//i.test(value) || isPrivateStorageRef(value), 'Referencia de archivo inválida').optional().or(z.literal('')).nullable(),
  fileName: z.string().trim().max(180).optional().or(z.literal('')).nullable(),
  issuedAt: z.coerce.date().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
  status: z.enum(['PENDING','VALID','EXPIRING','EXPIRED','REJECTED']).default('PENDING'),
  notes: z.string().trim().max(1000).optional().or(z.literal('')).nullable(),
});

function computedStatus(document) {
  if (document.status === 'REJECTED') return 'REJECTED';
  if (!document.expiresAt) return document.status === 'PENDING' ? 'PENDING' : 'VALID';
  const now = new Date();
  const expiry = new Date(document.expiresAt);
  if (expiry < now) return 'EXPIRED';
  const threshold = new Date(now);
  threshold.setDate(threshold.getDate() + 30);
  if (expiry <= threshold) return 'EXPIRING';
  return document.status === 'PENDING' ? 'PENDING' : 'VALID';
}

async function audit(req, action, entityId, description) {
  await prisma.auditLog.create({data:{userId:req.auth.sub,action,entity:'EmployeeDocument',entityId,description,ipAddress:req.ip}});
}

async function removeStoredUpload(fileUrl) {
  if (!fileUrl) return;
  if (isPrivateStorageRef(fileUrl)) {
    await deletePrivateObject(fileUrl).catch(() => undefined);
    return;
  }
  if (!fileUrl.includes('/uploads/')) return;
  const filename = decodeURIComponent(fileUrl.split('/uploads/').pop().split('?')[0]);
  const safeFilename = path.basename(filename);
  const target = path.join(uploadsDirectory, safeFilename);
  await fs.unlink(target).catch(() => undefined);
}

router.get('/', requirePermission('employee_documents.read'), async (req,res,next)=>{
  try {
    const [employees,documents] = await Promise.all([
      prisma.employee.findMany({where:{companyId:req.auth.companyId},include:{department:true,position:true,branch:true},orderBy:[{status:'asc'},{lastName:'asc'}]}),
      prisma.employeeDocument.findMany({where:{companyId:req.auth.companyId},include:{employee:{include:{department:true,position:true}}},orderBy:[{expiresAt:'asc'},{createdAt:'desc'}]}),
    ]);
    const normalized = documents.map(item=>({...item,status:computedStatus(item)}));
    const stats = {
      total: normalized.length,
      valid: normalized.filter(item=>item.status==='VALID').length,
      pending: normalized.filter(item=>item.status==='PENDING').length,
      alerts: normalized.filter(item=>['EXPIRING','EXPIRED'].includes(item.status)).length,
      employeesComplete: employees.filter(employee=>normalized.filter(item=>item.employeeId===employee.id && item.status==='VALID').length>=4).length,
    };
    res.json({ok:true,employees,documents:normalized,stats});
  } catch(e){next(e)}
});

router.post('/upload', requirePermission('employee_documents.manage'), (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (error) {
      const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      res.status(status).json({ok:false,message:error.code === 'LIMIT_FILE_SIZE' ? 'El archivo supera el límite de 10 MB.' : error.message});
      return;
    }
    if (!req.file) {
      res.status(400).json({ok:false,message:'Selecciona un archivo para subir.'});
      return;
    }
    try {
      assertExpectedFileSignature(req.file);
    } catch (signatureError) {
      res.status(400).json({ok:false,message:signatureError.message,code:signatureError.code});
      return;
    }
    next();
  });
}, async (req, res, next) => {
  try {
    const employeeId = String(req.body.employeeId || '').trim();
    if (!employeeId) return res.status(400).json({ok:false,message:'Selecciona el empleado antes de subir el archivo.'});
    const employee = await prisma.employee.findFirst({where:{id:employeeId,companyId:req.auth.companyId},select:{id:true}});
    if (!employee) return res.status(404).json({ok:false,message:'Empleado no encontrado'});

    const stored = await putPrivateObject({
      companyId: req.auth.companyId,
      scope: `employee-${employee.id}`,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      buffer: req.file.buffer,
    });
    res.status(201).json({
      ok:true,
      file:{
        name:req.file.originalname,
        storedName:stored.key,
        size:req.file.size,
        mimeType:req.file.mimetype,
        storageRef:stored.ref,
        private:true,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/upload/discard', requirePermission('employee_documents.manage'), async (req,res,next)=>{
  try {
    const parsed=z.object({employeeId:z.string().cuid(),storageRef:z.string().trim().refine(isPrivateStorageRef,'Referencia privada inválida')}).safeParse(req.body);
    if(!parsed.success) return res.status(400).json({ok:false,message:parsed.error.issues[0]?.message??'Datos inválidos'});
    const employee=await prisma.employee.findFirst({where:{id:parsed.data.employeeId,companyId:req.auth.companyId},select:{id:true}});
    if(!employee) return res.status(404).json({ok:false,message:'Empleado no encontrado'});
    const expectedPrefix=`private://${req.auth.companyId}/employee-${employee.id}/`;
    if(!parsed.data.storageRef.startsWith(expectedPrefix)) return res.status(403).json({ok:false,message:'La referencia no pertenece a este expediente'});
    const referenced=await prisma.employeeDocument.findFirst({where:{companyId:req.auth.companyId,fileUrl:parsed.data.storageRef},select:{id:true}});
    if(referenced) return res.status(409).json({ok:false,message:'El archivo ya está asociado a un documento y no puede descartarse'});
    await deletePrivateObject(parsed.data.storageRef);
    return res.json({ok:true});
  } catch(e){next(e)}
});

router.get('/:id/download', requirePermission('employee_documents.read'), async (req,res,next)=>{
  try {
    const document=await prisma.employeeDocument.findFirst({where:{id:req.params.id,companyId:req.auth.companyId}});
    if(!document) return res.status(404).json({ok:false,message:'Documento no encontrado'});
    if (!document.fileUrl) return res.status(404).json({ok:false,message:'El documento no tiene archivo asociado'});
    if (!isPrivateStorageRef(document.fileUrl)) {
      if (/^https?:\/\//i.test(document.fileUrl)) return res.redirect(302, document.fileUrl);
      return res.status(410).json({ok:false,message:'El archivo legado ya no está disponible en almacenamiento público.'});
    }
    const stored=await getPrivateObject(document.fileUrl);
    res.setHeader('Content-Type', stored.contentType || 'application/octet-stream');
    if(stored.contentLength) res.setHeader('Content-Length', String(stored.contentLength));
    const safeName=String(document.fileName||document.name||'documento').replace(/[\r\n"]/g,'_');
    res.setHeader('Content-Disposition', `inline; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`);
    res.setHeader('Cache-Control','private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    stored.body.on('error', next);
    stored.body.pipe(res);
  }catch(e){next(e)}
});

router.post('/', requirePermission('employee_documents.manage'), async (req,res,next)=>{
  try {
    const parsed=documentSchema.safeParse(req.body);
    if(!parsed.success) return res.status(400).json({ok:false,message:parsed.error.issues[0]?.message??'Datos inválidos'});
    const employee=await prisma.employee.findFirst({where:{id:parsed.data.employeeId,companyId:req.auth.companyId}});
    if(!employee) return res.status(404).json({ok:false,message:'Empleado no encontrado'});
    const document=await prisma.employeeDocument.create({data:{...parsed.data,companyId:req.auth.companyId,fileUrl:parsed.data.fileUrl||null,fileName:parsed.data.fileName||null,notes:parsed.data.notes||null}});
    await audit(req,'CREATE',document.id,`Documento ${document.name} agregado al expediente ${employee.employeeNumber}`);
    res.status(201).json({ok:true,document});
  } catch(e){next(e)}
});

router.put('/:id', requirePermission('employee_documents.manage'), async (req,res,next)=>{
  try {
    const parsed=documentSchema.safeParse(req.body);
    if(!parsed.success) return res.status(400).json({ok:false,message:parsed.error.issues[0]?.message??'Datos inválidos'});
    const exists=await prisma.employeeDocument.findFirst({where:{id:req.params.id,companyId:req.auth.companyId}});
    if(!exists) return res.status(404).json({ok:false,message:'Documento no encontrado'});
    const newFileUrl = parsed.data.fileUrl || null;
    const document=await prisma.employeeDocument.update({where:{id:exists.id},data:{...parsed.data,fileUrl:newFileUrl,fileName:parsed.data.fileName||null,notes:parsed.data.notes||null}});
    if (exists.fileUrl && exists.fileUrl !== newFileUrl) await removeStoredUpload(exists.fileUrl);
    await audit(req,'UPDATE',document.id,`Documento ${document.name} actualizado`);
    res.json({ok:true,document});
  } catch(e){next(e)}
});

router.patch('/:id/status', requirePermission('employee_documents.manage'), async (req,res,next)=>{
  try {
    const parsed=z.object({status:z.enum(['PENDING','VALID','EXPIRING','EXPIRED','REJECTED'])}).safeParse(req.body);
    if(!parsed.success) return res.status(400).json({ok:false,message:'Estado inválido'});
    const exists=await prisma.employeeDocument.findFirst({where:{id:req.params.id,companyId:req.auth.companyId}});
    if(!exists) return res.status(404).json({ok:false,message:'Documento no encontrado'});
    const document=await prisma.employeeDocument.update({where:{id:exists.id},data:{status:parsed.data.status}});
    await audit(req,'STATUS',document.id,`Estado de ${document.name}: ${document.status}`);
    res.json({ok:true,document});
  } catch(e){next(e)}
});

router.delete('/:id', requirePermission('employee_documents.manage'), async (req,res,next)=>{
  try {
    const exists=await prisma.employeeDocument.findFirst({where:{id:req.params.id,companyId:req.auth.companyId}});
    if(!exists) return res.status(404).json({ok:false,message:'Documento no encontrado'});
    await prisma.employeeDocument.delete({where:{id:exists.id}});
    await removeStoredUpload(exists.fileUrl);
    await audit(req,'DELETE',exists.id,`Documento ${exists.name} eliminado`);
    res.json({ok:true});
  } catch(e){next(e)}
});

export default router;
