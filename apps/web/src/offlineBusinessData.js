/**
 * Datos transversales de MotorNorte para la Demo Local.
 *
 * Este archivo mantiene una sola historia de negocio para todos los módulos:
 * los mismos productos, clientes, proveedores, empleados, almacenes y folios se
 * reutilizan desde compras hasta contabilidad. No realiza ninguna petición de red.
 */
export function createOfflineBusinessData(context) {
  const {
    company,
    user,
    products,
    categories,
    warehouses,
    employees,
    departments,
    positions,
    branches,
    customers,
    suppliers,
    purchaseRequests,
  } = context;

  const stamp = '2026-09-13T16:30:00.000Z';
  const createdBy = user;
  const withFiscalProfile = (customer, postalCode = '64000') => ({
    ...customer,
    fiscalProfile: {
      rfc: customer.taxId,
      legalName: customer.legalName,
      fiscalRegime: '601',
      postalCode,
      defaultUseCfdi: 'G03',
      countryCode: 'MEX',
    },
  });

  const inventoryBalances = products.flatMap((product, productIndex) =>
    warehouses.map((warehouse, warehouseIndex) => {
      const quantity = Math.max(2, 54 - productIndex * 4 - warehouseIndex * 9);
      const reserved = (productIndex + warehouseIndex) % 4;
      return {
        id: `bal-${product.id}-${warehouse.id}`,
        productId: product.id,
        warehouseId: warehouse.id,
        product,
        warehouse,
        quantity,
        reserved,
        available: quantity - reserved,
        minStock: product.minStock,
        inventoryValue: quantity * product.cost,
        updatedAt: stamp,
      };
    }),
  );

  const demoPurchaseRequests = purchaseRequests.map((request, index) => ({
    ...request,
    folio: request.folio,
    title: request.concept,
    justification: index === 0
      ? 'Recuperar cobertura de baterías y frenos de alta rotación.'
      : index === 1
        ? 'Cubrir el consumo proyectado de talleres y mostrador para dos semanas.'
        : 'Preparar surtido de suspensión para la nueva sucursal de San Luis Potosí.',
    status: index === 1 ? 'PENDING' : 'APPROVED',
    priority: index === 1 ? 'URGENT' : 'HIGH',
    warehouseId: warehouses[index % warehouses.length].id,
    warehouse: warehouses[index % warehouses.length],
    requestedBy: employees[[2, 7, 3][index]],
    submittedAt: request.createdAt,
    resolvedAt: index === 1 ? null : '2026-09-12T12:15:00.000Z',
    requiredDate: ['2026-09-14', '2026-09-16', '2026-09-20'][index],
    items: index === 0
      ? [{id: 'pri-1', productId: products[0].id, product: products[0], quantity: 12, estimatedUnitCost: products[0].cost}, {id: 'pri-2', productId: products[1].id, product: products[1], quantity: 46, estimatedUnitCost: products[1].cost}]
      : index === 1
        ? [{id: 'pri-3', productId: products[3].id, product: products[3], quantity: 160, estimatedUnitCost: products[3].cost}, {id: 'pri-4', productId: products[5].id, product: products[5], quantity: 28, estimatedUnitCost: products[5].cost}]
        : [{id: 'pri-5', productId: products[2].id, product: products[2], quantity: 24, estimatedUnitCost: products[2].cost}, {id: 'pri-6', productId: products[7].id, product: products[7], quantity: 22, estimatedUnitCost: products[7].cost}],
  }));

  const purchaseOrders = [
    {
      id: 'po1', folio: 'OC-REF-2026-0381', supplierId: suppliers[0].id,
      supplier: suppliers[0], warehouseId: warehouses[0].id, warehouse: warehouses[0],
      status: 'PARTIALLY_RECEIVED', issueDate: '2026-09-08', expectedDate: '2026-09-14',
      orderDate: '2026-09-08', currency: 'MXN', purchaseRequest: demoPurchaseRequests[0],
      paymentTerms: 30, subtotal: 59008.62, taxAmount: 9441.38, total: 68450,
      items: [
        {id: 'poi-1', productId: products[0].id, product: products[0], quantity: 12, receivedQuantity: 8, unitCost: 2260, taxRate: 16, lineTotal: 31459.2, total: 31459.2},
        {id: 'poi-2', productId: products[1].id, product: products[1], quantity: 46, receivedQuantity: 24, unitCost: 690, taxRate: 16, lineTotal: 36794.4, total: 36794.4},
      ],
    },
    {
      id: 'po2', folio: 'OC-REF-2026-0384', supplierId: suppliers[1].id,
      supplier: suppliers[1], warehouseId: warehouses[1].id, warehouse: warehouses[1],
      status: 'ISSUED', issueDate: '2026-09-10', expectedDate: '2026-09-16',
      orderDate: '2026-09-10', currency: 'MXN', purchaseRequest: demoPurchaseRequests[1],
      paymentTerms: 30, subtotal: 123146.55, taxAmount: 19703.45, total: 142850,
      items: [
        {id: 'poi-3', productId: products[1].id, product: products[1], quantity: 120, receivedQuantity: 0, unitCost: 690, taxRate: 16, lineTotal: 96048, total: 96048},
        {id: 'poi-4', productId: products[6].id, product: products[6], quantity: 53, receivedQuantity: 0, unitCost: 760, taxRate: 16, lineTotal: 46724.8, total: 46724.8},
      ],
    },
    {
      id: 'po3', folio: 'OC-REF-2026-0389', supplierId: suppliers[3].id,
      supplier: suppliers[3], warehouseId: warehouses[2].id, warehouse: warehouses[2],
      status: 'ISSUED', issueDate: '2026-09-11', expectedDate: '2026-09-15',
      orderDate: '2026-09-11', currency: 'MXN', purchaseRequest: demoPurchaseRequests[2],
      paymentTerms: 15, subtotal: 102879.31, taxAmount: 16460.69, total: 119340,
      items: [
        {id: 'poi-5', productId: products[3].id, product: products[3], quantity: 300, receivedQuantity: 0, unitCost: 78, taxRate: 16, lineTotal: 27144, total: 27144},
        {id: 'poi-6', productId: products[5].id, product: products[5], quantity: 115, receivedQuantity: 0, unitCost: 690, taxRate: 16, lineTotal: 92046, total: 92046},
      ],
    },
  ];

  purchaseOrders.push({
    ...purchaseOrders[2], id: 'po-previous', folio: 'OC-REF-2026-0372', status: 'RECEIVED',
    issueDate: '2026-09-04', orderDate: '2026-09-04', expectedDate: '2026-09-09',
  });

  const receipts = [
    {
      id: 'rec-1', folio: 'REC-REF-2026-0217', purchaseOrderId: purchaseOrders[0].id,
      purchaseOrder: purchaseOrders[0], warehouseId: warehouses[0].id, warehouse: warehouses[0],
      receivedAt: '2026-09-11T10:25:00.000Z', supplierDocument: 'REM-LTH-94018',
      notes: 'Entrega parcial; cuatro baterías quedan en tránsito.', createdBy,
      items: [
        {id: 'reci-1', productId: products[0].id, product: products[0], quantity: 8},
        {id: 'reci-2', productId: products[1].id, product: products[1], quantity: 24},
      ],
    },
    {
      id: 'rec-2', folio: 'REC-REF-2026-0213', purchaseOrderId: 'po-previous',
      purchaseOrder: purchaseOrders[3],
      warehouseId: warehouses[1].id, warehouse: warehouses[1], receivedAt: '2026-09-09T14:05:00.000Z',
      supplierDocument: 'FIL-REM-19320', notes: 'Recepción completa sin diferencias.', createdBy,
      items: [
        {id: 'reci-3', productId: products[3].id, product: products[3], quantity: 180},
        {id: 'reci-4', productId: products[5].id, product: products[5], quantity: 40},
      ],
    },
  ];

  const inventoryMovements = [
    {id: 'mov-1', occurredAt: '2026-09-13T09:12:00.000Z', type: 'SALE', product: products[1], warehouse: warehouses[0], reference: 'POS-006842', quantity: -1, balanceAfter: 28, createdBy: employees[1]},
    {id: 'mov-2', occurredAt: '2026-09-12T17:40:00.000Z', type: 'TRANSFER_OUT', product: products[3], warehouse: warehouses[0], reference: 'TRF-2026-0088', quantity: -20, balanceAfter: 46, createdBy: employees[2]},
    {id: 'mov-3', occurredAt: '2026-09-12T17:40:00.000Z', type: 'TRANSFER_IN', product: products[3], warehouse: warehouses[1], reference: 'TRF-2026-0088', quantity: 20, balanceAfter: 37, createdBy: employees[7]},
    {id: 'mov-4', occurredAt: '2026-09-11T10:25:00.000Z', type: 'RECEIPT', product: products[0], warehouse: warehouses[0], reference: 'REC-REF-2026-0217', quantity: 8, balanceAfter: 14, createdBy},
    {id: 'mov-5', occurredAt: '2026-09-10T18:10:00.000Z', type: 'ADJUSTMENT', product: products[7], warehouse: warehouses[1], reference: 'AJU-2026-0034', quantity: -2, balanceAfter: 2, createdBy: employees[7]},
  ];

  const inventoryTransfers = [
    {id: 'trf-1', folio: 'TRF-2026-0088', fromWarehouse: warehouses[0], toWarehouse: warehouses[1], occurredAt: '2026-09-12', status: 'APPLIED', createdBy: employees[2], items: [{id: 'trfi-1', product: products[3], productId: products[3].id, quantity: 20}]},
    {id: 'trf-2', folio: 'TRF-2026-0084', fromWarehouse: warehouses[0], toWarehouse: warehouses[2], occurredAt: '2026-09-08', status: 'APPLIED', createdBy: employees[2], items: [{id: 'trfi-2', product: products[0], productId: products[0].id, quantity: 6}, {id: 'trfi-3', product: products[5], productId: products[5].id, quantity: 10}]},
  ];

  const inventoryAdjustments = [
    {id: 'adj-1', folio: 'AJU-2026-0034', warehouse: warehouses[1], occurredAt: '2026-09-10', reason: 'Conteo físico', notes: 'Dos horquillas con empaque dañado.', createdBy: employees[7], items: [{id: 'adji-1', product: products[7], quantity: 2, direction: 'OUT'}]},
    {id: 'adj-2', folio: 'AJU-2026-0031', warehouse: warehouses[0], occurredAt: '2026-09-06', reason: 'Ajuste por devolución', notes: 'Reingreso validado por almacén.', createdBy: employees[2], items: [{id: 'adji-2', product: products[1], quantity: 1, direction: 'IN'}]},
  ];

  const attendance = employees.slice(0, 7).map((employee, index) => ({
    id: `att-${employee.id}`, employeeId: employee.id, employee, date: '2026-09-13',
    status: index === 3 ? 'LATE' : index === 6 ? 'REMOTE' : 'PRESENT',
    checkIn: index === 3 ? '2026-09-13T09:18:00.000Z' : '2026-09-13T08:55:00.000Z',
    checkOut: null, notes: index === 3 ? 'Tráfico por cierre vial' : '',
  }));
  const leaves = [
    {id: 'leave-1', employeeId: employees[6].id, employee: employees[6], type: 'VACATION', startDate: '2026-09-21', endDate: '2026-09-23', days: 3, reason: 'Vacaciones programadas', status: 'PENDING'},
    {id: 'leave-2', employeeId: employees[4].id, employee: employees[4], type: 'PERSONAL', startDate: '2026-09-18', endDate: '2026-09-18', days: 1, reason: 'Trámite personal', status: 'APPROVED'},
  ];
  const incidents = [
    {id: 'inc-1', employeeId: employees[3].id, employee: employees[3], type: 'OVERTIME', date: '2026-09-12', amount: 1250, status: 'PENDING', description: 'Cierre de recepción urgente LTH', notes: '3.5 horas extra'},
    {id: 'inc-2', employeeId: employees[1].id, employee: employees[1], type: 'BONUS', date: '2026-09-11', amount: 1800, status: 'APPROVED', description: 'Bono por meta de mostrador', notes: 'Meta semanal superada'},
  ];
  const employeeDocuments = [
    {id: 'doc-1', employeeId: employees[0].id, employee: employees[0], type: 'CONTRACT', name: 'Contrato laboral', fileName: 'contrato-mariana-garza.pdf', fileUrl: '#demo-document', issuedAt: '2023-02-06', expiresAt: null, status: 'VALID', notes: 'Contrato por tiempo indeterminado'},
    {id: 'doc-2', employeeId: employees[1].id, employee: employees[1], type: 'IDENTIFICATION', name: 'Identificación oficial', fileName: 'ine-carlos-mendoza.pdf', fileUrl: '#demo-document', issuedAt: '2024-01-15', expiresAt: '2027-06-30', status: 'VALID', notes: ''},
    {id: 'doc-3', employeeId: employees[2].id, employee: employees[2], type: 'MEDICAL', name: 'Aptitud para manejo de almacén', fileName: 'certificado-diana-saenz.pdf', fileUrl: '#demo-document', issuedAt: '2025-10-10', expiresAt: '2026-10-10', status: 'EXPIRING', notes: 'Renovar en octubre'},
    {id: 'doc-4', employeeId: employees[7].id, employee: employees[7], type: 'ADDRESS_PROOF', name: 'Comprobante de domicilio', fileName: '', fileUrl: '', issuedAt: null, expiresAt: null, status: 'PENDING', notes: 'Pendiente de actualización'},
  ];

  const payrollItems = employees.map((employee, index) => {
    const baseSalary = Number((employee.salary / 2).toFixed(2));
    const bonuses = index === 1 ? 1800 : index === 3 ? 900 : 0;
    const overtime = index === 3 ? 1250 : 0;
    const deductions = Number((baseSalary * 0.17).toFixed(2));
    return {id: `pay-item-${employee.id}`, employeeId: employee.id, employee, baseSalary, bonuses, overtime, deductions, netPay: baseSalary + bonuses + overtime - deductions, notes: ''};
  });
  const payrollGross = payrollItems.reduce((sum, item) => sum + item.baseSalary + item.bonuses + item.overtime, 0);
  const payrollDeductions = payrollItems.reduce((sum, item) => sum + item.deductions, 0);
  const payrollPeriods = [
    {id: 'payroll-1', folio: 'NOM-2026-018', name: 'Primera quincena septiembre', startDate: '2026-09-01', endDate: '2026-09-15', paymentDate: '2026-09-15', status: 'CALCULATED', items: payrollItems, totalGross: payrollGross, totalDeductions: payrollDeductions, totalNet: payrollGross - payrollDeductions},
    {id: 'payroll-2', folio: 'NOM-2026-017', name: 'Segunda quincena agosto', startDate: '2026-08-16', endDate: '2026-08-31', paymentDate: '2026-08-31', status: 'PAID', items: payrollItems, totalGross: payrollGross - 1200, totalDeductions: payrollDeductions, totalNet: payrollGross - payrollDeductions - 1200},
  ];

  const salesOrders = [
    {
      id: 'so1', folio: 'PED-MN-2026-2410', customerId: customers[3].id, customer: customers[3],
      status: 'PARTIALLY_DELIVERED', orderDate: '2026-09-09', deliveryDate: '2026-09-14',
      shippingAddress: 'Av. Miguel Alemán 1810, Guadalupe, N.L.', subtotal: 104568.97, taxAmount: 16731.03, total: 121300,
      items: [
        {id: 'soi-1', productId: products[3].id, product: products[3], quantity: 180, deliveredQty: 120, unitPrice: 145},
        {id: 'soi-2', productId: products[4].id, product: products[4], quantity: 220, deliveredQty: 150, unitPrice: 210},
      ],
    },
    {
      id: 'so2', folio: 'PED-MN-2026-2414', customerId: customers[2].id, customer: customers[2],
      status: 'DELIVERED', orderDate: '2026-09-10', deliveryDate: '2026-09-12',
      shippingAddress: 'Carretera a Laredo km 18, Apodaca, N.L.', subtotal: 246896.55, taxAmount: 39503.45, total: 286400,
      items: [{id: 'soi-3', productId: products[5].id, product: products[5], quantity: 160, deliveredQty: 160, unitPrice: 1090}],
    },
  ];
  const deliveries = [
    {
      id: 'delivery-1', folio: 'REM-MN-2026-0908', salesOrderId: salesOrders[0].id,
      salesOrder: salesOrders[0], warehouseId: warehouses[0].id, warehouse: warehouses[0],
      deliveryDate: '2026-09-11', recipientName: 'Melissa Ríos', reference: 'Ruta MTY-04', status: 'POSTED',
      shippingAddress: salesOrders[0].shippingAddress,
      items: [
        {id: 'deli-1', product: products[3], quantity: 120, returnItems: []},
        {id: 'deli-2', product: products[4], quantity: 150, returnItems: [{id: 'ret-item-1', quantity: 4}]},
      ],
    },
    {
      id: 'delivery-2', folio: 'REM-MN-2026-0910', salesOrderId: salesOrders[1].id,
      salesOrder: salesOrders[1], warehouseId: warehouses[1].id, warehouse: warehouses[1],
      deliveryDate: '2026-09-12', recipientName: 'Héctor Cantú', reference: 'Ruta APD-02', status: 'POSTED',
      shippingAddress: salesOrders[1].shippingAddress,
      items: [{id: 'deli-3', product: products[5], quantity: 160, returnItems: []}],
    },
  ];
  const commercialInvoices = [
    {id: 'sinv-1', invoiceNumber: 'FAC-MN-10867', salesOrderId: salesOrders[0].id, salesOrder: salesOrders[0], customerId: customers[3].id, customer: customers[3], issueDate: '2026-09-11', dueDate: '2026-10-11', currency: 'MXN', subtotal: 104568.97, taxAmount: 16731.03, total: 121300, paidAmount: 0, balance: 121300, status: 'PENDING', displayStatus: 'PENDING', payments: [], notes: 'Pedido mayoreo'},
    {id: 'sinv-2', invoiceNumber: 'FAC-MN-10821', salesOrderId: salesOrders[1].id, salesOrder: salesOrders[1], customerId: customers[2].id, customer: customers[2], issueDate: '2026-09-10', dueDate: '2026-10-25', currency: 'MXN', subtotal: 246896.55, taxAmount: 39503.45, total: 286400, paidAmount: 0, balance: 286400, status: 'PENDING', displayStatus: 'PENDING', payments: [], notes: 'Contrato flotilla'},
    {id: 'sinv-3', invoiceNumber: 'FAC-MN-10844', salesOrderId: 'so-previous', salesOrder: {...salesOrders[0], id: 'so-previous', folio: 'PED-MN-2026-2388'}, customerId: customers[0].id, customer: customers[0], issueDate: '2026-08-19', dueDate: '2026-09-18', currency: 'MXN', subtotal: 171206.9, taxAmount: 27393.1, total: 198600, paidAmount: 50000, balance: 148600, status: 'PARTIALLY_PAID', displayStatus: 'PARTIALLY_PAID', payments: [{id: 'arp-1', folio: 'COB-2026-0002', paymentDate: '2026-09-07', method: 'Transferencia', reference: 'SPEI-0907', amount: 50000}], notes: 'Crédito 30 días'},
  ];
  const salesReturns = [
    {id: 'return-1', folio: 'DEV-MN-2026-0021', salesDeliveryId: deliveries[0].id, salesDelivery: deliveries[0], warehouseId: warehouses[0].id, warehouse: warehouses[0], returnDate: '2026-09-12', reason: 'Empaque dañado', reference: 'RMA-AV-118', notes: 'Producto sin instalar', status: 'POSTED', creditNote: null, items: [{id: 'ret-item-1', product: products[4], quantity: 4}]},
  ];
  const creditNotes = [
    {id: 'credit-1', folio: 'NC-MN-2026-0014', salesInvoiceId: commercialInvoices[2].id, salesInvoice: commercialInvoices[2], salesReturnId: null, issueDate: '2026-09-05', subtotal: 2500, taxTotal: 400, total: 2900, reason: 'Bonificación comercial', status: 'POSTED', notes: 'Ajuste por volumen'},
  ];

  const treasuryAccounts = [
    {id: 'ta1', code: 'BBVA-001', name: 'BBVA Operativa', type: 'BANK', currency: 'MXN', currentBalance: 821300, balance: 821300, active: true},
    {id: 'ta2', code: 'CAJA-MTY', name: 'Caja mostrador Monterrey', type: 'CASH', currency: 'MXN', currentBalance: 18650, balance: 18650, active: true},
    {id: 'ta3', code: 'BANREGIO-01', name: 'Banregio Nómina', type: 'BANK', currency: 'MXN', currentBalance: 132530, balance: 132530, active: true},
  ];
  const treasuryMovements = [
    {id: 'tm1', folio: 'TES-2026-1141', date: '2026-09-13', occurredAt: '2026-09-13T10:10:00.000Z', type: 'INFLOW', concept: 'Cobranza Taller El Pistón', amount: 50000, account: treasuryAccounts[0], status: 'POSTED'},
    {id: 'tm2', folio: 'TES-2026-1138', date: '2026-09-12', occurredAt: '2026-09-12T13:20:00.000Z', type: 'OUTFLOW', concept: 'Pago parcial Fricomex', amount: 60450, account: treasuryAccounts[0], status: 'POSTED'},
    {id: 'tm3', folio: 'TES-2026-1136', date: '2026-09-11', occurredAt: '2026-09-11T18:05:00.000Z', type: 'INFLOW', concept: 'Corte POS Monterrey', amount: 38420, account: treasuryAccounts[1], status: 'POSTED'},
  ];
  const accountsPayable = [
    {id: 'ap1', invoiceNumber: 'LTH-MTY-94018', supplierId: suppliers[0].id, supplier: suppliers[0], purchaseOrder: purchaseOrders[0], issueDate: '2026-08-09', dueDate: '2026-09-08', currency: 'MXN', subtotal: 59008.62, taxAmount: 9441.38, total: 68450, paidAmount: 0, balance: 68450, status: 'OVERDUE', displayStatus: 'OVERDUE', payments: [], notes: 'Factura por surtido de baterías'},
    {id: 'ap2', invoiceNumber: 'FCM-88291', supplierId: suppliers[1].id, supplier: suppliers[1], purchaseOrder: purchaseOrders[1], issueDate: '2026-08-21', dueDate: '2026-09-20', currency: 'MXN', subtotal: 123146.55, taxAmount: 19703.45, total: 142850, paidAmount: 60450, balance: 82400, status: 'PARTIALLY_PAID', displayStatus: 'PARTIALLY_PAID', payments: [{id: 'app-1', folio: 'PAG-2026-0198', paymentDate: '2026-09-12', method: 'Transferencia', reference: 'SPEI-FCM-1209', amount: 60450}], notes: ''},
    {id: 'ap3', invoiceNumber: 'FIL-19320', supplierId: suppliers[3].id, supplier: suppliers[3], purchaseOrder: purchaseOrders[2], issueDate: '2026-09-10', dueDate: '2026-09-25', currency: 'MXN', subtotal: 102879.31, taxAmount: 16460.69, total: 119340, paidAmount: 69350, balance: 49990, status: 'PARTIALLY_PAID', displayStatus: 'PARTIALLY_PAID', payments: [{id: 'app-2', folio: 'PAG-2026-0194', paymentDate: '2026-09-10', method: 'Transferencia', reference: 'SPEI-FIL-1009', amount: 69350}], notes: ''},
  ];

  const expenseCategories = [
    {id: 'ec1', name: 'Fletes y mensajería', active: true},
    {id: 'ec2', name: 'Publicidad y promoción', active: true},
    {id: 'ec3', name: 'Viáticos', active: true},
    {id: 'ec4', name: 'Mantenimiento', active: true},
  ];
  const expenses = [
    {id: 'exp1', folio: 'GAS-2026-0911', categoryId: 'ec1', category: expenseCategories[0], employee: employees[3], title: 'Flete urgente de suspensión', merchant: 'Transportes Regios', expenseDate: '2026-09-11', amount: 7850, taxAmount: 1082.76, currency: 'MXN', reimbursable: false, status: 'APPROVED'},
    {id: 'exp2', folio: 'GAS-2026-0912', categoryId: 'ec2', category: expenseCategories[1], employee: employees[0], title: 'Campaña Mes del Frenado Seguro', merchant: 'Meta Platforms', expenseDate: '2026-09-12', amount: 17450, taxAmount: 0, currency: 'MXN', reimbursable: false, status: 'PAID'},
    {id: 'exp3', folio: 'GAS-2026-0913', categoryId: 'ec3', category: expenseCategories[2], employee: employees[2], title: 'Visita de inventario SLP', merchant: 'Autobuses del Norte', expenseDate: '2026-09-13', amount: 2350, taxAmount: 324.14, currency: 'MXN', reimbursable: true, status: 'SUBMITTED'},
  ];
  const assetCategories = [
    {id: 'ac1', name: 'Equipo de almacén', usefulLifeMonths: 60},
    {id: 'ac2', name: 'Vehículos de reparto', usefulLifeMonths: 48},
    {id: 'ac3', name: 'Equipo de cómputo', usefulLifeMonths: 36},
  ];
  const assets = [
    {id: 'fa1', code: 'MTY-MONT-01', category: assetCategories[0], name: 'Montacargas eléctrico 2.5T', brand: 'Toyota', model: '8FBE25', location: 'Almacén Monterrey Centro', acquisitionDate: '2024-03-15', acquisitionCost: 590000, accumulatedDepreciation: 152000, bookValue: 438000, remainingMonths: 30, status: 'ACTIVE'},
    {id: 'fa2', code: 'MTY-VEH-03', category: assetCategories[1], name: 'Nissan NP300 reparto', brand: 'Nissan', model: 'NP300 2024', location: 'Sucursal Monterrey Centro', acquisitionDate: '2024-08-20', acquisitionCost: 478000, accumulatedDepreciation: 113000, bookValue: 365000, remainingMonths: 35, status: 'ACTIVE'},
    {id: 'fa3', code: 'GPE-POS-02', category: assetCategories[2], name: 'Terminal POS mostrador', brand: 'Lenovo', model: 'ThinkCentre Neo', location: 'Sucursal Guadalupe', acquisitionDate: '2025-05-08', acquisitionCost: 26500, accumulatedDepreciation: 9250, bookValue: 17250, remainingMonths: 20, status: 'ACTIVE'},
  ];

  const accountingAccounts = [
    {id: 'acc1', code: '102-01', name: 'Bancos moneda nacional', type: 'ASSET', nature: 'DEBIT', active: true},
    {id: 'acc2', code: '105-01', name: 'Inventario de refacciones', type: 'ASSET', nature: 'DEBIT', active: true},
    {id: 'acc3', code: '201-01', name: 'Proveedores nacionales', type: 'LIABILITY', nature: 'CREDIT', active: true},
    {id: 'acc4', code: '401-01', name: 'Ventas mostrador y mayoreo', type: 'REVENUE', nature: 'CREDIT', active: true},
    {id: 'acc5', code: '501-01', name: 'Costo de venta refacciones', type: 'EXPENSE', nature: 'DEBIT', active: true},
  ];
  const accountingEntries = [
    {id: 'je1', folio: 'POL-2026-0913-01', date: '2026-09-13', description: 'Corte de ventas POS Monterrey', source: 'POS', status: 'POSTED', totalDebit: 38420, totalCredit: 38420, lines: [{account: accountingAccounts[0], debit: 38420, credit: 0}, {account: accountingAccounts[3], debit: 0, credit: 38420}]},
    {id: 'je2', folio: 'POL-2026-0912-04', date: '2026-09-12', description: 'Pago parcial proveedor Fricomex', source: 'ACCOUNTS_PAYABLE', status: 'POSTED', totalDebit: 60450, totalCredit: 60450, lines: [{account: accountingAccounts[2], debit: 60450, credit: 0}, {account: accountingAccounts[0], debit: 0, credit: 60450}]},
  ];
  const bankStatements = [
    {
      id: 'stmt-1', accountId: treasuryAccounts[0].id, account: treasuryAccounts[0],
      folio: 'EC-BBVA-2026-09-1', name: 'BBVA · primera quincena septiembre', startDate: '2026-09-01', endDate: '2026-09-15',
      openingBalance: 762850, closingBalance: 821300, status: 'IN_PROGRESS',
      lines: [
        {id: 'stmt-line-1', date: '2026-09-13', description: 'SPEI TALLERES EL PISTON', reference: 'SPEI-0907', amount: 50000, type: 'CREDIT', status: 'MATCHED', matchedMovement: treasuryMovements[0]},
        {id: 'stmt-line-2', date: '2026-09-12', description: 'SPEI FRENOS COMPONENTES', reference: 'SPEI-FCM-1209', amount: -60450, type: 'DEBIT', status: 'MATCHED', matchedMovement: treasuryMovements[1]},
        {id: 'stmt-line-3', date: '2026-09-12', description: 'COMISION BANCARIA', reference: 'COM-1209', amount: -580, type: 'DEBIT', status: 'PENDING', matchedMovement: null},
      ],
    },
  ];

  const costCenters = [
    {id: 'cc1', code: 'CC-VEN-MTY', name: 'Ventas Monterrey', active: true},
    {id: 'cc2', code: 'CC-ALM-MTY', name: 'Almacén Monterrey', active: true},
    {id: 'cc3', code: 'CC-COM', name: 'Compras y abastecimiento', active: true},
    {id: 'cc4', code: 'CC-MKT', name: 'Marketing comercial', active: true},
    {id: 'cc5', code: 'CC-SLP', name: 'Expansión San Luis Potosí', active: true},
  ];
  const budgetLines = costCenters.map((costCenter, index) => ({
    id: `budget-line-${index + 1}`, costCenterId: costCenter.id, costCenter,
    name: index === 4 ? 'Apertura y equipamiento' : `Operación ${costCenter.name}`,
    planned: [980000, 420000, 448590, 120000, 980000][index],
    actual: [684920, 268400, 397640, 86450, 372400][index],
    months: Array.from({length: 12}, (_, month) => ({month: month + 1, planned: 30000 + index * 5000, actual: month < 9 ? 26000 + index * 4200 : 0})),
  }));
  const budgets = [{id: 'budget-1', code: 'PRE-2026-MN', name: 'Presupuesto operativo 2026', year: 2026, status: 'ACTIVE', plannedTotal: 2948590, actualTotal: 1809810, costCenter: costCenters[0], lines: budgetLines, createdBy}];
  const budgetMonthly = Array.from({length: 12}, (_, index) => ({month: index + 1, label: new Intl.DateTimeFormat('es-MX', {month: 'short'}).format(new Date(2026, index, 1)), planned: 245716, actual: index < 9 ? [178000, 183500, 195200, 204800, 199600, 215300, 221400, 225504, 186506][index] : 0}));

  const cashFlowScenarios = [
    {id: 'scenario-base', name: 'Operación base', description: 'Cobranza y pagos en fechas comprometidas', status: 'ACTIVE', adjustments: [{id: 'cf-adj-1', type: 'OUTFLOW', name: 'Inventario inicial SLP', date: '2026-09-25', amount: 185000, category: 'Proyecto expansión'}]},
    {id: 'scenario-growth', name: 'Crecimiento flotillas', description: 'Incremento de pedidos de Flotillas Norte', status: 'DRAFT', adjustments: [{id: 'cf-adj-2', type: 'INFLOW', name: 'Contrato flotillas Q4', date: '2026-10-08', amount: 310000, category: 'Ventas'}]},
  ];
  const cashTimeline = [
    {id: 'cf-1', date: '2026-09-15', type: 'OUTFLOW', category: 'Nómina', description: 'Primera quincena septiembre', amount: payrollGross - payrollDeductions, balance: 877700},
    {id: 'cf-2', date: '2026-09-18', type: 'INFLOW', category: 'Cobranza', description: 'Taller El Pistón · FAC-MN-10844', amount: 148600, balance: 1026300},
    {id: 'cf-3', date: '2026-09-20', type: 'OUTFLOW', category: 'Proveedores', description: 'Fricomex · FCM-88291', amount: 82400, balance: 943900},
  ];

  const campaigns = [
    {id: 'camp1', code: 'MKT-2026-009', name: 'Mes del Frenado Seguro', objective: 'LEAD_GENERATION', status: 'ACTIVE', budget: 28000, startDate: '2026-09-01', endDate: '2026-09-30', channel: {id: 'ch1', name: 'Meta Ads', type: 'PAID_SOCIAL'}, owner: employees[0], leads: [{id: 'lead-mkt-1', name: 'Taller RM Performance'}], opportunities: [], expenses: [expenses[1]], metrics: [], performance: {spend: 17450, revenue: 86400, leads: 73, conversions: 9, impressions: 128400, clicks: 6420, ctr: 5, roas: 4.95, roi: 395.13, cpl: 239.04, conversionRate: 12.33, budgetUsed: 62.32}},
    {id: 'camp2', code: 'MKT-2026-010', name: 'Flotillas · mantenimiento preventivo', objective: 'REVENUE', status: 'ACTIVE', budget: 9500, startDate: '2026-09-05', endDate: '2026-10-15', channel: {id: 'ch2', name: 'Email + WhatsApp', type: 'DIRECT'}, owner: employees[1], leads: [{id: 'lead-mkt-2', name: 'Transportes Regios'}], opportunities: [], expenses: [], metrics: [], performance: {spend: 6100, revenue: 142800, leads: 31, conversions: 9, impressions: 18200, clicks: 1570, ctr: 8.63, roas: 23.41, roi: 2240.98, cpl: 196.77, conversionRate: 29.03, budgetUsed: 64.21}},
  ];

  const prospects = [
    {id: 'lead1', name: 'Sergio Montemayor', companyName: 'Taller RM Performance', email: 'sergio@rmperformance.demo', phone: '8181559012', stage: 'LEAD', value: 240000, estimatedValue: 240000, probability: 50, owner: employees[1], source: 'Mes del Frenado Seguro', nextActionAt: '2026-09-14T16:00:00.000Z', notes: 'Solicita cotización de frenos y afinación.', createdAt: '2026-09-09T10:00:00.000Z'},
    {id: 'lead2', name: 'Claudia Garza', companyName: 'Transportes Regios', email: 'compras@transportesregios.demo', phone: '8181018230', stage: 'QUALIFIED', value: 95000, estimatedValue: 95000, probability: 65, owner: employees[0], source: 'Referido', nextActionAt: '2026-09-16T11:00:00.000Z', notes: 'Revisión de lista de precios para flotilla.', createdAt: '2026-09-10T09:30:00.000Z'},
    {id: 'lead3', name: 'Arturo de la Peña', companyName: 'Servicio Express del Norte', email: 'arturo@sen.demo', phone: '8182887721', stage: 'PROPOSAL', value: 148000, estimatedValue: 148000, probability: 75, owner: employees[6], source: 'WhatsApp', nextActionAt: '2026-09-15T13:00:00.000Z', notes: 'Propuesta enviada; pendiente confirmación de disponibilidad.', createdAt: '2026-09-11T12:15:00.000Z'},
  ];
  const crmActivities = [
    {id: 'crm-act-1', type: 'CALL', title: 'Seguimiento cotización frenos', description: 'Taller RM solicita entrega en 48 horas', dueAt: '2026-09-14T16:00:00.000Z', completedAt: null, prospect: prospects[0], createdBy: employees[1]},
    {id: 'crm-act-2', type: 'MEETING', title: 'Renovación contrato flotilla', description: 'Presentar lista de precios Q4', dueAt: '2026-09-16T11:00:00.000Z', completedAt: null, customer: customers[2], createdBy: employees[0]},
  ];

  const projects = [
    {
      id: 'proj1', code: 'PRY-DEMO-002', name: 'Apertura sucursal San Luis Potosí',
      description: 'Apertura, inventario inicial y puesta en marcha de la nueva sucursal.', status: 'IN_PROGRESS', priority: 'HIGH',
      budget: 980000, plannedHours: 560, tags: 'Expansión,Sucursal,Refacciones', customer: customers[3], manager: employees[0],
      tasks: [
        {id: 'task-1', title: 'Alta de almacén y ubicaciones', status: 'DONE', assignee: employees[2], dueDate: '2026-09-05'},
        {id: 'task-2', title: 'Carga de inventario inicial', status: 'IN_PROGRESS', assignee: employees[3], dueDate: '2026-09-22'},
        {id: 'task-3', title: 'Instalación POS mostrador', status: 'TODO', assignee: employees[1], dueDate: '2026-09-25'},
      ],
      timeEntries: [{id: 'time-1', employee: employees[2], date: '2026-09-11', hours: 8, description: 'Diseño de ubicaciones'}],
      members: [employees[0], employees[2], employees[3]], subprojects: [], salesOrders: [], purchaseOrders: [purchaseOrders[2]],
      comments: [{id: 'comment-1', body: 'Layout de almacén aprobado.', createdAt: '2026-09-11', createdBy: employees[0]}],
      documents: [{id: 'project-doc-1', name: 'layout-almacen-slp.pdf', url: '#demo-document'}],
      metrics: {taskProgress: 42, tasksDone: 8, tasksTotal: 19, overdueTasks: 1, laborHours: 196, loggedHours: 196, plannedHours: 560, budgetUsed: 38, actualCost: 372400, revenue: 0, cost: 372400, margin: -372400},
    },
  ];

  const productionOrders = [
    {id: 'wo1', folio: 'KIT-2026-0041', name: 'Kit afinación Nissan Versa 1.6', status: 'IN_PROGRESS', quantity: 12, completedQuantity: 7, product: products[4], warehouse: warehouses[0], workCenter: {id: 'wc1', name: 'Área de armado de kits', status: 'ACTIVE'}, plannedStart: '2026-09-12', dueDate: '2026-09-14', items: [{product: products[3], quantity: 12}, {product: products[4], quantity: 48}, {product: products[5], quantity: 12}]},
    {id: 'wo2', folio: 'KIT-2026-0042', name: 'Kit frenos delanteros Versa', status: 'PLANNED', quantity: 8, completedQuantity: 0, product: products[1], warehouse: warehouses[1], workCenter: {id: 'wc1', name: 'Área de armado de kits', status: 'ACTIVE'}, plannedStart: '2026-09-15', dueDate: '2026-09-16', items: [{product: products[1], quantity: 8}]},
  ];
  const boms = [
    {id: 'bom-1', code: 'BOM-AFIN-VERSA', name: 'Kit afinación Nissan Versa 1.6', outputProduct: products[4], active: true, items: [{id: 'bomi-1', product: products[3], quantity: 1}, {id: 'bomi-2', product: products[4], quantity: 4}, {id: 'bomi-3', product: products[5], quantity: 1}]},
  ];

  const approvalWorkflows = [{id: 'wf-1', entityType: 'PURCHASE_REQUEST', name: 'Compras mayores a $25,000', description: 'Autorización de gerencia y administración', active: true, rules: [{id: 'rule-1', sequence: 1, name: 'Gerencia de sucursal', actorType: 'USER', user: employees[0]}, {id: 'rule-2', sequence: 2, name: 'Administración', actorType: 'PERMISSION', permissionKey: 'procurement.approve'}]}];
  const approvalRequests = [
    {id: 'approval-1', folio: 'APR-2026-0441', entityType: 'PURCHASE_REQUEST', entityId: demoPurchaseRequests[1].id, title: demoPurchaseRequests[1].folio, description: demoPurchaseRequests[1].concept, amount: demoPurchaseRequests[1].amount, status: 'PENDING', requestedBy: employees[7], createdAt: '2026-09-10T16:20:00.000Z', currentStep: 1, steps: [{id: 'step-1', sequence: 1, status: 'PENDING', assignee: employees[0]}]},
    {id: 'approval-2', folio: 'APR-2026-0438', entityType: 'EXPENSE', entityId: expenses[2].id, title: expenses[2].folio, description: expenses[2].title, amount: expenses[2].amount, status: 'PENDING', requestedBy: employees[2], createdAt: '2026-09-13T09:20:00.000Z', currentStep: 1, steps: [{id: 'step-2', sequence: 1, status: 'PENDING', assignee: employees[0]}]},
  ];

  const dataDefinitions = [
    {id: 'def-products', key: 'products', name: 'Catálogo de refacciones', entity: 'PRODUCT', description: 'SKU, marca, aplicación vehicular, costos y precios', fields: 12, active: true},
    {id: 'def-customers', key: 'customers', name: 'Clientes y talleres', entity: 'CUSTOMER', description: 'Talleres, flotillas, crédito y contactos', fields: 15, active: true},
    {id: 'def-inventory', key: 'inventory', name: 'Existencias por almacén', entity: 'INVENTORY_BALANCE', description: 'Saldo, reservado, disponible y mínimo', fields: 9, active: true},
    {id: 'def-employees', key: 'employees', name: 'Plantilla de empleados', entity: 'EMPLOYEE', description: 'Datos laborales y adscripción', fields: 18, active: true},
  ];
  const dataJobs = [
    {id: 'job-1', folio: 'IMP-2026-0068', definition: dataDefinitions[0], fileName: 'catalogo_lth_septiembre.xlsx', status: 'COMPLETED', createdAt: '2026-09-11T12:00:00.000Z', summary: {rows: 420, valid: 417, errors: 3, created: 48, updated: 369}},
    {id: 'job-2', folio: 'IMP-2026-0067', definition: dataDefinitions[2], fileName: 'conteo_almacen_mty.xlsx', status: 'READY', createdAt: '2026-09-10T18:30:00.000Z', summary: {rows: 286, valid: 286, errors: 0, created: 0, updated: 286}},
    {id: 'job-3', folio: 'IMP-2026-0064', definition: dataDefinitions[1], fileName: 'clientes_mayoreo.csv', status: 'COMPLETED', createdAt: '2026-09-08T09:15:00.000Z', summary: {rows: 114, valid: 112, errors: 2, created: 18, updated: 94}},
  ];

  const integrationProviders = [
    {id: 'provider-mp', key: 'mercado-pago', name: 'Mercado Pago', category: 'PAYMENTS', description: 'Cobro con tarjeta y links de pago', available: true},
    {id: 'provider-shopify', key: 'shopify', name: 'Shopify', category: 'ECOMMERCE', description: 'Pedidos e inventario omnicanal', available: true},
    {id: 'provider-whatsapp', key: 'whatsapp', name: 'WhatsApp Business', category: 'MESSAGING', description: 'Cotizaciones y avisos de cobranza', available: true},
  ];
  const integrationConnections = [
    {id: 'conn-1', provider: integrationProviders[0], name: 'Mercado Pago · POS y links', status: 'ACTIVE', lastSyncAt: '2026-09-13T15:45:00.000Z', createdAt: '2026-06-10'},
    {id: 'conn-2', provider: integrationProviders[2], name: 'WhatsApp ventas', status: 'SIMULATED', lastSyncAt: '2026-09-13T15:30:00.000Z', createdAt: '2026-07-18'},
  ];
  const webhooks = [{id: 'wh-1', name: 'Pedido ecommerce creado', event: 'sales.order.created', url: 'https://demo.invalid/webhooks/orders', active: true, lastDeliveryAt: '2026-09-13T14:12:00.000Z'}];
  const apiKeys = [{id: 'key-1', name: 'Integración catálogo ecommerce', prefix: 'bb_demo_', status: 'ACTIVE', createdAt: '2026-07-18', lastUsedAt: '2026-09-13T13:10:00.000Z'}];
  const integrationQueue = [{id: 'queue-1', type: 'WEBHOOK', event: 'inventory.updated', status: 'DELIVERED', attempts: 1, createdAt: '2026-09-13T14:12:00.000Z'}];

  const flows = [
    {id: 'flow-1', name: 'Reorden por stock mínimo', description: 'Crea una SOLPED cuando la existencia disponible baja del mínimo.', status: 'ACTIVE', trigger: 'inventory.below_minimum', action: 'purchase_request.create', runs: 18, successRate: 100, lastRunAt: '2026-09-13T09:12:00.000Z', steps: [{id: 'flow-step-1', type: 'CONDITION', name: 'Disponible menor al mínimo'}, {id: 'flow-step-2', type: 'ACTION', name: 'Crear solicitud de compra'}]},
    {id: 'flow-2', name: 'Seguimiento de cartera vencida', description: 'Genera tarea para cobranza al vencer una factura.', status: 'ACTIVE', trigger: 'receivable.overdue', action: 'crm.activity.create', runs: 7, successRate: 100, lastRunAt: '2026-09-13T08:00:00.000Z', steps: [{id: 'flow-step-3', type: 'TRIGGER', name: 'Factura vencida'}, {id: 'flow-step-4', type: 'ACTION', name: 'Crear actividad CRM'}]},
  ];
  const flowRuns = [{id: 'run-1', flow: flows[0], status: 'SUCCESS', startedAt: '2026-09-13T09:12:00.000Z', finishedAt: '2026-09-13T09:12:01.000Z', message: 'SOL-REF-2026-0156 creada para amortiguadores.'}, {id: 'run-2', flow: flows[1], status: 'SUCCESS', startedAt: '2026-09-13T08:00:00.000Z', finishedAt: '2026-09-13T08:00:01.000Z', message: 'Actividad asignada a Fernanda Cortés.'}];

  const fiscalCustomers = [withFiscalProfile(customers[0], '64060'), withFiscalProfile(customers[2], '66600'), withFiscalProfile(customers[3], '67110'), customers[1], withFiscalProfile(customers[4], '64000')];
  const fiscalInvoices = [
    {id: 'fiscal-1', series: 'A', folio: '10821', uuid: '6E60D631-7A0D-4C57-A321-DEMO00010821', customer: fiscalCustomers[1], issueDate: '2026-09-10', status: 'STAMPED', subtotal: 246896.55, taxTotal: 39503.45, total: 286400, paymentMethod: 'PPD', cancellations: [], xmlUrl: '#demo-xml', pdfUrl: '#demo-pdf'},
    {id: 'fiscal-2', series: 'A', folio: '10844', uuid: '1A43AC05-8B1F-4D91-B822-DEMO00010844', customer: fiscalCustomers[0], issueDate: '2026-08-19', status: 'STAMPED', subtotal: 171206.9, taxTotal: 27393.1, total: 198600, paymentMethod: 'PPD', cancellations: [], xmlUrl: '#demo-xml', pdfUrl: '#demo-pdf'},
    {id: 'fiscal-3', series: 'A', folio: '10867', uuid: null, customer: fiscalCustomers[2], issueDate: '2026-09-11', status: 'READY', subtotal: 104568.97, taxTotal: 16731.03, total: 121300, paymentMethod: 'PPD', cancellations: [], xmlUrl: null, pdfUrl: null},
  ];
  const fiscalReceipts = [{id: 'receipt-fiscal-1', folio: 'COB-2026-0002', customer: fiscalCustomers[0], amount: 50000, paymentDate: '2026-09-07', fiscalPaymentComplement: null}];
  const paymentComplements = [{id: 'cp-1', series: 'P', folio: '00014', uuid: null, customer: fiscalCustomers[0], status: 'READY', issueDate: '2026-09-07'}];

  const modules = [
    ['inicio', 'Inicio', '/', 'CORE'], ['ventas', 'Ventas', '/ventas', 'COMMERCIAL'], ['crm', 'CRM', '/crm', 'COMMERCIAL'],
    ['compras', 'Compras', '/compras', 'OPERATIONS'], ['inventario', 'Inventario', '/inventario/productos', 'OPERATIONS'],
    ['finanzas', 'Finanzas', '/administracion', 'FINANCE'], ['rrhh', 'Recursos humanos', '/recursos-humanos', 'PEOPLE'],
    ['pos', 'Punto de venta', '/pos', 'COMMERCIAL'], ['proyectos', 'Proyectos', '/proyectos', 'OPERATIONS'],
    ['produccion', 'Producción', '/produccion', 'OPERATIONS'], ['marketing', 'Marketing', '/marketing', 'COMMERCIAL'],
    ['reportes', 'Reportes', '/reportes', 'INTELLIGENCE'], ['flow', 'Flow', '/flow', 'AUTOMATION'], ['data-hub', 'Data Hub', '/data-hub', 'DATA'],
  ].map(([key, name, route, category]) => ({id: `module-${key}`, key, name, route, category, description: `${name} para la operación de MotorNorte`, active: true}));
  const companyModules = modules.map((module) => ({id: `cm-${module.key}`, moduleId: module.id, module, enabled: true}));
  const planModules = modules.map((module) => ({id: `pm-${module.key}`, module}));
  const plans = [
    {id: 'plan-growth', name: 'Growth', description: 'Operación integral multi-sucursal', monthlyPrice: 6990, currency: 'MXN', modules: planModules, limits: [{id: 'limit-users', metricKey: 'users', metricType: 'USERS', limitValue: 25, hardLimit: true}, {id: 'limit-branches', metricKey: 'branches', metricType: 'BRANCHES', limitValue: 5, hardLimit: true}]},
    {id: 'plan-business', name: 'Business OS', description: 'Todos los módulos y automatización avanzada', monthlyPrice: 9990, currency: 'MXN', modules: planModules, limits: [{id: 'limit-users-business', metricKey: 'users', metricType: 'USERS', limitValue: 75, hardLimit: false}]},
  ];
  const subscription = {id: 'sub-demo', planId: plans[0].id, plan: plans[0], status: 'ACTIVE', billingCycle: 'MONTHLY', billingDay: 15, nextBillingAt: '2026-09-15', canChangePlan: true};
  const billingInvoices = [{id: 'bill-1', number: 'BB-2026-0915', status: 'OPEN', createdAt: '2026-09-01', dueDate: '2026-09-15', total: 6990, currency: 'MXN'}, {id: 'bill-2', number: 'BB-2026-0815', status: 'PAID', createdAt: '2026-08-01', dueDate: '2026-08-15', total: 6990, currency: 'MXN'}];
  const paymentMethods = [{id: 'method-1', brand: 'Visa', last4: '4242', type: 'CARD', isDefault: true, expiresAt: '2028-12'}];
  const roles = [
    {id: 'role-admin', name: 'Administrador', description: 'Acceso completo a MotorNorte', permissions: [{id: 'perm-all', key: '*', name: 'Acceso total'}], _count: {users: 1}},
    {id: 'role-sales', name: 'Ventas y POS', description: 'Clientes, cotizaciones, pedidos y mostrador', permissions: [{id: 'perm-sales', key: 'sales.manage', name: 'Gestionar ventas'}, {id: 'perm-pos', key: 'pos.operate', name: 'Operar POS'}], _count: {users: 3}},
    {id: 'role-warehouse', name: 'Almacén', description: 'Inventario, recepciones y surtido', permissions: [{id: 'perm-inventory', key: 'inventory.manage', name: 'Gestionar inventario'}], _count: {users: 2}},
  ];
  const users = [
    {...user, firstName: 'Mariana', lastName: 'Garza', email: 'admin@erp.local', roles: [roles[0]], lastLoginAt: stamp},
    {...employees[1], email: employees[1].email, roles: [roles[1]], lastLoginAt: '2026-09-13T14:05:00.000Z'},
    {...employees[2], email: employees[2].email, roles: [roles[2]], lastLoginAt: '2026-09-13T13:40:00.000Z'},
    {...employees[6], email: employees[6].email, roles: [roles[1]], lastLoginAt: '2026-09-13T12:18:00.000Z'},
  ].map((item) => ({...item, active: true}));

  const notifications = [
    {id: 'not-1', title: 'Stock crítico en Guadalupe', message: 'Horquilla inferior izquierda quedó en 2 piezas.', type: 'INVENTORY', read: false, createdAt: '2026-09-13T14:12:00.000Z'},
    {id: 'not-2', title: 'Aprobación pendiente', message: 'SOL-REF-2026-0152 requiere autorización.', type: 'APPROVAL', read: false, createdAt: '2026-09-13T11:30:00.000Z'},
    {id: 'not-3', title: 'Cobro aplicado', message: 'Se registraron $50,000 de Taller El Pistón.', type: 'COLLECTION', read: true, createdAt: '2026-09-13T10:10:00.000Z'},
  ];
  const agendaEvents = [
    {id: 'agenda-1', title: 'Seguimiento flotilla preventiva · Flotillas Norte', startAt: '2026-09-14T15:00:00.000Z', endAt: '2026-09-14T16:00:00.000Z', date: '2026-09-14', type: 'CRM', priority: 'HIGH', status: 'ACTIVE', employee: employees[0]},
    {id: 'agenda-2', title: 'Recepción esperada Fricomex', startAt: '2026-09-16T10:00:00.000Z', endAt: '2026-09-16T11:00:00.000Z', date: '2026-09-16', type: 'PROCUREMENT', priority: 'HIGH', status: 'ACTIVE', employee: employees[3]},
    {id: 'agenda-3', title: 'Pago primera quincena', startAt: '2026-09-15T09:00:00.000Z', endAt: '2026-09-15T10:00:00.000Z', date: '2026-09-15', type: 'HR', priority: 'HIGH', status: 'ACTIVE', employee: employees[4]},
    {id: 'agenda-4', title: 'Conteo cíclico de frenos', startAt: '2026-09-17T08:30:00.000Z', endAt: '2026-09-17T11:00:00.000Z', date: '2026-09-17', type: 'INVENTORY', priority: 'MEDIUM', status: 'ACTIVE', employee: employees[2]},
  ];
  const agendaItems = agendaEvents.map((event) => ({
    ...event,
    rawId: event.id,
    date: event.startAt,
    endAt: event.endAt,
    source: 'manual',
    eventPriority: event.priority,
    assigneeEmployeeId: event.employee?.id || null,
    assignee: event.employee || null,
    allDay: false,
  }));
  const activityLogs = [
    {id: 'log-1', entity: 'SESSION', action: 'LOGIN', description: 'Inicio de sesión Demo Local', createdAt: stamp, user: users[0]},
    {id: 'log-2', entity: 'PURCHASE_REQUEST', action: 'APPROVE', description: 'Solicitud SOL-REF-2026-0155 aprobada', createdAt: '2026-09-13T15:20:00.000Z', user: employees[0]},
    {id: 'log-3', entity: 'INVENTORY_TRANSFER', action: 'CREATE', description: 'Transferencia TRF-2026-0088 aplicada', createdAt: '2026-09-12T17:40:00.000Z', user: employees[2]},
    {id: 'log-4', entity: 'COLLECTION', action: 'CREATE', description: 'Cobro de Taller El Pistón registrado', createdAt: '2026-09-13T10:10:00.000Z', user: employees[4]},
  ];

  const reportMonthly = [
    {month: 'Abr', label: 'Abr', sales: 486200, collections: 412500, purchases: 325800, payroll: 167400},
    {month: 'May', label: 'May', sales: 522800, collections: 501200, purchases: 348900, payroll: 169100},
    {month: 'Jun', label: 'Jun', sales: 558400, collections: 530600, purchases: 367500, payroll: 172300},
    {month: 'Jul', label: 'Jul', sales: 604900, collections: 576300, purchases: 392800, payroll: 178600},
    {month: 'Ago', label: 'Ago', sales: 639700, collections: 608200, purchases: 410300, payroll: 183400},
    {month: 'Sep', label: 'Sep', sales: 684920, collections: 318600, purchases: 448590, payroll: payrollGross - payrollDeductions},
  ];
  const executiveSummary = {salesTotal: 684920, collectionsTotal: 318600, purchaseTotal: 448590, commercialBalance: 236330, liquidity: 972480, cashIn: 318600, cashOut: 204150, receivableBalance: 556300, overdueReceivables: 62400, payableBalance: 200840, overduePayables: 68450, inventoryValue: inventoryBalances.reduce((sum, item) => sum + item.inventoryValue, 0), payrollNet: payrollGross - payrollDeductions, budgetPlanned: 2948590, budgetActual: 1809810, budgetVariance: 1138780, budgetUtilization: 61.38, activeEmployees: employees.length, pendingPurchaseRequests: 1, pendingApprovals: approvalRequests.length, lowStock: 3};

  const workCenters = [{id: 'wc1', name: 'Área de armado de kits', code: 'ARM-KIT', status: 'ACTIVE', capacity: 24}];
  const commonCatalogs = {products, categories, warehouses, employees, departments, positions, branches, customers, suppliers};

  const fixtures = {
    '/warehouses': {warehouses, branches},
    '/receipts': {receipts, orders: purchaseOrders.filter((order) => ['ISSUED', 'PARTIALLY_RECEIVED'].includes(order.status)), purchaseOrders, ...commonCatalogs},
    '/purchase-orders': {orders: purchaseOrders, purchaseOrders, approvedRequests: demoPurchaseRequests.filter((request) => request.status === 'APPROVED'), ...commonCatalogs},
    '/purchase-requests': {requests: demoPurchaseRequests, purchaseRequests: demoPurchaseRequests, ...commonCatalogs},
    '/procurement/dashboard': {summary: {pendingRequests: 1, openOrders: 3, monthlySpend: 448590, pendingReceipts: 3}, recentRequests: demoPurchaseRequests, purchaseOrders, topSuppliers: suppliers.slice(0, 3).map((supplier, index) => ({supplier, orders: [8, 6, 5][index], total: [186400, 142850, 119340][index]}))},
    '/inventory/balances': {balances: inventoryBalances, warehouses, products},
    '/inventory/movements': {movements: inventoryMovements, warehouses, products},
    '/inventory-operations': {transfers: inventoryTransfers, adjustments: inventoryAdjustments, balances: inventoryBalances, warehouses, products},
    '/hr-operations': {employees, attendance, leaves, incidents, summary: {attendanceRate: 87.5, pendingLeaves: 1, incidentsMonth: 2}},
    '/employee-documents': {employees, documents: employeeDocuments, stats: {total: employeeDocuments.length, valid: 2, pending: 1, alerts: 1, employeesComplete: 5}},
    '/payroll': {periods: payrollPeriods, payrolls: payrollPeriods, employees, stats: {periods: payrollPeriods.length, draft: 1, approved: 1, pendingNet: payrollPeriods[0].totalNet}},
    '/sales-fulfillment': {orders: salesOrders, warehouses, customers, deliveries, invoices: commercialInvoices, stats: {pendingOrders: 1, deliveries: deliveries.length, invoices: commercialInvoices.length, billedTotal: 606300, pendingBalance: 556300}},
    '/sales-returns': {deliveries, returns: salesReturns, invoices: commercialInvoices, creditNotes, warehouses, customers, stats: {returns: 1, returnedUnits: 4, creditNotes: 1, creditedTotal: 2900, pendingCreditNotes: 1}},
    '/order-to-cash/dashboard': {summary: {quotes: 2, orders: 2, deliveries: 2, invoices: 3, collections: 2}, stages: [{id: 'stage-quote', label: 'Cotizaciones', count: 2, value: 119280}, {id: 'stage-order', label: 'Pedidos', count: 2, value: 407700}, {id: 'stage-delivery', label: 'Entregas', count: 2, value: 407700}, {id: 'stage-invoice', label: 'Facturas', count: 3, value: 606300}], attention: [{id: 'attn-1', type: 'DELIVERY', title: 'Pedido parcial PED-MN-2026-2410', amount: 121300}], quotes: [], orders: salesOrders, deliveries, invoices: commercialInvoices, payments: [], customers},
    '/accounts-payable': {metrics: {total: 330640, paid: 129800, balance: 200840, overdue: 68450}, summary: {invoiced: 330640, paid: 129800, pending: 200840, overdue: 68450}, invoices: accountsPayable},
    '/accounts-payable/catalogs': {suppliers, purchaseOrders, treasuryAccounts, accounts: treasuryAccounts, costCenters, projects},
    '/accounts-receivable': {metrics: {total: 606300, collected: 50000, balance: 556300, overdue: 62400}, summary: {invoiced: 606300, collected: 50000, pending: 556300, overdue: 62400}, invoices: commercialInvoices},
    '/accounts-receivable/catalogs': {customers, treasuryAccounts, accounts: treasuryAccounts, projects},
    '/treasury': {accounts: treasuryAccounts, movements: treasuryMovements, stats: {balance: 972480, inflows: 88420, outflows: 60450}, summary: {balance: 972480, inflows: 88420, outflows: 60450}},
    '/bank-reconciliation': {accounts: treasuryAccounts.filter((account) => account.type === 'BANK'), statements: bankStatements, transactions: treasuryMovements, movements: treasuryMovements, stats: {statements: 1, pendingLines: 1, matchedLines: 2, pendingAmount: 580, reconciledStatements: 0}},
    '/accounting': {accounts: accountingAccounts, periods: [{id: 'period-1', name: 'Septiembre 2026', year: 2026, month: 9, status: 'OPEN', startDate: '2026-09-01', endDate: '2026-09-30'}], entries: accountingEntries, trialBalance: accountingAccounts.map((account, index) => ({id: `tb-${account.id}`, account, debit: [972480, 1248360, 0, 0, 448590][index], credit: [0, 0, 200840, 684920, 0][index], balance: [972480, 1248360, -200840, -684920, 448590][index]})), sources: ['POS', 'PURCHASES', 'SALES', 'TREASURY'], stats: {accounts: accountingAccounts.length, entries: accountingEntries.length, openPeriods: 1, debits: 2669430, credits: 2669430}},
    '/expenses/dashboard': {expenses, categories: expenseCategories, employees, summary: {total: expenses.reduce((sum, item) => sum + item.amount, 0), pending: 1, approved: 2, reimbursable: 2350}},
    '/expenses': {expenses, categories: expenseCategories, employees},
    '/fixed-assets/dashboard': {assets, categories: assetCategories, summary: {assetCount: assets.length, acquisitionCost: 1094500, accumulatedDepreciation: 274250, bookValue: 820250}},
    '/fixed-assets': {assets, categories: assetCategories},
    '/budgets': {costCenters, budgets, monthly: budgetMonthly, summary: {plannedTotal: 2948590, actualTotal: 1809810, variance: 1138780, utilization: 61.38, activeCostCenters: costCenters.length}},
    '/cash-flow': {summary: {openingBalance: 825000, totalReceivables: 556300, totalPayables: 200840, netProjection: 355460, projectedClosingBalance: 1180460, minimumBalance: 790000}, timeline: cashTimeline, monthly: reportMonthly.map((row) => ({month: row.month, inflow: row.collections, outflow: row.purchases + row.payroll})), accounts: treasuryAccounts, scenarios: cashFlowScenarios, selectedScenario: cashFlowScenarios[0], receivables: commercialInvoices, payables: accountsPayable, recentMovements: treasuryMovements, risks: [{id: 'risk-1', level: 'HIGH', title: 'Pago LTH vencido', description: 'Regularizar $68,450 para mantener el plazo preferente.'}, {id: 'risk-2', level: 'MEDIUM', title: 'Inventario inicial SLP', description: 'Salida prevista de $185,000 el 25 de septiembre.'}], filters: {scenarioId: 'scenario-base'}},
    '/fiscal/dashboard': {issuer: {id: 'issuer-1', rfc: 'MRA160812MN1', legalName: company.legalName, fiscalRegime: '601', postalCode: '64000', certificateNumber: '30001000000500003416', pacProvider: 'Demo PAC (simulado)', active: true}, customers: fiscalCustomers, invoices: fiscalInvoices, salesInvoices: commercialInvoices.map((invoice) => ({...invoice, fiscalInvoice: fiscalInvoices.find((fiscal) => fiscal.folio === invoice.invoiceNumber.replace('FAC-MN-', '')) || null})), receipts: fiscalReceipts, paymentComplements, summary: {stamped: 2, totalInvoices: 3, stampedTotal: 485000, taxes: 66896.55, pending: 1, cancelled: 0, missingFiscalCustomers: 1, paymentComplements: 1}},
    '/marketing/dashboard': {campaigns, channels: campaigns.map((campaign) => campaign.channel), prospects, customers, salesOrders, users, events: [{id: 'mkt-event-1', type: 'LEAD_CAPTURED', title: 'Lead Taller RM Performance', occurredAt: '2026-09-13T12:15:00.000Z', completedAt: stamp}], summary: {activeCampaigns: 2, impressions: 146600, clicks: 7990, leads: 104, conversions: 18, revenue: 229200, spend: 23550, budget: 37500, roas: 9.73, roi: 873.25, cpl: 226.44, ctr: 5.45}},
    '/sales-enterprise/dashboard': {summary: {salesThisMonth: 684920, monthSales: 684920, openQuotes: 4, conversionRate: 38, activeOrders: 2, pendingCollections: 556300, openReceivables: 556300, activeProspects: prospects.length}, pipeline: [{stage: 'LEAD', label: 'Prospecto', value: 240000, count: 1}, {stage: 'QUALIFIED', label: 'Calificado', value: 95000, count: 1}, {stage: 'PROPOSAL', label: 'Propuesta', value: 148000, count: 1}], prospects, activities: crmActivities, quotes: [], orders: salesOrders, receivables: commercialInvoices},
    '/sales-enterprise/prospects': {prospects},
    '/projects/dashboard': {projects, employees, customers, salesOrders, purchaseOrders, summary: {total: 1, active: 1, planning: 0, budget: 980000, revenue: 0, cost: 372400, hours: 196}},
    '/production/dashboard': {orders: productionOrders, boms, workCenters, products, warehouses, employees, salesOrders, projects, summary: {orders: 2, planned: 1, inProgress: 1, completed: 0, efficiency: 94, plannedUnits: 20, completedUnits: 7}},
    '/approvals/dashboard': {workflows: approvalWorkflows, approvalWorkflows, requests: approvalRequests, inbox: approvalRequests, requestedByMe: [], approvals: approvalRequests, summary: {myInbox: approvalRequests.length, pending: approvalRequests.length, approved: 8, rejected: 1}},
    '/master-data/dashboard': {summary: {entities: 4, records: products.length + customers.length + suppliers.length + employees.length, issues: 3, duplicates: 1, qualityScore: 96}, catalogs: dataDefinitions, entities: dataDefinitions, issues: [{id: 'quality-1', entity: 'PRODUCT', field: 'vehicleFitment', recordName: products[6].name, severity: 'MEDIUM', description: 'Aplicación vehicular demasiado general', status: 'OPEN'}, {id: 'quality-2', entity: 'CUSTOMER', field: 'fiscalProfile', recordName: customers[1].commercialName, severity: 'HIGH', description: 'Perfil fiscal incompleto', status: 'OPEN'}], recentActivity: activityLogs.slice(1)},
    '/master-data/entities': {products, customers, suppliers, employees},
    '/data-hub/dashboard': {summary: {imports: dataJobs.length, rows: 820, validRows: 815, errors: 5, ready: 1}, jobs: dataJobs, definitions: dataDefinitions},
    '/data-hub/definitions': {definitions: dataDefinitions},
    '/integrations/catalog': {providers: integrationProviders, events: ['sales.order.created', 'inventory.updated', 'customer.updated']},
    '/integrations/dashboard': {summary: {active: 2, errors: 0, deliveriesToday: 46, queued: 0}, connections: integrationConnections, webhooks, apiKeys, queue: integrationQueue, deliveries: integrationQueue},
    '/flow/catalog': {triggerEvents: [{id: 'trigger-inventory', key: 'inventory.below_minimum', name: 'Inventario bajo mínimo'}, {id: 'trigger-receivable', key: 'receivable.overdue', name: 'Cuenta por cobrar vencida'}], actionTypes: [{id: 'action-solped', key: 'purchase_request.create', name: 'Crear solicitud de compra'}, {id: 'action-crm', key: 'crm.activity.create', name: 'Crear actividad CRM'}], users, approvalWorkflows},
    '/flow/dashboard': {summary: {active: flows.length, runsToday: flowRuns.length, successRate: 100, errors: 0}, flows, runs: flowRuns},
    '/modules/dashboard': {modules, companyModules, plans, subscriptions: [subscription], currentSubscription: subscription, overrides: [{id: 'override-1', metricKey: 'branches', metricType: 'BRANCHES', limitValue: 6, hardLimit: false}], usage: [{metricKey: 'users', current: users.length, limit: 25}, {metricKey: 'branches', current: branches.length, limit: 6}], summary: {modulesAvailable: modules.length, modulesEnabled: companyModules.length, modulesDisabled: 0, plan: subscription.plan.name, status: subscription.status}},
    '/billing/dashboard': {subscription, invoices: billingInvoices, credits: [], methods: paymentMethods, changes: [{id: 'change-1', fromPlan: {name: 'Starter'}, toPlan: plans[0], type: 'UPGRADE', status: 'APPLIED', effectiveAt: '2026-06-15', chargeAmount: 2500}]},
    '/admin/users': {users},
    '/admin/roles': {roles, permissions: roles.flatMap((role) => role.permissions).filter((permission, index, all) => all.findIndex((item) => item.id === permission.id) === index)},
    '/activity/notifications': {notifications, unread: notifications.filter((item) => !item.read).length},
    '/activity/activity': {logs: activityLogs, filters: {entities: [...new Set(activityLogs.map((item) => item.entity))], actions: [...new Set(activityLogs.map((item) => item.action))]}},
    '/agenda': {items: agendaItems, events: agendaEvents, agenda: agendaItems},
    '/agenda/meta': {types: ['CRM', 'FINANCE', 'HR', 'PROCUREMENT', 'INVENTORY'], priorities: ['LOW', 'MEDIUM', 'HIGH'], users: employees, employees},
    '/reports/executive': {company, generatedAt: stamp, summary: executiveSummary, comparison: {salesTotal: {changePct: 7.1}, collectionsTotal: {changePct: -47.6}, purchaseTotal: {changePct: 9.3}, commercialBalance: {changePct: 3.4}, payrollNet: {changePct: 2.1}}, monthly: reportMonthly, decisions: [{id: 'decision-1', title: 'Autorizar compra de frenos', detail: 'Evita quiebre de stock en Guadalupe.', type: 'currency', value: 142850, to: '/compras/ordenes'}, {id: 'decision-2', title: 'Regularizar saldo LTH', detail: 'Factura vencida con proveedor estratégico.', type: 'currency', value: 68450, to: '/finanzas/cuentas-por-pagar'}], supplierSpend: suppliers.slice(0, 3).map((supplier, index) => ({name: supplier.commercialName, orders: [8, 6, 5][index], total: [186400, 142850, 119340][index]})), customerBalances: commercialInvoices.map((invoice) => ({name: invoice.customer.commercialName, invoices: 1, balance: invoice.balance})), departments: departments.map((department) => ({name: department.name, employees: employees.filter((employee) => employee.departmentId === department.id).length, payroll: employees.filter((employee) => employee.departmentId === department.id).reduce((sum, employee) => sum + employee.salary, 0)})), lowStock: inventoryBalances.filter((item) => item.available <= item.minStock).slice(0, 5).map((item) => ({sku: item.product.sku, name: item.product.name, warehouse: item.warehouse.name, quantity: item.available, minStock: item.minStock})), health: {status: 'GOOD', score: 91}, actionItems: approvalRequests},
    '/reports/demo': {company, health: {level: 'GOOD', score: 91, finance: 88, operations: 93, sales: 92, people: 90}, summary: {purchases30d: 448590, receivableBalance: 556300, payableBalance: 200840, overdueReceivables: 62400, overduePayables: 68450, activeEmployees: employees.length, attendanceRate: 87.5, pendingLeaves: 1, incidentsMonth: 2, lowStock: 3}, purchasePipeline: {pendingRequests: 1, pendingApprovals: 2, issuedOrders: 2, partialOrders: 1}, demoStory: [{step: 1, title: 'Venta omnicanal', value: '$684,920', detail: 'Mostrador, mayoreo y flotillas'}, {step: 2, title: 'Inventario conectado', value: `${inventoryBalances.length} saldos`, detail: '3 almacenes y trazabilidad completa'}, {step: 3, title: 'Finanzas al día', value: '$972,480', detail: 'Liquidez consolidada'}, {step: 4, title: 'Equipo operativo', value: `${employees.length} empleados`, detail: 'Asistencia y prenómina'}], actionItems: [{title: 'Aprobar SOL-REF-2026-0152', to: '/aprobaciones', value: 32980}, {title: 'Reabastecer horquillas Guadalupe', to: '/inventario/existencias', value: 2}], insights: [{id: 'demo-insight-1', title: 'Oportunidad en flotillas', description: 'La campaña directa genera ROAS 23.4x.'}, {id: 'demo-insight-2', title: 'Riesgo de abasto', description: 'Tres SKU están debajo del mínimo.'}], readiness: [{key: 'data', label: 'Datos demo por módulo', ready: true}, {key: 'offline', label: 'Operación sin backend', ready: true}]},
    '/reports/demo-readiness': {score: 100, ready: true, checks: [{label: 'Empresa y sucursales', passed: true}, {label: 'Empleados, clientes y proveedores', passed: true}, {label: 'Compras, inventario, ventas y POS', passed: true}, {label: 'Finanzas, RRHH y reportes', passed: true}, {label: 'Adaptador sin red', passed: true}]},
    '/intelligence/dashboard': {company, summary: {activeInsights: 3, high: 1, critical: 0, medium: 1, opportunities: 1, score: 88, savingsPotential: 76450}, metrics: {values: {'sales.revenue_30d': 684920, 'purchases.total_30d': 448590, 'inventory.value': executiveSummary.inventoryValue, 'receivables.balance': 556300, 'payables.balance': 200840, 'flow.error_rate': 0}, comparisons: {'sales.revenue_30d': 7.1, 'purchases.total_30d': 9.3, 'inventory.value': 3.8}, details: {generatedAt: stamp}}, insights: [{id: 'insight-1', type: 'ALERT', title: 'Reabastecer suspensión', description: 'Horquillas y amortiguadores quedarán sin inventario en 6 días.', severity: 'HIGH', status: 'OPEN', impact: 68500, createdAt: stamp}, {id: 'insight-2', type: 'RECOMMENDATION', title: 'Cobranza Taller El Pistón', description: 'Contactar antes del vencimiento de FAC-MN-10844.', severity: 'MEDIUM', status: 'OPEN', impact: 148600, createdAt: stamp}, {id: 'insight-3', type: 'OPPORTUNITY', title: 'Campaña de flotillas rentable', description: 'Escalar presupuesto 20% manteniendo ROAS superior a 15x.', severity: 'LOW', status: 'OPEN', impact: 45800, createdAt: stamp}], definitions: dataDefinitions, comparisons: {sales: 7.1, purchases: 9.3}, forecasts: {salesNext30d: 742000, cashClosing: 1180460}, history: {series: {sales: reportMonthly.map((row) => ({label: row.month, value: row.sales})), purchases: reportMonthly.map((row) => ({label: row.month, value: row.purchases}))}, forecasts: {sales: 742000, cash: 1180460}}, details: {generatedAt: stamp}, values: executiveSummary},
    '/business-parties': {parties: [...customers.map((item) => ({...item, type: 'CUSTOMER'})), ...suppliers.map((item) => ({...item, type: 'SUPPLIER'}))], customers, suppliers, duplicates: [{id: 'dup-1', confidence: 86, primary: customers[0], duplicate: {...customers[0], id: 'cu-dup', commercialName: 'Talleres El Piston'}}]},
    '/business-parties/dashboard': {summary: {total: customers.length + suppliers.length, customers: customers.length, suppliers: suppliers.length, active: customers.length + suppliers.length, duplicates: 1}, parties: [...customers, ...suppliers], duplicates: [{id: 'dup-1', confidence: 86}], recentActivity: activityLogs},
    '/business-parties/duplicates': {duplicates: [{id: 'dup-1', confidence: 86, reason: 'RFC y nombre comercial similares', records: [customers[0], {...customers[0], id: 'cu-dup'}]}]},
    '/administration/dashboard': {company, counts: {suppliers: suppliers.length, customers: customers.length, employees: employees.length, warehouses: warehouses.length}, health: {status: 'GOOD', score: 91}, summary: executiveSummary, processStatus: [{id: 'proc-1', name: 'Procure to Pay', status: 'HEALTHY', pending: 3}, {id: 'proc-2', name: 'Order to Cash', status: 'ATTENTION', pending: 4}, {id: 'proc-3', name: 'Nómina', status: 'HEALTHY', pending: 1}], queue: approvalRequests, upcoming: {agenda: agendaEvents}, activity: activityLogs, topSuppliers: suppliers.slice(0, 3), customerBalances: commercialInvoices, humanCapital: departments, criticalStock: inventoryBalances.filter((item) => item.available <= item.minStock)},
    '/company': {company: {...company, commercialName: 'MotorNorte Refacciones', taxId: 'MRA160812MN1', email: 'ventas@motornorte.demo', phone: '81 8355 2400', website: 'https://motornorte.demo', address: 'Av. Colón 2450, Monterrey, N.L.', postalCode: '64000', branches}, branches},
  };

  function resolve(path) {
    if (/^\/customers\//.test(path)) {
      const id = path.split('/')[2];
      return {customer: customers.find((item) => item.id === id) || customers[0], customers, invoices: commercialInvoices, salesOrders, activities: crmActivities};
    }
    if (/^\/products\//.test(path)) {
      const id = path.split('/')[2];
      return {product: products.find((item) => item.id === id) || products[0], products, balances: inventoryBalances, movements: inventoryMovements, suppliers};
    }
    if (/^\/projects\//.test(path)) return {project: projects[0], projects, employees, customers, salesOrders, purchaseOrders};
    if (/^\/business-parties\/[^/]+$/.test(path)) {
      const id = path.split('/')[2];
      const party = [...customers.map((item) => ({...item, type: 'CUSTOMER'})), ...suppliers.map((item) => ({...item, type: 'SUPPLIER'}))].find((item) => item.id === id) || {...customers[0], type: 'CUSTOMER'};
      return {party: {...party, contacts: [{id: `contact-${party.id}`, name: party.contactName || 'Contacto de compras', email: party.email || 'compras@proveedor.demo', phone: party.phone || '8180000000', position: 'Compras'}], addresses: [{id: `address-${party.id}`, type: 'FISCAL', street: 'Av. Industria 1200', city: 'Monterrey', state: 'Nuevo León', postalCode: '64000', country: 'MX'}], activities: crmActivities}, customers, suppliers};
    }
    if (/^\/business-parties/.test(path)) return fixtures['/business-parties'];
    if (/^\/sales-fulfillment/.test(path)) return fixtures['/sales-fulfillment'];
    if (/^\/sales-returns/.test(path)) return fixtures['/sales-returns'];
    if (/^\/order-to-cash/.test(path)) return fixtures['/order-to-cash/dashboard'];
    if (/^\/hr-operations/.test(path)) return fixtures['/hr-operations'];
    if (/^\/payroll/.test(path)) return fixtures['/payroll'];
    if (/^\/employee-documents/.test(path)) return fixtures['/employee-documents'];
    if (/^\/fiscal/.test(path)) return fixtures['/fiscal/dashboard'];
    if (/^\/activity\/activity/.test(path)) return fixtures['/activity/activity'];
    if (/^\/approvals/.test(path)) return fixtures['/approvals/dashboard'];
    if (/^\/integrations/.test(path)) return path === '/integrations/catalog' ? fixtures['/integrations/catalog'] : fixtures['/integrations/dashboard'];
    if (/^\/master-data/.test(path)) return path === '/master-data/entities' ? fixtures['/master-data/entities'] : fixtures['/master-data/dashboard'];
    if (/^\/billing/.test(path)) return fixtures['/billing/dashboard'];
    if (/^\/budgets/.test(path)) return fixtures['/budgets'];
    if (/^\/cash-flow/.test(path)) return fixtures['/cash-flow'];
    if (/^\/flow/.test(path)) return path === '/flow/catalog' ? fixtures['/flow/catalog'] : fixtures['/flow/dashboard'];
    if (/^\/data-hub/.test(path)) return path === '/data-hub/definitions' ? fixtures['/data-hub/definitions'] : fixtures['/data-hub/dashboard'];
    if (/^\/accounts-payable/.test(path)) return path.endsWith('/catalogs') ? fixtures['/accounts-payable/catalogs'] : fixtures['/accounts-payable'];
    if (/^\/accounts-receivable/.test(path)) return path.endsWith('/catalogs') ? fixtures['/accounts-receivable/catalogs'] : fixtures['/accounts-receivable'];
    if (/^\/bank-reconciliation/.test(path)) return fixtures['/bank-reconciliation'];
    if (/^\/treasury/.test(path)) return fixtures['/treasury'];
    if (/^\/accounting/.test(path)) return fixtures['/accounting'];
    if (/^\/expenses/.test(path)) return fixtures['/expenses/dashboard'];
    if (/^\/fixed-assets/.test(path)) return fixtures['/fixed-assets/dashboard'];
    if (/^\/reports\/executive/.test(path)) return fixtures['/reports/executive'];
    if (/^\/agenda/.test(path)) return path === '/agenda/meta' ? fixtures['/agenda/meta'] : fixtures['/agenda'];
    if (/^\/activity\/notifications/.test(path)) return fixtures['/activity/notifications'];
    return null;
  }

  return {fixtures, resolve};
}
