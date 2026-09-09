import accountsPayableRouter from './api/accountsPayable.js';
import accountsReceivableRouter from './api/accountsReceivable.js';
import treasuryRouter from './api/treasury.js';
import budgetsRouter from './api/budgets.js';
import collectionsRouter from './api/collections.js';
import bankReconciliationRouter from './api/bankReconciliation.js';
import cashFlowRouter from './api/cashFlow.js';
import accountingRouter from './api/accounting.js';
import expensesRouter from './api/expenses.js';
import fixedAssetsRouter from './api/fixedAssets.js';
import fiscalRouter from './api/fiscal.js';

export default {
  id: 'finance',
  routes: [
    {path: '/api/accounts-payable', router: accountsPayableRouter},
    {path: '/api/accounts-receivable', router: accountsReceivableRouter},
    {path: '/api/treasury', router: treasuryRouter},
    {path: '/api/budgets', router: budgetsRouter},
    {path: '/api/collections', router: collectionsRouter},
    {path: '/api/bank-reconciliation', router: bankReconciliationRouter},
    {path: '/api/cash-flow', router: cashFlowRouter},
    {path: '/api/accounting', router: accountingRouter},
    {path: '/api/expenses', router: expensesRouter},
    {path: '/api/fixed-assets', router: fixedAssetsRouter},
    {path: '/api/fiscal', router: fiscalRouter},
  ],
};
