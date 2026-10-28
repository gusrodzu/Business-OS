import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const skillDir='.agents/skills/business-os-ui-ux';
const read=(file)=>readFileSync(path.join(root,file),'utf8');
const ok=(label,condition)=>{assert.ok(condition,label);console.log('PASS · '+label);};

const skill=read(skillDir+'/SKILL.md');
const frontmatter=skill.match(/^---\n([\s\S]*?)\n---/);
ok('Repository skill has valid frontmatter',Boolean(frontmatter)
  && /^name:\s*business-os-ui-ux$/m.test(frontmatter[1])
  && /^description:\s*.+$/m.test(frontmatter[1]));
ok('Business OS constraints are retained',skill.includes('cards KPI rectangulares')
  && skill.includes('Navegación de dos niveles')
  && skill.includes('multiempresa') && skill.includes('React/Vite'));

const references=[
  ['Dashboard SaaS UI','dashboard-saas-ui.md',['KPI','tablas','empresa']],
  ['Design System Builder','design-system-builder.md',['tokens','CSS Modules','componentes']],
  ['Design to Code','design-to-code.md',['React','rutas','permisos']],
  ['Mobile App UI','mobile-app-ui.md',['Expo','PWA','safe areas']],
  ['Accessibility Audit','accessibility-audit.md',['WCAG 2.2 AA','foco','contraste']],
];
for(const [name,basename,keywords] of references){
  const file=skillDir+'/references/'+basename;
  ok(name+' is linked in SKILL.md',skill.includes('references/'+basename));
  ok(name+' contains project-specific instructions',existsSync(path.join(root,file))
    && keywords.every(keyword=>read(file).includes(keyword))
    && read(file).length>550);
}
const links=[...skill.matchAll(/references\/([a-z0-9-]+\.md)/g)].map(x=>x[1]);
ok('All linked reference documents exist',links.length>=8
  && links.every(file=>existsSync(path.join(root,skillDir,'references',file))));
const readme=read(skillDir+'/README.md');
ok('Codex activation documented',readme.includes('$business-os-ui-ux')
  && references.every(([name])=>readme.includes(name)));
const qa=read(skillDir+'/references/qa-release.md');
ok('Five capabilities have QA gates',references.every(([name])=>qa.includes(name)));
ok('Skill does not add plugin marketing to the repository',
  !skill.includes('aidesigner.ai') && references.every(([,name])=>!read(skillDir+'/references/'+name).includes('aidesigner.ai')));
console.log('PASS · Business OS UI/UX skill v2 — five capabilities validated');
