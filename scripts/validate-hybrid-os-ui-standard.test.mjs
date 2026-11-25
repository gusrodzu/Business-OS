import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
const read=path=>readFileSync(path,'utf8');
const root='apps/web/src';
test('shared hybrid tokens and public components are registered',()=>{
  const css=read(root+'/design-system/styles/workspace-hybrid-global.css');
  for(const token of ['--workspace-neutral-selected','--workspace-neutral-on-selected','--workspace-popup-surface','--workspace-action-primary'])assert.ok(css.includes(token),token);
  const exports=read(root+'/design-system/components/index.js');
  for(const name of ['BusinessSelect','useNotify','StatusMessage'])assert.ok(exports.includes(name),name);
  assert.match(read('AGENTS.md'),/HYBRID_OS_UI_STANDARD\.md/);
});
test('migrated module actions retain explicit asynchronous decisions',()=>{
  const files=['hr/ui/pages/Payroll.jsx','finance/ui/pages/Accounting.jsx','hr/ui/pages/EmployeeDocuments.jsx','finance/ui/pages/Budgets.jsx','finance/ui/pages/CashFlow.jsx','settings/ui/pages/ActivityCenter.jsx','operations/ui/pages/DataHub.jsx','settings/ui/pages/CompanySettings.jsx','procurement/ui/pages/Suppliers.jsx','crm/ui/pages/BusinessParties.jsx','operations/ui/pages/IntegrationHub.jsx','finance/ui/pages/BankReconciliation.jsx','finance/ui/pages/FixedAssets.jsx','procurement/ui/pages/ProcurementCenter.jsx','pos/ui/pages/Pos.jsx'];
  for(const file of files){
    const src=read(root+'/modules/'+file);
    assert.match(src,/useNotify\(\)/,file);
    assert.match(src,/await (confirmAction|promptAction)\(/,file);
    assert.doesNotMatch(src,/window\.(confirm|prompt)\(/,file);
  }
});
test('selected shared tabs preserve their color on hover',()=>{
  const css=read(root+'/design-system/components/Tabs.module.css');
  assert.match(css,/\.active,\.active:hover\{background:var\(--workspace-neutral-selected\);color:var\(--workspace-neutral-on-selected\)/);
});
