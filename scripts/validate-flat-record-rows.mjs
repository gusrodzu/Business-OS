import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(relative)=>readFileSync(path.join(root,relative),'utf8');
const enterprise=read('apps/web/src/design-system/styles/enterprise-ui-v26.css');
const legacy=read('apps/web/src/design-system/styles/unified-ui.css');
const marketing=read('apps/web/src/modules/crm/ui/pages/Marketing.jsx');
const production=read('apps/web/src/modules/production/ui/pages/Production.jsx');
const qa=read('scripts/audit-smartphone-browser.mjs');
const assertRule=(label,passed)=>{assert.ok(passed,label);console.log('PASS · '+label)};

assertRule('Legacy 999px native button selector identified',
  legacy.includes('padding-inline:16px;border-radius:999px'));
assertRule('Only direct tabular row buttons are targeted',
  enterprise.includes('Record rows are not action pills')&&enterprise.includes(') > button{')
  && enterprise.includes('[class*="_performanceTable_"]')
  && enterprise.includes('[class*="_rankList_"]')
  && enterprise.includes('[class*="_schedule_"]')
  && enterprise.includes('[class*="_orderList_"]')
  && enterprise.includes('[class*="_table_"]'));
assertRule('No pills or card borders on rows',
  enterprise.includes('border-radius:0!important')
  && enterprise.includes('border:0!important')
  && enterprise.includes('border-bottom:1px solid var(--bb26-border)!important'));
assertRule('Table row hover/focus and multi-line text supported',
  enterprise.includes('white-space:normal!important')
  && enterprise.includes('button:hover:not(:disabled)')
  && enterprise.includes('button:focus-visible'));
assertRule('Status badges and global action buttons not modified',
  !enterprise.includes('[class*="_badge_"] > button')
  && !enterprise.includes('[class*="_chip_"] > button')
  && !enterprise.includes('button:not([data-ui-surface])'));
assertRule('Marketing campaign and attribution actions retained',
  marketing.includes('className={styles.performanceTable}')
  && marketing.includes('className={styles.rankList}')
  && marketing.includes('className={styles.table}')
  && marketing.includes('onClick={()=>onSelect(c.id)}'));
assertRule('Production list navigation retained',
  production.includes('className={styles.schedule}')
  && production.includes('className={styles.orderList}')
  && production.includes('onClick={()=>onSelect(o.id)}'));
assertRule('Browser QA verifies actual computed radius across two widths',
  qa.includes('Record row still has pill geometry')
  && qa.includes("route.slug==='marketing'")
  && qa.includes("route.slug==='produccion'")
  && qa.includes('const width of [390,1440]'));
console.log('PASS · Enterprise flat record rows contract');
