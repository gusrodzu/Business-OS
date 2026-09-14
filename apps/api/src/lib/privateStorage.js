import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {Readable} from 'node:stream';
import {fileURLToPath} from 'node:url';

const PRIVATE_SCHEME = 'private://';
const DRIVER = String(process.env.PRIVATE_STORAGE_DRIVER || 'local').trim().toLowerCase();
const LOCAL_ROOT = path.resolve(process.env.PRIVATE_STORAGE_DIR || fileURLToPath(new URL('../../private_uploads', import.meta.url)));

function sanitizeSegment(value, fallback = 'item') {
  const safe = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
  return safe || fallback;
}

function extensionFor(filename) {
  const extension = path.extname(String(filename || '')).toLowerCase();
  return /^\.[a-z0-9]{1,10}$/.test(extension) ? extension : '';
}

function objectKey({companyId, scope, filename}) {
  const company = sanitizeSegment(companyId, 'company');
  const area = sanitizeSegment(scope, 'documents');
  const extension = extensionFor(filename);
  return `${company}/${area}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}${extension}`;
}

export function isPrivateStorageRef(value) {
  return typeof value === 'string' && value.startsWith(PRIVATE_SCHEME);
}

export function privateStorageKey(value) {
  if (!isPrivateStorageRef(value)) return null;
  const key = value.slice(PRIVATE_SCHEME.length);
  if (!key || key.includes('..') || key.startsWith('/') || key.includes('\\')) throw new Error('Referencia privada inválida');
  return key;
}

function toPrivateRef(key) {
  return `${PRIVATE_SCHEME}${key}`;
}

function localTarget(key) {
  const target = path.resolve(LOCAL_ROOT, key);
  if (target !== LOCAL_ROOT && !target.startsWith(`${LOCAL_ROOT}${path.sep}`)) throw new Error('Ruta privada inválida');
  return target;
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function hmac(key, value, encoding) {
  return crypto.createHmac('sha256', key).update(value).digest(encoding);
}

function s3Config() {
  const endpoint = String(process.env.S3_ENDPOINT || '').trim().replace(/\/$/, '');
  const bucket = String(process.env.S3_BUCKET || '').trim();
  const accessKeyId = String(process.env.S3_ACCESS_KEY_ID || '').trim();
  const secretAccessKey = String(process.env.S3_SECRET_ACCESS_KEY || '').trim();
  const region = String(process.env.S3_REGION || 'auto').trim();
  const sessionToken = String(process.env.S3_SESSION_TOKEN || '').trim();
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error('Storage S3 incompleto: configura S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID y S3_SECRET_ACCESS_KEY');
  }
  return {endpoint, bucket, accessKeyId, secretAccessKey, region, sessionToken};
}

function encodeKey(key) {
  return key.split('/').map((part) => encodeURIComponent(part)).join('/');
}

async function s3Request(method, key, {body = null, contentType = null} = {}) {
  const config = s3Config();
  const url = new URL(`${config.endpoint}/${encodeURIComponent(config.bucket)}/${encodeKey(key)}`);
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const payload = body == null ? Buffer.alloc(0) : Buffer.isBuffer(body) ? body : Buffer.from(body);
  const payloadHash = sha256(payload);
  const canonical = {
    host: url.host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
  };
  if (config.sessionToken) canonical['x-amz-security-token'] = config.sessionToken;
  const signedHeaderNames = Object.keys(canonical).sort();
  const canonicalHeaders = signedHeaderNames.map((name) => `${name}:${String(canonical[name]).trim()}\n`).join('');
  const signedHeaders = signedHeaderNames.join(';');
  const canonicalRequest = [method, url.pathname, '', canonicalHeaders, signedHeaders, payloadHash].join('\n');
  const scope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256(canonicalRequest)].join('\n');
  const dateKey = hmac(`AWS4${config.secretAccessKey}`, dateStamp);
  const regionKey = hmac(dateKey, config.region);
  const serviceKey = hmac(regionKey, 's3');
  const signingKey = hmac(serviceKey, 'aws4_request');
  const signature = hmac(signingKey, stringToSign, 'hex');
  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  const headers = {...canonical, Authorization: authorization};
  if (contentType) headers['Content-Type'] = contentType;
  const response = await fetch(url, {method, headers, body: method === 'PUT' ? payload : undefined});
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Storage S3 respondió ${response.status}${detail ? `: ${detail.slice(0, 300)}` : ''}`);
  }
  return response;
}

export function privateStorageDriver() {
  return DRIVER;
}

export function validatePrivateStorageConfiguration() {
  if (!['local', 's3'].includes(DRIVER)) throw new Error(`PRIVATE_STORAGE_DRIVER no soportado: ${DRIVER}`);
  if (DRIVER === 's3') s3Config();
  return DRIVER;
}

export async function putPrivateObject({companyId, scope, filename, mimeType, buffer}) {
  if (!Buffer.isBuffer(buffer)) throw new Error('El archivo privado debe recibirse como Buffer');
  const key = objectKey({companyId, scope, filename});
  if (DRIVER === 's3') {
    await s3Request('PUT', key, {body: buffer, contentType: mimeType || 'application/octet-stream'});
  } else {
    const target = localTarget(key);
    await fs.mkdir(path.dirname(target), {recursive: true});
    await fs.writeFile(target, buffer, {mode: 0o600});
  }
  return {key, ref: toPrivateRef(key), driver: DRIVER};
}

export async function deletePrivateObject(ref) {
  const key = privateStorageKey(ref);
  if (!key) return false;
  if (DRIVER === 's3') {
    await s3Request('DELETE', key);
  } else {
    await fs.unlink(localTarget(key)).catch((error) => {
      if (error?.code !== 'ENOENT') throw error;
    });
  }
  return true;
}

export async function getPrivateObject(ref) {
  const key = privateStorageKey(ref);
  if (!key) throw new Error('Referencia privada inválida');
  if (DRIVER === 's3') {
    const response = await s3Request('GET', key);
    return {
      body: response.body ? Readable.fromWeb(response.body) : Readable.from([]),
      contentType: response.headers.get('content-type') || 'application/octet-stream',
      contentLength: Number(response.headers.get('content-length') || 0) || null,
    };
  }
  const target = localTarget(key);
  const stat = await fs.stat(target);
  return {body: Readable.from(await fs.readFile(target)), contentType: 'application/octet-stream', contentLength: stat.size};
}
