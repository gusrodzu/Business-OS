import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('apps/web/src');
const exts=['','.js','.jsx','.mjs','.json'];
const missing=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())walk(p);else if(/\.(js|jsx|mjs)$/.test(e.name)){const s=fs.readFileSync(p,'utf8');const re=/(?:from\s+|import\s*\()(["'])(\.{1,2}\/[^"']+)\1/g;let m;while((m=re.exec(s))){const base=path.resolve(path.dirname(p),m[2]);const c=exts.map(x=>base+x).concat([path.join(base,'index.js'),path.join(base,'index.jsx')]);if(!c.some(fs.existsSync))missing.push(`${path.relative(root,p)} -> ${m[2]}`);}}}}
walk(root);
console.log(`Relative import audit · ${missing.length ? 'FAIL' : 'PASS'}`);
if(missing.length){for(const x of missing)console.error('MISSING',x);process.exit(1)}
