import {Router} from 'express';
import {z} from 'zod';
import {prisma} from '../lib/prisma.js';
import {requireAuth} from '../middleware/auth.js';
import {requirePermission} from '../middleware/permissions.js';
import {executiveDemoDashboard} from '../services/executiveDemo.js';
import {demoReadiness} from '../services/demoReadiness.js';

const router = Router();
router.use(requireAuth);
router.use(requirePermission('reports.read'));

const DAY_MS = 24 * 60 * 60 * 1000;
const querySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

function startOfYear() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
}

function endOfToday() {
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    23, 59, 59, 999,
  ));
}

function normalizeRangeBoundary(value, end = false) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return date;
  if (end) date.setUTCHours(23, 59, 59, 999);
  else date.setUTCHours(0, 0, 0, 0);
  return date;
}

function previousPeriod(from, to) {
  const span = to.getTime() - from.getTime() + 1;
  const previousTo = new Date(from.getTime() - 1);
  const previousFrom = new Date(previousTo.getTime() - span + 1);
  return {from: previousFrom, to: previousTo};
}

function monthKey(value) {
  const date = new Date(value);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key) {
  const [year, month] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('es-MX', {
    month: 'short',
    year: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function percentChange(current, previous) {
  const now = Number(current || 0);
  const before = Number(previous || 0);
  if (before === 0) return now === 0 ? 0 : 100;
  return Math.round(((now - before) / Math.abs(before)) * 1000) / 10;
}

function sum(rows, selector) {
  return rows.reduce((total, row) => total + Number(selector(row) || 0), 0);
}

function balanceAt(record) {
  const paid = sum(record.payments || [], (payment) => payment.amount);
  return Math.max(0, Number(record.total || 0) - paid);
}

function yearsBetween(from, to) {
  const years = [];
  for (let year = from.getUTCFullYear(); year <= to.getUTCFullYear(); year += 1) {
    years.push(year);
  }
  return years;
}

function budgetLineInRange(year, month, from, to) {
  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return monthStart <= to && monthEnd >= from;
}

function severityWeight(severity) {
  return {CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1}[severity] || 0;
}

router.get('/demo-readiness', async (req, res, next) => {
  try {
    res.json(await demoReadiness(req.auth.companyId));
  } catch (error) {
    next(error);
  }
});

router.get('/demo', async (req, res, next) => {
  try {
    res.json(await executiveDemoDashboard(req.auth.companyId));
  } catch (error) {
    next(error);
  }
});

router.get('/executive', async (req, res, next) => {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ok: false, message: 'Rango de fechas inválido'});
    }

    const from = parsed.data.from
      ? normalizeRangeBoundary(parsed.data.from)
      : startOfYear();
    const to = parsed.data.to
      ? normalizeRangeBoundary(parsed.data.to, true)
      : endOfToday();

    if (to < from) {
      return res.status(400).json({
        ok: false,
        message: 'La fecha final no puede ser anterior a la inicial',
      });
    }

    const companyId = req.auth.companyId;
    const dateRange = {gte: from, lte: to};
    const previous = previousPeriod(from, to);
    const previousDateRange = {gte: previous.from, lte: previous.to};
    const reportYears = yearsBetween(from, to);

    const [
      company,
      purchaseOrders,
      previousPurchaseOrders,
      accountsPayableSnapshot,
      accountsReceivableSnapshot,
      inventoryBalances,
      employees,
      payrollPeriods,
      previousPayrollPeriods,
      suppliers,
      customers,
      pendingPurchaseRequests,
      salesOrders,
      previousSalesOrders,
      customerPayments,
      previousCustomerPayments,
      treasuryAccounts,
      treasuryMovements,
      budgets,
      approvalRequests,
    ] = await Promise.all([
      prisma.company.findUnique({
        where: {id: companyId},
        select: {id: true, name: true, currency: true, timezone: true},
      }),
      prisma.purchaseOrder.findMany({
        where: {companyId, orderDate: dateRange, status: {not: 'CANCELLED'}},
        include: {supplier: true},
        orderBy: {orderDate: 'asc'},
      }),
      prisma.purchaseOrder.findMany({
        where: {companyId, orderDate: previousDateRange, status: {not: 'CANCELLED'}},
        select: {total: true},
      }),
      prisma.accountsPayable.findMany({
        where: {companyId, issueDate: {lte: to}, status: {not: 'CANCELLED'}},
        include: {
          supplier: true,
          payments: {
            where: {paymentDate: {lte: to}},
            select: {amount: true, paymentDate: true},
          },
        },
      }),
      prisma.accountsReceivable.findMany({
        where: {companyId, issueDate: {lte: to}, status: {not: 'CANCELLED'}},
        include: {
          customer: true,
          payments: {
            where: {paymentDate: {lte: to}},
            select: {amount: true, paymentDate: true},
          },
        },
      }),
      prisma.inventoryBalance.findMany({
        where: {warehouse: {branch: {companyId}}},
        include: {product: true, warehouse: {include: {branch: true}}},
      }),
      prisma.employee.findMany({
        where: {companyId},
        include: {department: true},
      }),
      prisma.payrollPeriod.findMany({
        where: {companyId, paymentDate: dateRange, status: {not: 'CANCELLED'}},
      }),
      prisma.payrollPeriod.findMany({
        where: {companyId, paymentDate: previousDateRange, status: {not: 'CANCELLED'}},
        select: {totalNet: true},
      }),
      prisma.supplier.findMany({where: {companyId, active: true}}),
      prisma.customer.findMany({where: {companyId, active: true}}),
      prisma.purchaseRequest.findMany({
        where: {companyId, status: {in: ['DRAFT', 'PENDING']}},
        select: {id: true, folio: true, status: true, createdAt: true},
      }),
      prisma.salesOrder.findMany({
        where: {
          companyId,
          orderDate: dateRange,
          status: {notIn: ['DRAFT', 'CANCELLED']},
        },
        include: {customer: true},
        orderBy: {orderDate: 'asc'},
      }),
      prisma.salesOrder.findMany({
        where: {
          companyId,
          orderDate: previousDateRange,
          status: {notIn: ['DRAFT', 'CANCELLED']},
        },
        select: {total: true},
      }),
      prisma.customerPayment.findMany({
        where: {companyId, paymentDate: dateRange},
        select: {amount: true, paymentDate: true},
      }),
      prisma.customerPayment.findMany({
        where: {companyId, paymentDate: previousDateRange},
        select: {amount: true},
      }),
      prisma.treasuryAccount.findMany({
        where: {companyId, active: true},
        select: {id: true, name: true, type: true, currency: true, currentBalance: true},
      }),
      prisma.treasuryMovement.findMany({
        where: {companyId, movementDate: dateRange},
        select: {movementDate: true, amount: true, type: true, category: true},
      }),
      prisma.budget.findMany({
        where: {
          companyId,
          year: {in: reportYears},
          status: {in: ['ACTIVE', 'CLOSED']},
        },
        include: {
          lines: {select: {month: true, amount: true, category: true}},
        },
      }),
      prisma.approvalRequest.findMany({
        where: {companyId, status: 'PENDING'},
        orderBy: {requestedAt: 'asc'},
        select: {
          id: true,
          title: true,
          entityType: true,
          entityFolio: true,
          amount: true,
          currency: true,
          requestedAt: true,
        },
      }),
    ]);

    const purchaseTotal = sum(purchaseOrders, (row) => row.total);
    const previousPurchaseTotal = sum(previousPurchaseOrders, (row) => row.total);
    const salesTotal = sum(salesOrders, (row) => row.total);
    const previousSalesTotal = sum(previousSalesOrders, (row) => row.total);
    const collectionsTotal = sum(customerPayments, (row) => row.amount);
    const previousCollectionsTotal = sum(previousCustomerPayments, (row) => row.amount);
    const payrollNet = sum(payrollPeriods, (row) => row.totalNet);
    const previousPayrollNet = sum(previousPayrollPeriods, (row) => row.totalNet);

    const payableBalance = sum(accountsPayableSnapshot, balanceAt);
    const receivableBalance = sum(accountsReceivableSnapshot, balanceAt);
    const inventoryValue = sum(
      inventoryBalances,
      (row) => Number(row.quantity) * Number(row.averageCost),
    );
    const liquidity = sum(treasuryAccounts, (row) => row.currentBalance);

    const overduePayables = accountsPayableSnapshot.filter(
      (row) => balanceAt(row) > 0 && new Date(row.dueDate) < to,
    );
    const overdueReceivables = accountsReceivableSnapshot.filter(
      (row) => balanceAt(row) > 0 && new Date(row.dueDate) < to,
    );
    const overduePayablesTotal = sum(overduePayables, balanceAt);
    const overdueReceivablesTotal = sum(overdueReceivables, balanceAt);

    const cashIn = sum(
      treasuryMovements.filter((row) => ['INCOME', 'ADJUSTMENT_IN'].includes(row.type)),
      (row) => row.amount,
    );
    const cashOut = sum(
      treasuryMovements.filter((row) => ['EXPENSE', 'ADJUSTMENT_OUT'].includes(row.type)),
      (row) => row.amount,
    );

    const budgetPlanned = budgets.reduce((total, budget) => {
      const lines = budget.lines.filter((line) =>
        budgetLineInRange(budget.year, line.month, from, to),
      );
      return total + sum(lines, (line) => line.amount);
    }, 0);

    const payableExpensesInRange = accountsPayableSnapshot.filter(
      (row) => row.issueDate >= from && row.issueDate <= to,
    );
    const budgetActual = cashOut + sum(payableExpensesInRange, (row) => row.total);
    const budgetVariance = budgetPlanned - budgetActual;
    const budgetUtilization = budgetPlanned > 0
      ? Math.round((budgetActual / budgetPlanned) * 1000) / 10
      : 0;

    const commercialBalance = salesTotal - purchaseTotal;
    const previousCommercialBalance = previousSalesTotal - previousPurchaseTotal;

    const monthly = new Map();
    function addMonthly(date, field, amount) {
      const key = monthKey(date);
      const current = monthly.get(key) ?? {
        key,
        label: monthLabel(key),
        sales: 0,
        collections: 0,
        purchases: 0,
        payroll: 0,
      };
      current[field] += Number(amount || 0);
      monthly.set(key, current);
    }

    salesOrders.forEach((row) => addMonthly(row.orderDate, 'sales', row.total));
    customerPayments.forEach((row) => addMonthly(row.paymentDate, 'collections', row.amount));
    purchaseOrders.forEach((row) => addMonthly(row.orderDate, 'purchases', row.total));
    payrollPeriods.forEach((row) => addMonthly(row.paymentDate, 'payroll', row.totalNet));

    const supplierSpendMap = new Map();
    purchaseOrders.forEach((row) => {
      const key = row.supplierId;
      supplierSpendMap.set(key, {
        id: key,
        name: row.supplier.commercialName || row.supplier.legalName,
        total: (supplierSpendMap.get(key)?.total ?? 0) + Number(row.total),
        orders: (supplierSpendMap.get(key)?.orders ?? 0) + 1,
      });
    });

    const customerBalanceMap = new Map();
    accountsReceivableSnapshot.forEach((row) => {
      const balance = balanceAt(row);
      if (balance <= 0) return;
      const key = row.customerId;
      customerBalanceMap.set(key, {
        id: key,
        name: row.customer.commercialName || row.customer.legalName,
        balance: (customerBalanceMap.get(key)?.balance ?? 0) + balance,
        invoices: (customerBalanceMap.get(key)?.invoices ?? 0) + 1,
      });
    });

    const departmentMap = new Map();
    employees.forEach((row) => {
      const key = row.department?.id ?? 'none';
      const name = row.department?.name ?? 'Sin departamento';
      departmentMap.set(key, {
        id: key,
        name,
        employees: (departmentMap.get(key)?.employees ?? 0) + 1,
        payroll: (departmentMap.get(key)?.payroll ?? 0) + Number(row.salary),
      });
    });

    const criticalStockRows = inventoryBalances
      .filter((row) => Number(row.quantity) <= Number(row.product.minStock))
      .map((row) => ({
        product: row.product.name,
        sku: row.product.sku,
        warehouse: row.warehouse.name,
        branch: row.warehouse.branch.name,
        quantity: Number(row.quantity),
        minStock: Number(row.product.minStock),
      }))
      .sort((a, b) => a.quantity - b.quantity);
    const lowStock = criticalStockRows.slice(0, 12);

    const overdueReceivableRatio = receivableBalance > 0
      ? overdueReceivablesTotal / receivableBalance
      : 0;
    const overduePayableRatio = payableBalance > 0
      ? overduePayablesTotal / payableBalance
      : 0;
    const criticalStockRatio = inventoryBalances.length > 0
      ? criticalStockRows.length / inventoryBalances.length
      : 0;

    const healthPenalties = {
      receivables: Math.min(25, Math.round(overdueReceivableRatio * 50)),
      payables: Math.min(20, Math.round(overduePayableRatio * 40)),
      inventory: Math.min(15, Math.round(criticalStockRatio * 100)),
      approvals: Math.min(10, approvalRequests.length * 2),
      budget: budgetUtilization > 100
        ? Math.min(15, Math.round((budgetUtilization - 100) / 2))
        : 0,
      liquidity: liquidity < 0
        ? 15
        : overduePayablesTotal > 0 && liquidity < overduePayablesTotal
          ? 10
          : 0,
    };
    const healthScore = Math.max(
      0,
      100 - Object.values(healthPenalties).reduce((total, value) => total + value, 0),
    );
    const healthStatus = healthScore >= 85
      ? 'HEALTHY'
      : healthScore >= 70
        ? 'ATTENTION'
        : 'RISK';

    const decisions = [];
    if (overdueReceivablesTotal > 0) {
      decisions.push({
        id: 'overdue-receivables',
        severity: overdueReceivableRatio >= 0.3 ? 'CRITICAL' : 'HIGH',
        title: 'Cobranza vencida requiere seguimiento',
        detail: `${overdueReceivables.length} cuenta(s) presentan saldo vencido.`,
        value: overdueReceivablesTotal,
        valueType: 'currency',
        route: '/finanzas/cuentas-por-cobrar',
      });
    }
    if (overduePayablesTotal > 0) {
      decisions.push({
        id: 'overdue-payables',
        severity: liquidity < overduePayablesTotal ? 'CRITICAL' : 'HIGH',
        title: 'Pagos vencidos con proveedores',
        detail: `${overduePayables.length} cuenta(s) por pagar ya vencieron.`,
        value: overduePayablesTotal,
        valueType: 'currency',
        route: '/finanzas/cuentas-por-pagar',
      });
    }
    if (approvalRequests.length > 0) {
      decisions.push({
        id: 'pending-approvals',
        severity: approvalRequests.length >= 5 ? 'HIGH' : 'MEDIUM',
        title: 'Aprobaciones pendientes de decisión',
        detail: `${approvalRequests.length} solicitud(es) siguen esperando resolución.`,
        value: approvalRequests.length,
        valueType: 'count',
        route: '/aprobaciones',
      });
    }
    if (criticalStockRows.length > 0) {
      decisions.push({
        id: 'critical-stock',
        severity: criticalStockRows.length >= 5 ? 'HIGH' : 'MEDIUM',
        title: 'Inventario en nivel crítico',
        detail: `${criticalStockRows.length} producto(s) están en o por debajo del mínimo.`,
        value: criticalStockRows.length,
        valueType: 'count',
        route: '/inventario/existencias',
      });
    }
    if (budgetPlanned > 0 && budgetUtilization > 100) {
      decisions.push({
        id: 'budget-overrun',
        severity: budgetUtilization >= 115 ? 'HIGH' : 'MEDIUM',
        title: 'Ejecución por encima del presupuesto',
        detail: `El gasto acumulado equivale a ${budgetUtilization}% del presupuesto del periodo.`,
        value: budgetActual - budgetPlanned,
        valueType: 'currency',
        route: '/finanzas/presupuestos',
      });
    }
    const salesChange = percentChange(salesTotal, previousSalesTotal);
    if (salesChange <= -10) {
      decisions.push({
        id: 'sales-down',
        severity: salesChange <= -25 ? 'HIGH' : 'MEDIUM',
        title: 'Ventas por debajo del periodo anterior',
        detail: `Las ventas disminuyeron ${Math.abs(salesChange)}% contra el periodo comparable.`,
        value: salesChange,
        valueType: 'percent',
        route: '/ventas',
      });
    }

    decisions.sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity));

    const comparison = {
      purchaseTotal: {
        previous: previousPurchaseTotal,
        changePct: percentChange(purchaseTotal, previousPurchaseTotal),
      },
      salesTotal: {
        previous: previousSalesTotal,
        changePct: salesChange,
      },
      collectionsTotal: {
        previous: previousCollectionsTotal,
        changePct: percentChange(collectionsTotal, previousCollectionsTotal),
      },
      payrollNet: {
        previous: previousPayrollNet,
        changePct: percentChange(payrollNet, previousPayrollNet),
      },
      commercialBalance: {
        previous: previousCommercialBalance,
        changePct: percentChange(commercialBalance, previousCommercialBalance),
      },
    };

    res.json({
      ok: true,
      company,
      range: {from, to},
      previousRange: previous,
      generatedAt: new Date(),
      summary: {
        salesTotal,
        purchaseTotal,
        collectionsTotal,
        commercialBalance,
        payableBalance,
        receivableBalance,
        inventoryValue,
        payrollNet,
        liquidity,
        cashIn,
        cashOut,
        activeEmployees: employees.filter((row) => row.status === 'ACTIVE').length,
        suppliers: suppliers.length,
        customers: customers.length,
        pendingPurchaseRequests: pendingPurchaseRequests.length,
        criticalStock: criticalStockRows.length,
        pendingApprovals: approvalRequests.length,
        pendingApprovalAmount: sum(approvalRequests, (row) => row.amount),
        overduePayables: overduePayablesTotal,
        overdueReceivables: overdueReceivablesTotal,
        budgetPlanned,
        budgetActual,
        budgetVariance,
        budgetUtilization,
      },
      comparison,
      health: {
        score: healthScore,
        status: healthStatus,
        factors: {
          overdueReceivables: overdueReceivableRatio,
          overduePayables: overduePayableRatio,
          criticalStock: criticalStockRatio,
          pendingApprovals: approvalRequests.length,
          budgetUtilization,
          liquidity,
        },
      },
      decisions: decisions.slice(0, 8),
      monthly: [...monthly.values()].sort((a, b) => a.key.localeCompare(b.key)),
      supplierSpend: [...supplierSpendMap.values()]
        .sort((a, b) => b.total - a.total)
        .slice(0, 8),
      customerBalances: [...customerBalanceMap.values()]
        .sort((a, b) => b.balance - a.balance)
        .slice(0, 8),
      departments: [...departmentMap.values()].sort((a, b) => b.employees - a.employees),
      lowStock,
      approvals: approvalRequests.slice(0, 8),
      dataSources: [
        'Ventas',
        'Compras',
        'Cuentas por pagar',
        'Cuentas por cobrar',
        'Tesorería',
        'Presupuestos',
        'Inventario',
        'RR. HH.',
        'Nómina',
        'Aprobaciones',
      ],
    });
  } catch (error) {
    next(error);
  }
});

export default router;
