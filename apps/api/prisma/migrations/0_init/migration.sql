-- BuzzBee ERP v18.2.0 initial Prisma baseline
-- Generated from apps/api/prisma/schema.prisma

CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'ANNUAL');
CREATE TYPE "BillingInvoiceStatus" AS ENUM ('DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE');
CREATE TYPE "BillingPaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED');
CREATE TYPE "SubscriptionChangeType" AS ENUM ('UPGRADE', 'DOWNGRADE', 'CYCLE_CHANGE');
CREATE TYPE "SubscriptionChangeStatus" AS ENUM ('PENDING', 'APPLIED', 'CANCELLED');
CREATE TYPE "ApprovalRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE "ApprovalStepStatus" AS ENUM ('WAITING', 'PENDING', 'APPROVED', 'REJECTED', 'SKIPPED');
CREATE TYPE "ApprovalActorType" AS ENUM ('USER', 'ROLE', 'PERMISSION');
CREATE TYPE "ExpenseStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAID', 'CANCELLED');
CREATE TYPE "ExpensePaymentMethod" AS ENUM ('CASH', 'CORPORATE_CARD', 'PERSONAL_CARD', 'TRANSFER', 'OTHER');
CREATE TYPE "FixedAssetStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DISPOSED', 'SOLD', 'LOST');
CREATE TYPE "DepreciationMethod" AS ENUM ('STRAIGHT_LINE');
CREATE TYPE "MasterDataEntityType" AS ENUM ('CUSTOMER', 'SUPPLIER', 'PRODUCT', 'EMPLOYEE');
CREATE TYPE "DataQualityIssueType" AS ENUM ('DUPLICATE', 'MISSING_REQUIRED', 'INVALID_FORMAT', 'INCOMPLETE');
CREATE TYPE "DataQualityIssueStatus" AS ENUM ('OPEN', 'RESOLVED', 'IGNORED');
CREATE TYPE "DataImportStatus" AS ENUM ('PREVIEW', 'READY', 'IMPORTING', 'COMPLETED', 'COMPLETED_WITH_ERRORS', 'FAILED', 'CANCELLED', 'ROLLING_BACK', 'ROLLED_BACK', 'ROLLBACK_PARTIAL');
CREATE TYPE "DataImportMode" AS ENUM ('CREATE_ONLY', 'UPSERT');
CREATE TYPE "DataImportAction" AS ENUM ('CREATE', 'UPDATE');
CREATE TYPE "DataImportEntityType" AS ENUM ('CUSTOMER', 'SUPPLIER', 'PRODUCT', 'EMPLOYEE');
CREATE TYPE "DataImportRowStatus" AS ENUM ('VALID', 'INVALID', 'IMPORTED', 'SKIPPED', 'ERROR', 'ROLLED_BACK', 'ROLLBACK_ERROR');
CREATE TYPE "IntegrationConnectionStatus" AS ENUM ('ACTIVE', 'DISABLED', 'ERROR');
CREATE TYPE "ApiCredentialStatus" AS ENUM ('ACTIVE', 'REVOKED');
CREATE TYPE "WebhookDeliveryStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
CREATE TYPE "IntegrationEventStatus" AS ENUM ('PENDING', 'DISPATCHED', 'PARTIAL', 'FAILED');
CREATE TYPE "WebhookQueueStatus" AS ENUM ('READY', 'PROCESSING', 'RETRY_WAIT', 'COMPLETED', 'DEAD_LETTER');
CREATE TYPE "FlowRunStatus" AS ENUM ('RUNNING', 'COMPLETED', 'COMPLETED_WITH_ERRORS', 'SKIPPED', 'FAILED');
CREATE TYPE "FlowActionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'SKIPPED');
CREATE TYPE "IntelligenceInsightSeverity" AS ENUM ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "IntelligenceInsightStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED');
CREATE TYPE "IntelligenceInsightType" AS ENUM ('ALERT', 'ANOMALY', 'RECOMMENDATION', 'OPPORTUNITY');
CREATE TYPE "BusinessPartyType" AS ENUM ('ORGANIZATION', 'PERSON');
CREATE TYPE "BusinessPartyRoleType" AS ENUM ('CUSTOMER', 'SUPPLIER', 'LEAD', 'CONTACT', 'PARTNER', 'OTHER');
CREATE TYPE "BusinessPartyAddressType" AS ENUM ('FISCAL', 'BILLING', 'SHIPPING', 'OFFICE', 'OTHER');
CREATE TYPE "PurchaseRequestStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'ORDERED', 'CANCELLED');
CREATE TYPE "PurchasePriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');
CREATE TYPE "GoodsReceiptStatus" AS ENUM ('POSTED', 'CANCELLED');
CREATE TYPE "InventoryMovementType" AS ENUM ('PURCHASE_RECEIPT', 'PURCHASE_RECEIPT_REVERSAL', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'TRANSFER_IN', 'TRANSFER_OUT', 'SALE_OUT', 'SALE_RETURN_IN');
CREATE TYPE "InventoryAdjustmentDirection" AS ENUM ('IN', 'OUT');
CREATE TYPE "InventoryTransferStatus" AS ENUM ('POSTED', 'CANCELLED');
CREATE TYPE "AccountsPayableStatus" AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE "AccountsReceivableStatus" AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'LEAVE', 'TERMINATED');
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'LATE', 'ABSENT', 'REMOTE', 'DAY_OFF');
CREATE TYPE "LeaveType" AS ENUM ('VACATION', 'PERSONAL', 'MEDICAL', 'MATERNITY', 'PATERNITY', 'UNPAID', 'OTHER');
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE "HrIncidentType" AS ENUM ('ABSENCE', 'LATE_ARRIVAL', 'OVERTIME', 'DISCIPLINARY', 'ACCIDENT', 'BONUS', 'DEDUCTION', 'OTHER');
CREATE TYPE "EmployeeDocumentType" AS ENUM ('IDENTIFICATION', 'TAX_DOCUMENT', 'SOCIAL_SECURITY', 'ADDRESS_PROOF', 'CONTRACT', 'CURP', 'BIRTH_CERTIFICATE', 'EDUCATION', 'MEDICAL', 'CONFIDENTIALITY', 'OTHER');
CREATE TYPE "EmployeeDocumentStatus" AS ENUM ('PENDING', 'VALID', 'EXPIRING', 'EXPIRED', 'REJECTED');
CREATE TYPE "PayrollPeriodStatus" AS ENUM ('DRAFT', 'CALCULATED', 'APPROVED', 'PAID', 'CANCELLED');
CREATE TYPE "AgendaEventPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
CREATE TYPE "AgendaEventStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR');
CREATE TYPE "TreasuryAccountType" AS ENUM ('CASH', 'BANK');
CREATE TYPE "TreasuryMovementType" AS ENUM ('INCOME', 'EXPENSE', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT');
CREATE TYPE "BudgetStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED', 'CANCELLED');
CREATE TYPE "SalesQuoteStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED', 'CANCELLED');
CREATE TYPE "SalesOrderStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'PARTIALLY_DELIVERED', 'DELIVERED', 'INVOICED', 'CANCELLED');
CREATE TYPE "ProspectStage" AS ENUM ('LEAD', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST');
CREATE TYPE "SalesActivityType" AS ENUM ('NOTE', 'CALL', 'EMAIL', 'MEETING', 'TASK', 'STATUS_CHANGE');
CREATE TYPE "SalesDeliveryStatus" AS ENUM ('DRAFT', 'POSTED', 'CANCELLED');
CREATE TYPE "SalesInvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE "SalesReturnStatus" AS ENUM ('DRAFT', 'POSTED', 'CANCELLED');
CREATE TYPE "SalesCreditNoteStatus" AS ENUM ('DRAFT', 'ISSUED', 'APPLIED', 'CANCELLED');
CREATE TYPE "CollectionReceiptStatus" AS ENUM ('DRAFT', 'APPLIED', 'CANCELLED');
CREATE TYPE "CollectionPaymentMethod" AS ENUM ('CASH', 'TRANSFER', 'CARD', 'CHECK', 'OTHER');
CREATE TYPE "BankStatementStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'RECONCILED', 'CLOSED');
CREATE TYPE "BankStatementLineType" AS ENUM ('CREDIT', 'DEBIT');
CREATE TYPE "BankStatementLineStatus" AS ENUM ('PENDING', 'MATCHED', 'IGNORED');
CREATE TYPE "CashFlowScenarioStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "CashFlowAdjustmentType" AS ENUM ('INFLOW', 'OUTFLOW');
CREATE TYPE "AccountingAccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');
CREATE TYPE "AccountingNature" AS ENUM ('DEBIT', 'CREDIT');
CREATE TYPE "AccountingPeriodStatus" AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE "JournalEntryStatus" AS ENUM ('DRAFT', 'POSTED', 'CANCELLED');
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED');
CREATE TYPE "ProjectPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "ProjectTaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED');
CREATE TYPE "MarketingCampaignStatus" AS ENUM ('DRAFT', 'PLANNED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "MarketingObjective" AS ENUM ('AWARENESS', 'LEAD_GENERATION', 'SALES', 'RETENTION', 'EVENT', 'OTHER');
CREATE TYPE "MarketingChannelType" AS ENUM ('SEARCH', 'SOCIAL', 'EMAIL', 'CONTENT', 'EVENT', 'REFERRAL', 'DISPLAY', 'OFFLINE', 'OTHER');
CREATE TYPE "MarketingCalendarEventType" AS ENUM ('CAMPAIGN', 'CONTENT', 'EMAIL', 'SOCIAL', 'EVENT', 'MILESTONE', 'OTHER');
CREATE TYPE "FiscalDocumentStatus" AS ENUM ('DRAFT', 'READY', 'STAMPED', 'CANCEL_PENDING', 'CANCELLED', 'ERROR');
CREATE TYPE "FiscalTaxKind" AS ENUM ('TRANSFER', 'WITHHOLDING');
CREATE TYPE "FiscalFactorType" AS ENUM ('RATE', 'QUOTA', 'EXEMPT');
CREATE TYPE "FiscalCancellationStatus" AS ENUM ('REQUESTED', 'ACCEPTED', 'REJECTED', 'NOT_REQUIRED', 'ERROR');
CREATE TYPE "ProductionOrderStatus" AS ENUM ('DRAFT', 'PLANNED', 'RELEASED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "ProductionOperationStatus" AS ENUM ('PENDING', 'READY', 'IN_PROGRESS', 'PAUSED', 'DONE', 'CANCELLED');
CREATE TYPE "ProductionCostType" AS ENUM ('MATERIAL', 'LABOR', 'OVERHEAD', 'OUTSOURCED', 'OTHER');
CREATE TYPE "PosSessionStatus" AS ENUM ('OPEN', 'CLOSED', 'CANCELLED');
CREATE TYPE "PosSaleStatus" AS ENUM ('OPEN', 'PAID', 'VOID', 'REFUNDED');
CREATE TYPE "PosPaymentMethod" AS ENUM ('CASH', 'CARD', 'TRANSFER', 'WALLET', 'CREDIT', 'OTHER');
CREATE TYPE "PosCashMovementType" AS ENUM ('OPENING', 'SALE', 'CASH_IN', 'CASH_OUT', 'REFUND', 'CLOSING', 'ADJUSTMENT');
CREATE TYPE "SubscriptionStatus" AS ENUM ('TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELLED', 'EXPIRED');
CREATE TYPE "UsageMetricType" AS ENUM ('COUNT', 'STORAGE_MB', 'API_CALLS', 'TRANSACTIONS', 'USERS', 'CUSTOM');

CREATE TABLE "Company" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "legalName" TEXT,
  "taxId" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "website" TEXT,
  "industry" TEXT,
  "country" TEXT NOT NULL DEFAULT 'MX',
  "currency" TEXT NOT NULL DEFAULT 'MXN',
  "timezone" TEXT NOT NULL DEFAULT 'America/Monterrey',
  "address" TEXT,
  "logoUrl" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IdempotencyRecord" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "requestHash" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PROCESSING',
  "responseStatus" INTEGER,
  "responseBody" JSONB,
  "resourceType" TEXT,
  "resourceId" TEXT,
  "requestId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "expiresAt" TIMESTAMP(3),
  CONSTRAINT "IdempotencyRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SequenceCounter" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "period" TEXT NOT NULL,
  "value" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SequenceCounter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Branch" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "address" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Warehouse" (
  "id" TEXT NOT NULL,
  "branchId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "companyId" TEXT,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "lastLoginAt" TIMESTAMP(3),
  "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
  "lockedUntil" TIMESTAMP(3),
  "sessionVersion" INTEGER NOT NULL DEFAULT 1,
  "mfaEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
  "mfaSecretEncrypted" TEXT,
  "mfaEnrolledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Role" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Permission" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserRole" (
  "userId" TEXT NOT NULL,
  "roleId" TEXT NOT NULL,
  CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId", "roleId")
);

CREATE TABLE "RolePermission" (
  "roleId" TEXT NOT NULL,
  "permissionId" TEXT NOT NULL,
  CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId", "permissionId")
);

CREATE TABLE "Supplier" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "legalName" TEXT NOT NULL,
  "commercialName" TEXT,
  "taxId" TEXT,
  "contactName" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "paymentTerms" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductCategory" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "categoryId" TEXT,
  "sku" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "unit" TEXT NOT NULL DEFAULT 'PZA',
  "cost" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "price" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "minStock" DECIMAL(12,3) NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "description" TEXT,
  "ipAddress" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PurchaseRequest" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "warehouseId" TEXT NOT NULL,
  "requestedById" TEXT NOT NULL,
  "folio" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "justification" TEXT,
  "priority" "PurchasePriority" NOT NULL DEFAULT 'NORMAL',
  "status" "PurchaseRequestStatus" NOT NULL DEFAULT 'DRAFT',
  "requiredDate" TIMESTAMP(3),
  "submittedAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "resolvedById" TEXT,
  "resolutionNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PurchaseRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PurchaseRequestItem" (
  "id" TEXT NOT NULL,
  "purchaseRequestId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" DECIMAL(12,3) NOT NULL,
  "estimatedUnitCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PurchaseRequestItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PurchaseOrder" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "supplierId" TEXT NOT NULL,
  "warehouseId" TEXT NOT NULL,
  "purchaseRequestId" TEXT,
  "createdById" TEXT NOT NULL,
  "folio" TEXT NOT NULL,
  "status" "PurchaseOrderStatus" NOT NULL DEFAULT 'DRAFT',
  "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expectedDate" TIMESTAMP(3),
  "currency" TEXT NOT NULL DEFAULT 'MXN',
  "paymentTerms" INTEGER NOT NULL DEFAULT 0,
  "notes" TEXT,
  "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "taxAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "issuedAt" TIMESTAMP(3),
  "receivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PurchaseOrder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PurchaseOrderItem" (
  "id" TEXT NOT NULL,
  "purchaseOrderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" DECIMAL(12,3) NOT NULL,
  "receivedQuantity" DECIMAL(12,3) NOT NULL DEFAULT 0,
  "unitCost" DECIMAL(12,2) NOT NULL,
  "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 16,
  "subtotal" DECIMAL(14,2) NOT NULL,
  "taxAmount" DECIMAL(14,2) NOT NULL,
  "total" DECIMAL(14,2) NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PurchaseOrderItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GoodsReceipt" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "purchaseOrderId" TEXT NOT NULL,
  "warehouseId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "folio" TEXT NOT NULL,
  "status" "GoodsReceiptStatus" NOT NULL DEFAULT 'POSTED',
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "supplierDocument" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GoodsReceipt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GoodsReceiptItem" (
  "id" TEXT NOT NULL,
  "goodsReceiptId" TEXT NOT NULL,
  "purchaseOrderItemId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" DECIMAL(12,3) NOT NULL,
  "unitCost" DECIMAL(12,2) NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GoodsReceiptItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InventoryBalance" (
  "id" TEXT NOT NULL,
  "warehouseId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" DECIMAL(14,3) NOT NULL DEFAULT 0,
  "averageCost" DECIMAL(14,4) NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryBalance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InventoryMovement" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "warehouseId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "goodsReceiptId" TEXT,
  "createdById" TEXT NOT NULL,
  "type" "InventoryMovementType" NOT NULL,
  "reference" TEXT,
  "quantity" DECIMAL(14,3) NOT NULL,
  "unitCost" DECIMAL(14,4) NOT NULL DEFAULT 0,
  "balanceAfter" DECIMAL(14,3) NOT NULL,
  "notes" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InventoryAdjustment" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "warehouseId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "folio" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "notes" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryAdjustment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InventoryAdjustmentItem" (
  "id" TEXT NOT NULL,
  "adjustmentId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "direction" "InventoryAdjustmentDirection" NOT NULL,
  "quantity" DECIMAL(14,3) NOT NULL,
  "unitCost" DECIMAL(14,4) NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryAdjustmentItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InventoryTransfer" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "fromWarehouseId" TEXT NOT NULL,
  "toWarehouseId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "folio" TEXT NOT NULL,
  "status" "InventoryTransferStatus" NOT NULL DEFAULT 'POSTED',
  "notes" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryTransfer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InventoryTransferItem" (
  "id" TEXT NOT NULL,
  "transferId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" DECIMAL(14,3) NOT NULL,
  "unitCost" DECIMAL(14,4) NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryTransferItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AccountsPayable" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "supplierId" TEXT NOT NULL,
  "purchaseOrderId" TEXT,
  "createdById" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  "issueDate" TIMESTAMP(3) NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'MXN',
  "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "taxAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(14,2) NOT NULL,
  "paidAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "status" "AccountsPayableStatus" NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AccountsPayable_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SupplierPayment" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "accountsPayableId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "folio" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "method" TEXT NOT NULL,
  "reference" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SupplierPayment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Customer" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "legalName" TEXT NOT NULL,
  "commercialName" TEXT,
  "taxId" TEXT,
  "contactName" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "creditDays" INTEGER NOT NULL DEFAULT 0,
  "creditLimit" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AccountsReceivable" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  "issueDate" TIMESTAMP(3) NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'MXN',
  "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "taxAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(14,2) NOT NULL,
  "paidAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "status" "AccountsReceivableStatus" NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AccountsReceivable_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CustomerPayment" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "accountsReceivableId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "folio" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "method" TEXT NOT NULL,
  "reference" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerPayment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Department" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Position" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "departmentId" TEXT,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Employee" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "branchId" TEXT,
  "departmentId" TEXT,
  "positionId" TEXT,
  "employeeNumber" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "hireDate" TIMESTAMP(3) NOT NULL,
  "dateOfBirth" TIMESTAMP(3),
  "salary" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AttendanceRecord" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "checkIn" TIMESTAMP(3),
  "checkOut" TIMESTAMP(3),
  "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AttendanceRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeaveRequest" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "type" "LeaveType" NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "days" DECIMAL(6,2) NOT NULL,
  "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
  "reason" TEXT,
  "resolution" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "HrIncident" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "type" "HrIncidentType" NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "amount" DECIMAL(14,2),
  "description" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "HrIncident_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmployeeDocument" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "type" "EmployeeDocumentType" NOT NULL,
  "name" TEXT NOT NULL,
  "fileUrl" TEXT,
  "fileName" TEXT,
  "issuedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "status" "EmployeeDocumentStatus" NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "EmployeeDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PayrollPeriod" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "folio" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "paymentDate" TIMESTAMP(3) NOT NULL,
  "status" "PayrollPeriodStatus" NOT NULL DEFAULT 'DRAFT',
  "notes" TEXT,
  "totalGross" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "totalDeductions" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "totalNet" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PayrollPeriod_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PayrollItem" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "payrollPeriodId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "baseSalary" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "bonuses" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "overtime" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "deductions" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "grossPay" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "netPay" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PayrollItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgendaEvent" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3),
  "allDay" BOOLEAN NOT NULL DEFAULT FALSE,
  "priority" "AgendaEventPriority" NOT NULL DEFAULT 'NORMAL',
  "status" "AgendaEventStatus" NOT NULL DEFAULT 'ACTIVE',
  "reminderMinutes" INTEGER,
  "reminderSentAt" TIMESTAMP(3),
  "assigneeEmployeeId" TEXT,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AgendaEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "userId" TEXT,
  "type" "NotificationType" NOT NULL DEFAULT 'INFO',
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "link" TEXT,
  "read" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "readAt" TIMESTAMP(3),
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TreasuryAccount" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "TreasuryAccountType" NOT NULL,
  "bankName" TEXT,
  "accountNumber" TEXT,
  "currency" TEXT NOT NULL DEFAULT 'MXN',
  "openingBalance" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "currentBalance" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TreasuryAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TreasuryMovement" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "folio" TEXT NOT NULL,
  "type" "TreasuryMovementType" NOT NULL,
  "movementDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "amount" DECIMAL(14,2) NOT NULL,
  "balanceAfter" DECIMAL(14,2) NOT NULL,
  "concept" TEXT NOT NULL,
  "category" TEXT,
  "reference" TEXT,
  "referenceType" TEXT,
  "referenceId" TEXT,
  "transferGroup" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TreasuryMovement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CostCenter" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CostCenter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Budget" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "status" "BudgetStatus" NOT NULL DEFAULT 'DRAFT',
  "notes" TEXT,
  "totalAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BudgetLine" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "budgetId" TEXT NOT NULL,
  "costCenterId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "month" INTEGER NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BudgetLine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesQuote" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "folio" TEXT NOT NULL,
  "quoteDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "validUntil" TIMESTAMP(3) NOT NULL,
  "status" "SalesQuoteStatus" NOT NULL DEFAULT 'DRAFT',
  "currency" TEXT NOT NULL DEFAULT 'MXN',
  "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "taxTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "notes" TEXT,
  "terms" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SalesQuote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesQuoteItem" (
  "id" TEXT NOT NULL,
  "salesQuoteId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "description" TEXT,
  "quantity" DECIMAL(14,3) NOT NULL,
  "unitPrice" DECIMAL(14,2) NOT NULL,
  "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 16,
  "subtotal" DECIMAL(14,2) NOT NULL,
  "taxAmount" DECIMAL(14,2) NOT NULL,
  "total" DECIMAL(14,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SalesQuoteItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesOrder" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "salesQuoteId" TEXT,
  "createdById" TEXT NOT NULL,
  "folio" TEXT NOT NULL,
  "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deliveryDate" TIMESTAMP(3),
  "status" "SalesOrderStatus" NOT NULL DEFAULT 'DRAFT',
  "currency" TEXT NOT NULL DEFAULT 'MXN',
  "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "taxTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "notes" TEXT,
  "shippingAddress" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SalesOrder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesOrderItem" (
  "id" TEXT NOT NULL,
  "salesOrderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "description" TEXT,
  "quantity" DECIMAL(14,3) NOT NULL,
  "deliveredQty" DECIMAL(14,3) NOT NULL DEFAULT 0,
  "unitPrice" DECIMAL(14,2) NOT NULL,
  "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 16,
  "subtotal" DECIMAL(14,2) NOT NULL,
  "taxAmount" DECIMAL(14,2) NOT NULL,
  "total" DECIMAL(14,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SalesOrderItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Prospect" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "companyName" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "stage" "ProspectStage" NOT NULL DEFAULT 'LEAD',
  "estimatedValue" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "probability" INTEGER NOT NULL DEFAULT 10,
  "source" TEXT,
  "nextActionAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesActivity" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "prospectId" TEXT,
  "customerId" TEXT,
  "salesQuoteId" TEXT,
  "salesOrderId" TEXT,
  "type" "SalesActivityType" NOT NULL DEFAULT 'NOTE',
  "title" TEXT NOT NULL,
  "description" TEXT,
  "dueAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SalesActivity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesDelivery" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "salesOrderId" TEXT NOT NULL,
  "warehouseId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "folio" TEXT NOT NULL,
  "deliveryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" "SalesDeliveryStatus" NOT NULL DEFAULT 'DRAFT',
  "recipientName" TEXT,
  "reference" TEXT,
  "shippingAddress" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SalesDelivery_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesDeliveryItem" (
  "id" TEXT NOT NULL,
  "salesDeliveryId" TEXT NOT NULL,
  "salesOrderItemId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" DECIMAL(14,3) NOT NULL,
  "unitCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SalesDeliveryItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesInvoice" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "salesOrderId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "status" "SalesInvoiceStatus" NOT NULL DEFAULT 'DRAFT',
  "currency" TEXT NOT NULL DEFAULT 'MXN',
  "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "taxTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "paidAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SalesInvoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesReturn" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "salesDeliveryId" TEXT NOT NULL,
  "warehouseId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "folio" TEXT NOT NULL,
  "returnDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" "SalesReturnStatus" NOT NULL DEFAULT 'DRAFT',
  "reason" TEXT NOT NULL,
  "reference" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SalesReturn_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesReturnItem" (
  "id" TEXT NOT NULL,
  "salesReturnId" TEXT NOT NULL,
  "salesDeliveryItemId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" DECIMAL(14,3) NOT NULL,
  "unitCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SalesReturnItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SalesCreditNote" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "salesInvoiceId" TEXT NOT NULL,
  "salesReturnId" TEXT,
  "createdById" TEXT NOT NULL,
  "folio" TEXT NOT NULL,
  "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" "SalesCreditNoteStatus" NOT NULL DEFAULT 'DRAFT',
  "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "taxTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "reason" TEXT NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SalesCreditNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CollectionReceipt" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "treasuryAccountId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "folio" TEXT NOT NULL,
  "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "amount" DECIMAL(14,2) NOT NULL,
  "unappliedAmount" DECIMAL(14,2) NOT NULL,
  "method" "CollectionPaymentMethod" NOT NULL,
  "reference" TEXT,
  "notes" TEXT,
  "status" "CollectionReceiptStatus" NOT NULL DEFAULT 'DRAFT',
  "treasuryMovementId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CollectionReceipt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CollectionApplication" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "collectionReceiptId" TEXT NOT NULL,
  "accountsReceivableId" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CollectionApplication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BankStatement" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "treasuryAccountId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "folio" TEXT NOT NULL,
  "statementDate" TIMESTAMP(3) NOT NULL,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "openingBalance" DECIMAL(14,2) NOT NULL,
  "closingBalance" DECIMAL(14,2) NOT NULL,
  "status" "BankStatementStatus" NOT NULL DEFAULT 'DRAFT',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BankStatement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BankStatementLine" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "bankStatementId" TEXT NOT NULL,
  "treasuryMovementId" TEXT,
  "reconciledById" TEXT,
  "transactionDate" TIMESTAMP(3) NOT NULL,
  "description" TEXT NOT NULL,
  "reference" TEXT,
  "type" "BankStatementLineType" NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "bankBalance" DECIMAL(14,2),
  "status" "BankStatementLineStatus" NOT NULL DEFAULT 'PENDING',
  "reconciledAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BankStatementLine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CashFlowScenario" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "status" "CashFlowScenarioStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CashFlowScenario_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CashFlowAdjustment" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "scenarioId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "type" "CashFlowAdjustmentType" NOT NULL,
  "category" TEXT NOT NULL,
  "concept" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "probability" INTEGER NOT NULL DEFAULT 100,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CashFlowAdjustment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AccountingAccount" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "parentId" TEXT,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "AccountingAccountType" NOT NULL,
  "nature" "AccountingNature" NOT NULL,
  "level" INTEGER NOT NULL DEFAULT 1,
  "allowsPosting" BOOLEAN NOT NULL DEFAULT TRUE,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AccountingAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AccountingPeriod" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "status" "AccountingPeriodStatus" NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AccountingPeriod_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JournalEntry" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "periodId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "postedById" TEXT,
  "folio" TEXT NOT NULL,
  "entryDate" TIMESTAMP(3) NOT NULL,
  "concept" TEXT NOT NULL,
  "status" "JournalEntryStatus" NOT NULL DEFAULT 'DRAFT',
  "sourceType" TEXT,
  "sourceId" TEXT,
  "sourceFolio" TEXT,
  "notes" TEXT,
  "postedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JournalLine" (
  "id" TEXT NOT NULL,
  "entryId" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "concept" TEXT,
  "debit" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "credit" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "reference" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "JournalLine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Project" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "customerId" TEXT,
  "managerId" TEXT,
  "createdById" TEXT NOT NULL,
  "parentProjectId" TEXT,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
  "priority" "ProjectPriority" NOT NULL DEFAULT 'MEDIUM',
  "startDate" TIMESTAMP(3),
  "dueDate" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "budget" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "plannedHours" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "progress" INTEGER NOT NULL DEFAULT 0,
  "tags" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectMember" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "role" TEXT,
  "allocationPercent" INTEGER NOT NULL DEFAULT 100,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectTask" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "assigneeId" TEXT,
  "parentTaskId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "ProjectTaskStatus" NOT NULL DEFAULT 'TODO',
  "priority" "ProjectPriority" NOT NULL DEFAULT 'MEDIUM',
  "startDate" TIMESTAMP(3),
  "dueDate" TIMESTAMP(3),
  "estimatedHours" DECIMAL(10,2) NOT NULL DEFAULT 0,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProjectTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectTimeEntry" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "taskId" TEXT,
  "employeeId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "hours" DECIMAL(10,2) NOT NULL,
  "hourlyCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectTimeEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectComment" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "taskId" TEXT,
  "createdById" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectComment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectDocument" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "uploadedById" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "fileName" TEXT,
  "fileUrl" TEXT NOT NULL,
  "mimeType" TEXT,
  "size" INTEGER,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectSalesOrder" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "salesOrderId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectSalesOrder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectPurchaseOrder" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "purchaseOrderId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectPurchaseOrder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketingChannel" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "MarketingChannelType" NOT NULL DEFAULT 'OTHER',
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketingChannel_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketingCampaign" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "channelId" TEXT,
  "createdById" TEXT NOT NULL,
  "ownerId" TEXT,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "objective" "MarketingObjective" NOT NULL DEFAULT 'LEAD_GENERATION',
  "status" "MarketingCampaignStatus" NOT NULL DEFAULT 'DRAFT',
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "budget" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "targetAudience" TEXT,
  "description" TEXT,
  "utmSource" TEXT,
  "utmMedium" TEXT,
  "utmCampaign" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketingCampaign_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketingCampaignLead" (
  "id" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "prospectId" TEXT NOT NULL,
  "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "source" TEXT,
  "medium" TEXT,
  "content" TEXT,
  "term" TEXT,
  "landingUrl" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MarketingCampaignLead_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketingCampaignOpportunity" (
  "id" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "prospectId" TEXT NOT NULL,
  "customerId" TEXT,
  "salesOrderId" TEXT,
  "attributedRevenue" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "attributionPct" INTEGER NOT NULL DEFAULT 100,
  "convertedAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketingCampaignOpportunity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketingCampaignExpense" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT,
  "vendor" TEXT,
  "amount" DECIMAL(14,2) NOT NULL,
  "reference" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MarketingCampaignExpense_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketingCalendarEvent" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "campaignId" TEXT,
  "createdById" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "type" "MarketingCalendarEventType" NOT NULL DEFAULT 'OTHER',
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3),
  "channel" TEXT,
  "ownerName" TEXT,
  "description" TEXT,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketingCalendarEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketingMetric" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "impressions" INTEGER NOT NULL DEFAULT 0,
  "clicks" INTEGER NOT NULL DEFAULT 0,
  "sessions" INTEGER NOT NULL DEFAULT 0,
  "leads" INTEGER NOT NULL DEFAULT 0,
  "conversions" INTEGER NOT NULL DEFAULT 0,
  "spend" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "revenue" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MarketingMetric_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FiscalIssuerProfile" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "rfc" TEXT NOT NULL,
  "legalName" TEXT NOT NULL,
  "fiscalRegime" TEXT NOT NULL,
  "postalCode" TEXT NOT NULL,
  "certificateNumber" TEXT,
  "pacProvider" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FiscalIssuerProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FiscalCustomerProfile" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "rfc" TEXT NOT NULL,
  "legalName" TEXT NOT NULL,
  "fiscalRegime" TEXT NOT NULL,
  "postalCode" TEXT NOT NULL,
  "defaultUseCfdi" TEXT NOT NULL DEFAULT 'G03',
  "foreignTaxId" TEXT,
  "countryCode" TEXT NOT NULL DEFAULT 'MEX',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FiscalCustomerProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FiscalInvoice" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "salesInvoiceId" TEXT,
  "salesOrderId" TEXT,
  "customerId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "series" TEXT,
  "folio" TEXT NOT NULL,
  "version" TEXT NOT NULL DEFAULT '4.0',
  "cfdiType" TEXT NOT NULL DEFAULT 'I',
  "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "currency" TEXT NOT NULL DEFAULT 'MXN',
  "exchangeRate" DECIMAL(14,6) NOT NULL DEFAULT 1,
  "paymentMethod" TEXT NOT NULL DEFAULT 'PUE',
  "paymentForm" TEXT,
  "placeOfIssue" TEXT NOT NULL,
  "exportCode" TEXT NOT NULL DEFAULT '01',
  "useCfdi" TEXT NOT NULL DEFAULT 'G03',
  "status" "FiscalDocumentStatus" NOT NULL DEFAULT 'DRAFT',
  "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "discount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "transferredTaxes" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "withheldTaxes" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "uuid" TEXT,
  "stampedAt" TIMESTAMP(3),
  "certificateNumber" TEXT,
  "satCertificate" TEXT,
  "pacProvider" TEXT,
  "satStatus" TEXT,
  "xmlUrl" TEXT,
  "pdfUrl" TEXT,
  "notes" TEXT,
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FiscalInvoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FiscalInvoiceItem" (
  "id" TEXT NOT NULL,
  "fiscalInvoiceId" TEXT NOT NULL,
  "lineNumber" INTEGER NOT NULL,
  "satProductCode" TEXT NOT NULL,
  "identification" TEXT,
  "description" TEXT NOT NULL,
  "quantity" DECIMAL(14,3) NOT NULL,
  "unitCode" TEXT NOT NULL,
  "unitName" TEXT,
  "unitValue" DECIMAL(14,6) NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "discount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "taxObject" TEXT NOT NULL DEFAULT '02',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FiscalInvoiceItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FiscalInvoiceTax" (
  "id" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "kind" "FiscalTaxKind" NOT NULL,
  "taxCode" TEXT NOT NULL,
  "factorType" "FiscalFactorType" NOT NULL DEFAULT 'RATE',
  "taxBase" DECIMAL(14,2) NOT NULL,
  "rateOrQuota" DECIMAL(14,6),
  "amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  CONSTRAINT "FiscalInvoiceTax_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FiscalCancellation" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "fiscalInvoiceId" TEXT NOT NULL,
  "requestedById" TEXT NOT NULL,
  "reasonCode" TEXT NOT NULL,
  "replacementUuid" TEXT,
  "status" "FiscalCancellationStatus" NOT NULL DEFAULT 'REQUESTED',
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  "satResponse" TEXT,
  "notes" TEXT,
  CONSTRAINT "FiscalCancellation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FiscalPaymentComplement" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "collectionReceiptId" TEXT,
  "customerId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "series" TEXT,
  "folio" TEXT NOT NULL,
  "version" TEXT NOT NULL DEFAULT '2.0',
  "cfdiVersion" TEXT NOT NULL DEFAULT '4.0',
  "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "placeOfIssue" TEXT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'XXX',
  "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "status" "FiscalDocumentStatus" NOT NULL DEFAULT 'DRAFT',
  "uuid" TEXT,
  "stampedAt" TIMESTAMP(3),
  "pacProvider" TEXT,
  "xmlUrl" TEXT,
  "pdfUrl" TEXT,
  "lastError" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FiscalPaymentComplement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FiscalPayment" (
  "id" TEXT NOT NULL,
  "paymentComplementId" TEXT NOT NULL,
  "paymentDate" TIMESTAMP(3) NOT NULL,
  "paymentForm" TEXT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'MXN',
  "exchangeRate" DECIMAL(14,6) NOT NULL DEFAULT 1,
  "amount" DECIMAL(14,2) NOT NULL,
  "operationNumber" TEXT,
  "payerBankRfc" TEXT,
  "beneficiaryBankRfc" TEXT,
  "payerAccount" TEXT,
  "beneficiaryAccount" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FiscalPayment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FiscalPaymentRelatedDocument" (
  "id" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,
  "fiscalInvoiceId" TEXT NOT NULL,
  "documentUuid" TEXT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'MXN',
  "installment" INTEGER NOT NULL DEFAULT 1,
  "previousBalance" DECIMAL(14,2) NOT NULL,
  "paidAmount" DECIMAL(14,2) NOT NULL,
  "remainingBalance" DECIMAL(14,2) NOT NULL,
  "taxObject" TEXT NOT NULL DEFAULT '02',
  CONSTRAINT "FiscalPaymentRelatedDocument_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductionWorkCenter" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "capacityPerDay" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "hourlyRate" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductionWorkCenter_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BillOfMaterials" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "finishedProductId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "baseQuantity" DECIMAL(12,3) NOT NULL DEFAULT 1,
  "notes" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BillOfMaterials_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BillOfMaterialsItem" (
  "id" TEXT NOT NULL,
  "bomId" TEXT NOT NULL,
  "componentId" TEXT NOT NULL,
  "quantity" DECIMAL(14,4) NOT NULL,
  "wastePercent" DECIMAL(7,3) NOT NULL DEFAULT 0,
  "notes" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "BillOfMaterialsItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductionOrder" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "bomId" TEXT,
  "salesOrderId" TEXT,
  "projectId" TEXT,
  "issueWarehouseId" TEXT,
  "receiptWarehouseId" TEXT,
  "createdById" TEXT NOT NULL,
  "folio" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "status" "ProductionOrderStatus" NOT NULL DEFAULT 'DRAFT',
  "priority" "ProjectPriority" NOT NULL DEFAULT 'MEDIUM',
  "plannedQuantity" DECIMAL(14,3) NOT NULL,
  "producedQuantity" DECIMAL(14,3) NOT NULL DEFAULT 0,
  "rejectedQuantity" DECIMAL(14,3) NOT NULL DEFAULT 0,
  "plannedStartAt" TIMESTAMP(3),
  "plannedEndAt" TIMESTAMP(3),
  "actualStartAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductionOrder_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductionOrderMaterial" (
  "id" TEXT NOT NULL,
  "productionOrderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "plannedQuantity" DECIMAL(14,4) NOT NULL,
  "issuedQuantity" DECIMAL(14,4) NOT NULL DEFAULT 0,
  "unitCost" DECIMAL(14,4) NOT NULL DEFAULT 0,
  "notes" TEXT,
  CONSTRAINT "ProductionOrderMaterial_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductionOrderOutput" (
  "id" TEXT NOT NULL,
  "productionOrderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" DECIMAL(14,3) NOT NULL,
  "unitCost" DECIMAL(14,4) NOT NULL DEFAULT 0,
  "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  CONSTRAINT "ProductionOrderOutput_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductionOperation" (
  "id" TEXT NOT NULL,
  "productionOrderId" TEXT NOT NULL,
  "workCenterId" TEXT,
  "employeeId" TEXT,
  "completedById" TEXT,
  "sequence" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" "ProductionOperationStatus" NOT NULL DEFAULT 'PENDING',
  "plannedMinutes" INTEGER NOT NULL DEFAULT 0,
  "actualMinutes" INTEGER NOT NULL DEFAULT 0,
  "plannedStartAt" TIMESTAMP(3),
  "plannedEndAt" TIMESTAMP(3),
  "actualStartAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "laborCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "overheadCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductionOperation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductionConsumption" (
  "id" TEXT NOT NULL,
  "productionOrderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "quantity" DECIMAL(14,4) NOT NULL,
  "unitCost" DECIMAL(14,4) NOT NULL DEFAULT 0,
  "consumedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reference" TEXT,
  "notes" TEXT,
  CONSTRAINT "ProductionConsumption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductionWaste" (
  "id" TEXT NOT NULL,
  "productionOrderId" TEXT NOT NULL,
  "productId" TEXT,
  "quantity" DECIMAL(14,4) NOT NULL,
  "reason" TEXT NOT NULL,
  "cost" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  CONSTRAINT "ProductionWaste_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductionCost" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "productionOrderId" TEXT NOT NULL,
  "type" "ProductionCostType" NOT NULL,
  "description" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reference" TEXT,
  CONSTRAINT "ProductionCost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProductionBatch" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "productionOrderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "lotNumber" TEXT NOT NULL,
  "quantity" DECIMAL(14,3) NOT NULL,
  "manufacturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  "qualityStatus" TEXT NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductionBatch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PosTerminal" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "warehouseId" TEXT,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PosTerminal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PosSession" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "terminalId" TEXT NOT NULL,
  "openedById" TEXT NOT NULL,
  "closedById" TEXT,
  "status" "PosSessionStatus" NOT NULL DEFAULT 'OPEN',
  "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closedAt" TIMESTAMP(3),
  "openingAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "expectedAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "countedAmount" DECIMAL(14,2),
  "difference" DECIMAL(14,2),
  "notes" TEXT,
  CONSTRAINT "PosSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PosSale" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "terminalId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "customerId" TEXT,
  "salesOrderId" TEXT,
  "createdById" TEXT NOT NULL,
  "folio" TEXT NOT NULL,
  "status" "PosSaleStatus" NOT NULL DEFAULT 'OPEN',
  "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "currency" TEXT NOT NULL DEFAULT 'MXN',
  "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "discountTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "taxTotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PosSale_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PosSaleItem" (
  "id" TEXT NOT NULL,
  "saleId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "lineNumber" INTEGER NOT NULL,
  "sku" TEXT,
  "description" TEXT NOT NULL,
  "quantity" DECIMAL(14,3) NOT NULL,
  "unitPrice" DECIMAL(14,4) NOT NULL,
  "discount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "taxRate" DECIMAL(7,4) NOT NULL DEFAULT 0,
  "taxAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "subtotal" DECIMAL(14,2) NOT NULL,
  "total" DECIMAL(14,2) NOT NULL,
  CONSTRAINT "PosSaleItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PosPayment" (
  "id" TEXT NOT NULL,
  "saleId" TEXT NOT NULL,
  "collectionReceiptId" TEXT,
  "method" "PosPaymentMethod" NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "reference" TEXT,
  "authorization" TEXT,
  "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  CONSTRAINT "PosPayment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PosCashMovement" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "type" "PosCashMovementType" NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "reference" TEXT,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PosCashMovement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PosDiscount" (
  "id" TEXT NOT NULL,
  "saleId" TEXT NOT NULL,
  "code" TEXT,
  "description" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "percent" DECIMAL(7,3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PosDiscount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Module" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT,
  "icon" TEXT,
  "route" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CompanyModule" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "moduleId" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "enabledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  "settings" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CompanyModule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ModuleFeature" (
  "id" TEXT NOT NULL,
  "moduleId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ModuleFeature_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CompanyModuleFeature" (
  "id" TEXT NOT NULL,
  "companyModuleId" TEXT NOT NULL,
  "featureId" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "settings" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CompanyModuleFeature_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SubscriptionPlan" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "monthlyPrice" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "annualPrice" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'MXN',
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SubscriptionPlanModule" (
  "id" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "moduleId" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT "SubscriptionPlanModule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SubscriptionPlanFeature" (
  "id" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "featureId" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT "SubscriptionPlanFeature_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SubscriptionPlanLimit" (
  "id" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "metricKey" TEXT NOT NULL,
  "metricType" "UsageMetricType" NOT NULL DEFAULT 'COUNT',
  "limitValue" DECIMAL(18,4) NOT NULL,
  "hardLimit" BOOLEAN NOT NULL DEFAULT FALSE,
  "description" TEXT,
  CONSTRAINT "SubscriptionPlanLimit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CompanySubscription" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "changedById" TEXT,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'TRIAL',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "trialEndsAt" TIMESTAMP(3),
  "currentPeriodStart" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "externalCustomerId" TEXT,
  "externalSubscriptionId" TEXT,
  "notes" TEXT,
  "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
  "scheduledPlanId" TEXT,
  "scheduledChangeAt" TIMESTAMP(3),
  "billingDay" INTEGER,
  "nextBillingAt" TIMESTAMP(3),
  "planChangeLockedUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CompanySubscription_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CompanyFeatureLimit" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "metricKey" TEXT NOT NULL,
  "metricType" "UsageMetricType" NOT NULL DEFAULT 'COUNT',
  "limitValue" DECIMAL(18,4) NOT NULL,
  "hardLimit" BOOLEAN NOT NULL DEFAULT FALSE,
  "source" TEXT NOT NULL DEFAULT 'OVERRIDE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CompanyFeatureLimit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UsageRecord" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "metricKey" TEXT NOT NULL,
  "metricType" "UsageMetricType" NOT NULL DEFAULT 'COUNT',
  "quantity" DECIMAL(18,4) NOT NULL DEFAULT 0,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "source" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UsageRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SubscriptionChange" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "subscriptionId" TEXT NOT NULL,
  "fromPlanId" TEXT NOT NULL,
  "toPlanId" TEXT NOT NULL,
  "requestedById" TEXT,
  "type" "SubscriptionChangeType" NOT NULL,
  "status" "SubscriptionChangeStatus" NOT NULL DEFAULT 'PENDING',
  "effectiveAt" TIMESTAMP(3) NOT NULL,
  "proratedAmount" DECIMAL(14,2),
  "creditAmount" DECIMAL(14,2),
  "chargeAmount" DECIMAL(14,2),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "appliedAt" TIMESTAMP(3),
  CONSTRAINT "SubscriptionChange_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BillingInvoice" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "subscriptionId" TEXT,
  "number" TEXT NOT NULL,
  "status" "BillingInvoiceStatus" NOT NULL DEFAULT 'DRAFT',
  "currency" TEXT NOT NULL DEFAULT 'MXN',
  "subtotal" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "tax" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "dueAt" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "periodStart" TIMESTAMP(3),
  "periodEnd" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BillingInvoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BillingInvoiceLine" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "quantity" DECIMAL(14,4) NOT NULL DEFAULT 1,
  "unitAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BillingInvoiceLine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BillingCredit" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "invoiceId" TEXT,
  "amount" DECIMAL(14,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'MXN',
  "reason" TEXT NOT NULL,
  "remaining" DECIMAL(14,2) NOT NULL,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BillingCredit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BillingPaymentMethod" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "externalId" TEXT,
  "brand" TEXT,
  "last4" TEXT,
  "expMonth" INTEGER,
  "expYear" INTEGER,
  "isDefault" BOOLEAN NOT NULL DEFAULT FALSE,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BillingPaymentMethod_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BillingPaymentAttempt" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "paymentMethodId" TEXT,
  "provider" TEXT NOT NULL,
  "externalPaymentId" TEXT,
  "status" "BillingPaymentStatus" NOT NULL DEFAULT 'PENDING',
  "amount" DECIMAL(14,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'MXN',
  "errorCode" TEXT,
  "errorMessage" TEXT,
  "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "metadata" JSONB,
  CONSTRAINT "BillingPaymentAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApprovalWorkflow" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "entityType" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "priority" INTEGER NOT NULL DEFAULT 100,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ApprovalWorkflow_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApprovalRule" (
  "id" TEXT NOT NULL,
  "workflowId" TEXT NOT NULL,
  "sequence" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "actorType" "ApprovalActorType" NOT NULL,
  "approverUserId" TEXT,
  "roleId" TEXT,
  "permissionKey" TEXT,
  "minAmount" DECIMAL(14,2),
  "maxAmount" DECIMAL(14,2),
  "condition" JSONB,
  "required" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ApprovalRule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApprovalRequest" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "workflowId" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "entityFolio" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "requestedById" TEXT NOT NULL,
  "status" "ApprovalRequestStatus" NOT NULL DEFAULT 'PENDING',
  "currentStep" INTEGER NOT NULL DEFAULT 1,
  "amount" DECIMAL(14,2),
  "currency" TEXT NOT NULL DEFAULT 'MXN',
  "metadata" JSONB,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "decidedAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ApprovalRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApprovalStep" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "ruleId" TEXT,
  "sequence" INTEGER NOT NULL,
  "name" TEXT NOT NULL,
  "approverUserId" TEXT,
  "roleId" TEXT,
  "permissionKey" TEXT,
  "status" "ApprovalStepStatus" NOT NULL DEFAULT 'WAITING',
  "decidedById" TEXT,
  "decidedAt" TIMESTAMP(3),
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ApprovalStep_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApprovalAction" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "stepId" TEXT,
  "actorId" TEXT NOT NULL,
  "action" "ApprovalStepStatus" NOT NULL,
  "comment" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApprovalAction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExpenseCategory" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ExpenseCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Expense" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "employeeId" TEXT,
  "createdById" TEXT NOT NULL,
  "folio" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "merchant" TEXT,
  "expenseDate" TIMESTAMP(3) NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'MXN',
  "taxAmount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "paymentMethod" "ExpensePaymentMethod" NOT NULL DEFAULT 'PERSONAL_CARD',
  "reimbursable" BOOLEAN NOT NULL DEFAULT TRUE,
  "status" "ExpenseStatus" NOT NULL DEFAULT 'DRAFT',
  "receiptUrl" TEXT,
  "receiptNumber" TEXT,
  "notes" TEXT,
  "submittedAt" TIMESTAMP(3),
  "approvedAt" TIMESTAMP(3),
  "rejectedAt" TIMESTAMP(3),
  "paidAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FixedAssetCategory" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "usefulLifeMonths" INTEGER NOT NULL,
  "residualValuePercent" DECIMAL(5,2) NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FixedAssetCategory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FixedAsset" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "serialNumber" TEXT,
  "brand" TEXT,
  "model" TEXT,
  "location" TEXT,
  "custodian" TEXT,
  "acquisitionDate" TIMESTAMP(3) NOT NULL,
  "acquisitionCost" DECIMAL(14,2) NOT NULL,
  "residualValue" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "usefulLifeMonths" INTEGER NOT NULL,
  "depreciationMethod" "DepreciationMethod" NOT NULL DEFAULT 'STRAIGHT_LINE',
  "depreciationStartDate" TIMESTAMP(3) NOT NULL,
  "accumulatedDepreciation" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "status" "FixedAssetStatus" NOT NULL DEFAULT 'ACTIVE',
  "supplierName" TEXT,
  "invoiceReference" TEXT,
  "notes" TEXT,
  "disposedAt" TIMESTAMP(3),
  "disposalReason" TEXT,
  "disposalAmount" DECIMAL(14,2),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FixedAsset_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MasterDataContact" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "entityType" "MasterDataEntityType" NOT NULL,
  "entityId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "jobTitle" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "mobile" TEXT,
  "primary" BOOLEAN NOT NULL DEFAULT FALSE,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MasterDataContact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MasterDataAddress" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "entityType" "MasterDataEntityType" NOT NULL,
  "entityId" TEXT NOT NULL,
  "label" TEXT NOT NULL DEFAULT 'Principal',
  "street" TEXT,
  "exterior" TEXT,
  "interior" TEXT,
  "neighborhood" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postalCode" TEXT,
  "country" TEXT NOT NULL DEFAULT 'MX',
  "primary" BOOLEAN NOT NULL DEFAULT FALSE,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MasterDataAddress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MasterDataCatalog" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MasterDataCatalog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MasterDataCatalogValue" (
  "id" TEXT NOT NULL,
  "catalogId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "metadata" JSONB,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MasterDataCatalogValue_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DataQualityIssue" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "entityType" "MasterDataEntityType" NOT NULL,
  "entityId" TEXT,
  "issueType" "DataQualityIssueType" NOT NULL,
  "field" TEXT,
  "message" TEXT NOT NULL,
  "fingerprint" TEXT,
  "status" "DataQualityIssueStatus" NOT NULL DEFAULT 'OPEN',
  "metadata" JSONB,
  "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DataQualityIssue_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DataImportJob" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "entityType" "DataImportEntityType" NOT NULL,
  "mode" "DataImportMode" NOT NULL DEFAULT 'CREATE_ONLY',
  "fileName" TEXT NOT NULL,
  "fileType" TEXT NOT NULL,
  "status" "DataImportStatus" NOT NULL DEFAULT 'PREVIEW',
  "totalRows" INTEGER NOT NULL DEFAULT 0,
  "validRows" INTEGER NOT NULL DEFAULT 0,
  "invalidRows" INTEGER NOT NULL DEFAULT 0,
  "importedRows" INTEGER NOT NULL DEFAULT 0,
  "skippedRows" INTEGER NOT NULL DEFAULT 0,
  "errorRows" INTEGER NOT NULL DEFAULT 0,
  "mapping" JSONB NOT NULL,
  "headers" JSONB NOT NULL,
  "summary" JSONB,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "rollbackAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DataImportJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DataImportRow" (
  "id" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "rowNumber" INTEGER NOT NULL,
  "status" "DataImportRowStatus" NOT NULL,
  "action" "DataImportAction",
  "rawData" JSONB NOT NULL,
  "normalizedData" JSONB,
  "beforeData" JSONB,
  "errors" JSONB,
  "warnings" JSONB,
  "targetId" TEXT,
  "rollbackError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DataImportRow_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IntegrationConnection" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'GENERIC',
  "description" TEXT,
  "status" "IntegrationConnectionStatus" NOT NULL DEFAULT 'ACTIVE',
  "baseUrl" TEXT,
  "settings" JSONB,
  "lastSyncAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "IntegrationConnection_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApiCredential" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "prefix" TEXT NOT NULL,
  "secretHash" TEXT NOT NULL,
  "last4" TEXT NOT NULL,
  "scopes" JSONB NOT NULL,
  "status" "ApiCredentialStatus" NOT NULL DEFAULT 'ACTIVE',
  "lastUsedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ApiCredential_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WebhookEndpoint" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "events" JSONB NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "signingSecretEnc" TEXT NOT NULL,
  "timeoutMs" INTEGER NOT NULL DEFAULT 8000,
  "failureCount" INTEGER NOT NULL DEFAULT 0,
  "lastDeliveryAt" TIMESTAMP(3),
  "lastSuccessAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WebhookEndpoint_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WebhookDeliveryLog" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "webhookId" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "status" "WebhookDeliveryStatus" NOT NULL DEFAULT 'PENDING',
  "statusCode" INTEGER,
  "durationMs" INTEGER,
  "attempt" INTEGER NOT NULL DEFAULT 1,
  "payload" JSONB NOT NULL,
  "responseBody" TEXT,
  "error" TEXT,
  "deliveredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WebhookDeliveryLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ApiAccessLog" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "credentialId" TEXT,
  "method" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "scope" TEXT,
  "statusCode" INTEGER NOT NULL,
  "durationMs" INTEGER,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ApiAccessLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IntegrationEventLog" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "entityType" TEXT,
  "entityId" TEXT,
  "payload" JSONB NOT NULL,
  "status" "IntegrationEventStatus" NOT NULL DEFAULT 'PENDING',
  "endpoints" INTEGER NOT NULL DEFAULT 0,
  "delivered" INTEGER NOT NULL DEFAULT 0,
  "failed" INTEGER NOT NULL DEFAULT 0,
  "dedupKey" TEXT,
  "correlationId" TEXT,
  "sourceRequestId" TEXT,
  "replayOfId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dispatchedAt" TIMESTAMP(3),
  CONSTRAINT "IntegrationEventLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WebhookDeliveryJob" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "webhookId" TEXT NOT NULL,
  "eventLogId" TEXT,
  "event" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "requestId" TEXT NOT NULL,
  "status" "WebhookQueueStatus" NOT NULL DEFAULT 'READY',
  "attempt" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 4,
  "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lockedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WebhookDeliveryJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AutomationFlow" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdById" TEXT NOT NULL,
  "runAsUserId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "triggerEvent" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "conditions" JSONB NOT NULL,
  "actions" JSONB NOT NULL,
  "stopOnError" BOOLEAN NOT NULL DEFAULT TRUE,
  "runCount" INTEGER NOT NULL DEFAULT 0,
  "lastRunAt" TIMESTAMP(3),
  "lastError" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AutomationFlow_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AutomationFlowRun" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "flowId" TEXT NOT NULL,
  "eventLogId" TEXT,
  "event" TEXT NOT NULL,
  "entityType" TEXT,
  "entityId" TEXT,
  "status" "FlowRunStatus" NOT NULL DEFAULT 'RUNNING',
  "input" JSONB NOT NULL,
  "context" JSONB,
  "error" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AutomationFlowRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AutomationFlowActionRun" (
  "id" TEXT NOT NULL,
  "runId" TEXT NOT NULL,
  "actionKey" TEXT NOT NULL,
  "actionType" TEXT NOT NULL,
  "sequence" INTEGER NOT NULL,
  "status" "FlowActionStatus" NOT NULL DEFAULT 'PENDING',
  "input" JSONB,
  "output" JSONB,
  "error" TEXT,
  "startedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AutomationFlowActionRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IntelligenceMetricDefinition" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL,
  "unit" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "IntelligenceMetricDefinition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IntelligenceInsight" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "fingerprint" TEXT NOT NULL,
  "type" "IntelligenceInsightType" NOT NULL,
  "severity" "IntelligenceInsightSeverity" NOT NULL,
  "status" "IntelligenceInsightStatus" NOT NULL DEFAULT 'OPEN',
  "category" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "entityType" TEXT,
  "entityId" TEXT,
  "metricKey" TEXT,
  "currentValue" DECIMAL(18,4),
  "baselineValue" DECIMAL(18,4),
  "deltaPct" DECIMAL(12,4),
  "recommendation" TEXT,
  "actionLink" TEXT,
  "metadata" JSONB,
  "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "acknowledgedAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "dismissedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "IntelligenceInsight_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IntelligenceMetricSnapshot" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "metricKey" TEXT NOT NULL,
  "value" DECIMAL(18,4) NOT NULL,
  "capturedDay" TIMESTAMP(3) NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "IntelligenceMetricSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BusinessParty" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "type" "BusinessPartyType" NOT NULL DEFAULT 'ORGANIZATION',
  "displayName" TEXT NOT NULL,
  "legalName" TEXT,
  "commercialName" TEXT,
  "taxId" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "website" TEXT,
  "notes" TEXT,
  "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "customerId" TEXT,
  "supplierId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BusinessParty_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BusinessPartyRole" (
  "id" TEXT NOT NULL,
  "partyId" TEXT NOT NULL,
  "role" "BusinessPartyRoleType" NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BusinessPartyRole_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BusinessPartyContact" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "partyId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "jobTitle" TEXT,
  "department" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "mobile" TEXT,
  "primary" BOOLEAN NOT NULL DEFAULT FALSE,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BusinessPartyContact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BusinessPartyAddress" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "partyId" TEXT NOT NULL,
  "type" "BusinessPartyAddressType" NOT NULL DEFAULT 'OTHER',
  "label" TEXT NOT NULL DEFAULT 'Principal',
  "street" TEXT,
  "exterior" TEXT,
  "interior" TEXT,
  "neighborhood" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postalCode" TEXT,
  "country" TEXT NOT NULL DEFAULT 'MX',
  "primary" BOOLEAN NOT NULL DEFAULT FALSE,
  "active" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BusinessPartyAddress_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BusinessPartyMergeHistory" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "targetPartyId" TEXT NOT NULL,
  "sourcePartyId" TEXT NOT NULL,
  "mergedByUserId" TEXT,
  "reason" TEXT,
  "snapshot" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BusinessPartyMergeHistory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlatformSetting" (
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "updatedById" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("key")
);

CREATE TABLE "PlatformSupportTicket" (
  "id" TEXT NOT NULL,
  "companyId" TEXT,
  "subject" TEXT NOT NULL,
  "description" TEXT,
  "priority" TEXT NOT NULL DEFAULT 'NORMAL',
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "assignedToId" TEXT,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlatformSupportTicket_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Company_taxId_key" ON "Company"("taxId");
CREATE UNIQUE INDEX "IdempotencyRecord_companyId_scope_key_key" ON "IdempotencyRecord"("companyId", "scope", "key");
CREATE INDEX "IdempotencyRecord_companyId_createdAt_idx" ON "IdempotencyRecord"("companyId", "createdAt");
CREATE INDEX "IdempotencyRecord_status_createdAt_idx" ON "IdempotencyRecord"("status", "createdAt");
CREATE INDEX "IdempotencyRecord_expiresAt_idx" ON "IdempotencyRecord"("expiresAt");
CREATE UNIQUE INDEX "SequenceCounter_companyId_scope_period_key" ON "SequenceCounter"("companyId", "scope", "period");
CREATE INDEX "SequenceCounter_companyId_scope_idx" ON "SequenceCounter"("companyId", "scope");
CREATE UNIQUE INDEX "Branch_companyId_code_key" ON "Branch"("companyId", "code");
CREATE INDEX "Branch_companyId_idx" ON "Branch"("companyId");
CREATE UNIQUE INDEX "Warehouse_branchId_code_key" ON "Warehouse"("branchId", "code");
CREATE INDEX "Warehouse_branchId_idx" ON "Warehouse"("branchId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_companyId_idx" ON "User"("companyId");
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");
CREATE UNIQUE INDEX "Supplier_companyId_code_key" ON "Supplier"("companyId", "code");
CREATE INDEX "Supplier_companyId_idx" ON "Supplier"("companyId");
CREATE UNIQUE INDEX "ProductCategory_companyId_code_key" ON "ProductCategory"("companyId", "code");
CREATE INDEX "ProductCategory_companyId_idx" ON "ProductCategory"("companyId");
CREATE UNIQUE INDEX "Product_companyId_sku_key" ON "Product"("companyId", "sku");
CREATE INDEX "Product_companyId_idx" ON "Product"("companyId");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE UNIQUE INDEX "PurchaseRequest_companyId_folio_key" ON "PurchaseRequest"("companyId", "folio");
CREATE INDEX "PurchaseRequest_companyId_status_idx" ON "PurchaseRequest"("companyId", "status");
CREATE INDEX "PurchaseRequest_requestedById_idx" ON "PurchaseRequest"("requestedById");
CREATE INDEX "PurchaseRequest_warehouseId_idx" ON "PurchaseRequest"("warehouseId");
CREATE UNIQUE INDEX "PurchaseRequestItem_purchaseRequestId_productId_key" ON "PurchaseRequestItem"("purchaseRequestId", "productId");
CREATE INDEX "PurchaseRequestItem_productId_idx" ON "PurchaseRequestItem"("productId");
CREATE UNIQUE INDEX "PurchaseOrder_purchaseRequestId_key" ON "PurchaseOrder"("purchaseRequestId");
CREATE UNIQUE INDEX "PurchaseOrder_companyId_folio_key" ON "PurchaseOrder"("companyId", "folio");
CREATE INDEX "PurchaseOrder_companyId_status_idx" ON "PurchaseOrder"("companyId", "status");
CREATE INDEX "PurchaseOrder_supplierId_idx" ON "PurchaseOrder"("supplierId");
CREATE INDEX "PurchaseOrder_warehouseId_idx" ON "PurchaseOrder"("warehouseId");
CREATE UNIQUE INDEX "PurchaseOrderItem_purchaseOrderId_productId_key" ON "PurchaseOrderItem"("purchaseOrderId", "productId");
CREATE INDEX "PurchaseOrderItem_productId_idx" ON "PurchaseOrderItem"("productId");
CREATE UNIQUE INDEX "GoodsReceipt_companyId_folio_key" ON "GoodsReceipt"("companyId", "folio");
CREATE INDEX "GoodsReceipt_companyId_receivedAt_idx" ON "GoodsReceipt"("companyId", "receivedAt");
CREATE INDEX "GoodsReceipt_purchaseOrderId_idx" ON "GoodsReceipt"("purchaseOrderId");
CREATE INDEX "GoodsReceipt_warehouseId_idx" ON "GoodsReceipt"("warehouseId");
CREATE INDEX "GoodsReceiptItem_goodsReceiptId_idx" ON "GoodsReceiptItem"("goodsReceiptId");
CREATE INDEX "GoodsReceiptItem_purchaseOrderItemId_idx" ON "GoodsReceiptItem"("purchaseOrderItemId");
CREATE INDEX "GoodsReceiptItem_productId_idx" ON "GoodsReceiptItem"("productId");
CREATE UNIQUE INDEX "InventoryBalance_warehouseId_productId_key" ON "InventoryBalance"("warehouseId", "productId");
CREATE INDEX "InventoryBalance_productId_idx" ON "InventoryBalance"("productId");
CREATE INDEX "InventoryMovement_companyId_occurredAt_idx" ON "InventoryMovement"("companyId", "occurredAt");
CREATE INDEX "InventoryMovement_warehouseId_productId_occurredAt_idx" ON "InventoryMovement"("warehouseId", "productId", "occurredAt");
CREATE INDEX "InventoryMovement_goodsReceiptId_idx" ON "InventoryMovement"("goodsReceiptId");
CREATE UNIQUE INDEX "InventoryAdjustment_companyId_folio_key" ON "InventoryAdjustment"("companyId", "folio");
CREATE INDEX "InventoryAdjustment_companyId_occurredAt_idx" ON "InventoryAdjustment"("companyId", "occurredAt");
CREATE INDEX "InventoryAdjustment_warehouseId_idx" ON "InventoryAdjustment"("warehouseId");
CREATE INDEX "InventoryAdjustmentItem_adjustmentId_idx" ON "InventoryAdjustmentItem"("adjustmentId");
CREATE INDEX "InventoryAdjustmentItem_productId_idx" ON "InventoryAdjustmentItem"("productId");
CREATE UNIQUE INDEX "InventoryTransfer_companyId_folio_key" ON "InventoryTransfer"("companyId", "folio");
CREATE INDEX "InventoryTransfer_companyId_occurredAt_idx" ON "InventoryTransfer"("companyId", "occurredAt");
CREATE INDEX "InventoryTransfer_fromWarehouseId_idx" ON "InventoryTransfer"("fromWarehouseId");
CREATE INDEX "InventoryTransfer_toWarehouseId_idx" ON "InventoryTransfer"("toWarehouseId");
CREATE INDEX "InventoryTransferItem_transferId_idx" ON "InventoryTransferItem"("transferId");
CREATE INDEX "InventoryTransferItem_productId_idx" ON "InventoryTransferItem"("productId");
CREATE UNIQUE INDEX "AccountsPayable_companyId_supplierId_invoiceNumber_key" ON "AccountsPayable"("companyId", "supplierId", "invoiceNumber");
CREATE INDEX "AccountsPayable_companyId_status_dueDate_idx" ON "AccountsPayable"("companyId", "status", "dueDate");
CREATE INDEX "AccountsPayable_supplierId_idx" ON "AccountsPayable"("supplierId");
CREATE INDEX "AccountsPayable_purchaseOrderId_idx" ON "AccountsPayable"("purchaseOrderId");
CREATE UNIQUE INDEX "SupplierPayment_companyId_folio_key" ON "SupplierPayment"("companyId", "folio");
CREATE INDEX "SupplierPayment_accountsPayableId_paymentDate_idx" ON "SupplierPayment"("accountsPayableId", "paymentDate");
CREATE UNIQUE INDEX "Customer_companyId_code_key" ON "Customer"("companyId", "code");
CREATE INDEX "Customer_companyId_active_idx" ON "Customer"("companyId", "active");
CREATE UNIQUE INDEX "AccountsReceivable_companyId_customerId_invoiceNumber_key" ON "AccountsReceivable"("companyId", "customerId", "invoiceNumber");
CREATE INDEX "AccountsReceivable_companyId_status_dueDate_idx" ON "AccountsReceivable"("companyId", "status", "dueDate");
CREATE INDEX "AccountsReceivable_customerId_idx" ON "AccountsReceivable"("customerId");
CREATE UNIQUE INDEX "CustomerPayment_companyId_folio_key" ON "CustomerPayment"("companyId", "folio");
CREATE INDEX "CustomerPayment_accountsReceivableId_paymentDate_idx" ON "CustomerPayment"("accountsReceivableId", "paymentDate");
CREATE UNIQUE INDEX "Department_companyId_code_key" ON "Department"("companyId", "code");
CREATE INDEX "Department_companyId_active_idx" ON "Department"("companyId", "active");
CREATE UNIQUE INDEX "Position_companyId_code_key" ON "Position"("companyId", "code");
CREATE INDEX "Position_companyId_active_idx" ON "Position"("companyId", "active");
CREATE INDEX "Position_departmentId_idx" ON "Position"("departmentId");
CREATE UNIQUE INDEX "Employee_companyId_employeeNumber_key" ON "Employee"("companyId", "employeeNumber");
CREATE INDEX "Employee_companyId_status_idx" ON "Employee"("companyId", "status");
CREATE INDEX "Employee_departmentId_idx" ON "Employee"("departmentId");
CREATE INDEX "Employee_positionId_idx" ON "Employee"("positionId");
CREATE INDEX "Employee_branchId_idx" ON "Employee"("branchId");
CREATE UNIQUE INDEX "AttendanceRecord_employeeId_date_key" ON "AttendanceRecord"("employeeId", "date");
CREATE INDEX "AttendanceRecord_companyId_date_idx" ON "AttendanceRecord"("companyId", "date");
CREATE INDEX "LeaveRequest_companyId_status_idx" ON "LeaveRequest"("companyId", "status");
CREATE INDEX "LeaveRequest_employeeId_startDate_idx" ON "LeaveRequest"("employeeId", "startDate");
CREATE INDEX "HrIncident_companyId_date_idx" ON "HrIncident"("companyId", "date");
CREATE INDEX "HrIncident_employeeId_type_idx" ON "HrIncident"("employeeId", "type");
CREATE INDEX "EmployeeDocument_companyId_status_idx" ON "EmployeeDocument"("companyId", "status");
CREATE INDEX "EmployeeDocument_employeeId_type_idx" ON "EmployeeDocument"("employeeId", "type");
CREATE INDEX "EmployeeDocument_expiresAt_idx" ON "EmployeeDocument"("expiresAt");
CREATE UNIQUE INDEX "PayrollPeriod_companyId_folio_key" ON "PayrollPeriod"("companyId", "folio");
CREATE INDEX "PayrollPeriod_companyId_status_idx" ON "PayrollPeriod"("companyId", "status");
CREATE INDEX "PayrollPeriod_startDate_endDate_idx" ON "PayrollPeriod"("startDate", "endDate");
CREATE UNIQUE INDEX "PayrollItem_payrollPeriodId_employeeId_key" ON "PayrollItem"("payrollPeriodId", "employeeId");
CREATE INDEX "PayrollItem_companyId_employeeId_idx" ON "PayrollItem"("companyId", "employeeId");
CREATE INDEX "AgendaEvent_companyId_startAt_idx" ON "AgendaEvent"("companyId", "startAt");
CREATE INDEX "AgendaEvent_companyId_status_startAt_idx" ON "AgendaEvent"("companyId", "status", "startAt");
CREATE INDEX "AgendaEvent_assigneeEmployeeId_startAt_idx" ON "AgendaEvent"("assigneeEmployeeId", "startAt");
CREATE INDEX "Notification_companyId_createdAt_idx" ON "Notification"("companyId", "createdAt");
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");
CREATE UNIQUE INDEX "TreasuryAccount_companyId_code_key" ON "TreasuryAccount"("companyId", "code");
CREATE INDEX "TreasuryAccount_companyId_active_idx" ON "TreasuryAccount"("companyId", "active");
CREATE UNIQUE INDEX "TreasuryMovement_companyId_folio_key" ON "TreasuryMovement"("companyId", "folio");
CREATE INDEX "TreasuryMovement_companyId_movementDate_idx" ON "TreasuryMovement"("companyId", "movementDate");
CREATE INDEX "TreasuryMovement_accountId_movementDate_idx" ON "TreasuryMovement"("accountId", "movementDate");
CREATE INDEX "TreasuryMovement_transferGroup_idx" ON "TreasuryMovement"("transferGroup");
CREATE UNIQUE INDEX "CostCenter_companyId_code_key" ON "CostCenter"("companyId", "code");
CREATE INDEX "CostCenter_companyId_active_idx" ON "CostCenter"("companyId", "active");
CREATE UNIQUE INDEX "Budget_companyId_year_name_key" ON "Budget"("companyId", "year", "name");
CREATE INDEX "Budget_companyId_year_status_idx" ON "Budget"("companyId", "year", "status");
CREATE UNIQUE INDEX "BudgetLine_budgetId_costCenterId_category_month_key" ON "BudgetLine"("budgetId", "costCenterId", "category", "month");
CREATE INDEX "BudgetLine_companyId_month_idx" ON "BudgetLine"("companyId", "month");
CREATE UNIQUE INDEX "SalesQuote_companyId_folio_key" ON "SalesQuote"("companyId", "folio");
CREATE INDEX "SalesQuote_companyId_status_idx" ON "SalesQuote"("companyId", "status");
CREATE INDEX "SalesQuote_customerId_quoteDate_idx" ON "SalesQuote"("customerId", "quoteDate");
CREATE INDEX "SalesQuoteItem_salesQuoteId_idx" ON "SalesQuoteItem"("salesQuoteId");
CREATE INDEX "SalesQuoteItem_productId_idx" ON "SalesQuoteItem"("productId");
CREATE UNIQUE INDEX "SalesOrder_salesQuoteId_key" ON "SalesOrder"("salesQuoteId");
CREATE UNIQUE INDEX "SalesOrder_companyId_folio_key" ON "SalesOrder"("companyId", "folio");
CREATE INDEX "SalesOrder_companyId_status_idx" ON "SalesOrder"("companyId", "status");
CREATE INDEX "SalesOrder_customerId_orderDate_idx" ON "SalesOrder"("customerId", "orderDate");
CREATE INDEX "SalesOrderItem_salesOrderId_idx" ON "SalesOrderItem"("salesOrderId");
CREATE INDEX "SalesOrderItem_productId_idx" ON "SalesOrderItem"("productId");
CREATE INDEX "Prospect_companyId_stage_idx" ON "Prospect"("companyId", "stage");
CREATE INDEX "Prospect_ownerId_nextActionAt_idx" ON "Prospect"("ownerId", "nextActionAt");
CREATE INDEX "SalesActivity_companyId_createdAt_idx" ON "SalesActivity"("companyId", "createdAt");
CREATE INDEX "SalesActivity_prospectId_idx" ON "SalesActivity"("prospectId");
CREATE INDEX "SalesActivity_customerId_idx" ON "SalesActivity"("customerId");
CREATE UNIQUE INDEX "SalesDelivery_companyId_folio_key" ON "SalesDelivery"("companyId", "folio");
CREATE INDEX "SalesDelivery_companyId_status_idx" ON "SalesDelivery"("companyId", "status");
CREATE INDEX "SalesDelivery_salesOrderId_idx" ON "SalesDelivery"("salesOrderId");
CREATE INDEX "SalesDeliveryItem_salesDeliveryId_idx" ON "SalesDeliveryItem"("salesDeliveryId");
CREATE INDEX "SalesDeliveryItem_productId_idx" ON "SalesDeliveryItem"("productId");
CREATE UNIQUE INDEX "SalesInvoice_salesOrderId_key" ON "SalesInvoice"("salesOrderId");
CREATE UNIQUE INDEX "SalesInvoice_companyId_invoiceNumber_key" ON "SalesInvoice"("companyId", "invoiceNumber");
CREATE INDEX "SalesInvoice_companyId_status_idx" ON "SalesInvoice"("companyId", "status");
CREATE INDEX "SalesInvoice_customerId_dueDate_idx" ON "SalesInvoice"("customerId", "dueDate");
CREATE UNIQUE INDEX "SalesReturn_companyId_folio_key" ON "SalesReturn"("companyId", "folio");
CREATE INDEX "SalesReturn_companyId_status_idx" ON "SalesReturn"("companyId", "status");
CREATE INDEX "SalesReturn_salesDeliveryId_idx" ON "SalesReturn"("salesDeliveryId");
CREATE INDEX "SalesReturnItem_salesReturnId_idx" ON "SalesReturnItem"("salesReturnId");
CREATE INDEX "SalesReturnItem_productId_idx" ON "SalesReturnItem"("productId");
CREATE UNIQUE INDEX "SalesCreditNote_salesReturnId_key" ON "SalesCreditNote"("salesReturnId");
CREATE UNIQUE INDEX "SalesCreditNote_companyId_folio_key" ON "SalesCreditNote"("companyId", "folio");
CREATE INDEX "SalesCreditNote_companyId_status_idx" ON "SalesCreditNote"("companyId", "status");
CREATE INDEX "SalesCreditNote_salesInvoiceId_idx" ON "SalesCreditNote"("salesInvoiceId");
CREATE UNIQUE INDEX "CollectionReceipt_companyId_folio_key" ON "CollectionReceipt"("companyId", "folio");
CREATE INDEX "CollectionReceipt_companyId_status_idx" ON "CollectionReceipt"("companyId", "status");
CREATE INDEX "CollectionReceipt_customerId_paymentDate_idx" ON "CollectionReceipt"("customerId", "paymentDate");
CREATE UNIQUE INDEX "CollectionApplication_receipt_ar_key" ON "CollectionApplication"("collectionReceiptId", "accountsReceivableId");
CREATE INDEX "CollectionApplication_companyId_createdAt_idx" ON "CollectionApplication"("companyId", "createdAt");
CREATE UNIQUE INDEX "BankStatement_companyId_folio_key" ON "BankStatement"("companyId", "folio");
CREATE INDEX "BankStatement_companyId_status_idx" ON "BankStatement"("companyId", "status");
CREATE INDEX "BankStatement_treasuryAccountId_statementDate_idx" ON "BankStatement"("treasuryAccountId", "statementDate");
CREATE INDEX "BankStatementLine_companyId_status_idx" ON "BankStatementLine"("companyId", "status");
CREATE INDEX "BankStatementLine_bankStatementId_transactionDate_idx" ON "BankStatementLine"("bankStatementId", "transactionDate");
CREATE INDEX "BankStatementLine_treasuryMovementId_idx" ON "BankStatementLine"("treasuryMovementId");
CREATE UNIQUE INDEX "CashFlowScenario_companyId_name_key" ON "CashFlowScenario"("companyId", "name");
CREATE INDEX "CashFlowScenario_companyId_status_idx" ON "CashFlowScenario"("companyId", "status");
CREATE INDEX "CashFlowScenario_companyId_startDate_endDate_idx" ON "CashFlowScenario"("companyId", "startDate", "endDate");
CREATE INDEX "CashFlowAdjustment_companyId_date_idx" ON "CashFlowAdjustment"("companyId", "date");
CREATE INDEX "CashFlowAdjustment_scenarioId_date_idx" ON "CashFlowAdjustment"("scenarioId", "date");
CREATE UNIQUE INDEX "AccountingAccount_companyId_code_key" ON "AccountingAccount"("companyId", "code");
CREATE INDEX "AccountingAccount_companyId_type_active_idx" ON "AccountingAccount"("companyId", "type", "active");
CREATE INDEX "AccountingAccount_parentId_idx" ON "AccountingAccount"("parentId");
CREATE UNIQUE INDEX "AccountingPeriod_companyId_name_key" ON "AccountingPeriod"("companyId", "name");
CREATE INDEX "AccountingPeriod_companyId_status_idx" ON "AccountingPeriod"("companyId", "status");
CREATE INDEX "AccountingPeriod_companyId_startDate_endDate_idx" ON "AccountingPeriod"("companyId", "startDate", "endDate");
CREATE UNIQUE INDEX "JournalEntry_companyId_folio_key" ON "JournalEntry"("companyId", "folio");
CREATE UNIQUE INDEX "JournalEntry_companyId_sourceType_sourceId_key" ON "JournalEntry"("companyId", "sourceType", "sourceId");
CREATE INDEX "JournalEntry_companyId_status_entryDate_idx" ON "JournalEntry"("companyId", "status", "entryDate");
CREATE INDEX "JournalEntry_periodId_idx" ON "JournalEntry"("periodId");
CREATE INDEX "JournalLine_entryId_idx" ON "JournalLine"("entryId");
CREATE INDEX "JournalLine_accountId_idx" ON "JournalLine"("accountId");
CREATE UNIQUE INDEX "Project_companyId_code_key" ON "Project"("companyId", "code");
CREATE INDEX "Project_companyId_status_idx" ON "Project"("companyId", "status");
CREATE INDEX "Project_customerId_idx" ON "Project"("customerId");
CREATE INDEX "Project_managerId_idx" ON "Project"("managerId");
CREATE INDEX "Project_parentProjectId_idx" ON "Project"("parentProjectId");
CREATE UNIQUE INDEX "ProjectMember_projectId_employeeId_key" ON "ProjectMember"("projectId", "employeeId");
CREATE INDEX "ProjectMember_employeeId_idx" ON "ProjectMember"("employeeId");
CREATE INDEX "ProjectTask_projectId_status_idx" ON "ProjectTask"("projectId", "status");
CREATE INDEX "ProjectTask_assigneeId_idx" ON "ProjectTask"("assigneeId");
CREATE INDEX "ProjectTask_parentTaskId_idx" ON "ProjectTask"("parentTaskId");
CREATE INDEX "ProjectTask_dueDate_idx" ON "ProjectTask"("dueDate");
CREATE INDEX "ProjectTimeEntry_projectId_date_idx" ON "ProjectTimeEntry"("projectId", "date");
CREATE INDEX "ProjectTimeEntry_employeeId_date_idx" ON "ProjectTimeEntry"("employeeId", "date");
CREATE INDEX "ProjectTimeEntry_taskId_idx" ON "ProjectTimeEntry"("taskId");
CREATE INDEX "ProjectComment_projectId_createdAt_idx" ON "ProjectComment"("projectId", "createdAt");
CREATE INDEX "ProjectComment_taskId_idx" ON "ProjectComment"("taskId");
CREATE INDEX "ProjectDocument_projectId_createdAt_idx" ON "ProjectDocument"("projectId", "createdAt");
CREATE UNIQUE INDEX "ProjectSalesOrder_projectId_salesOrderId_key" ON "ProjectSalesOrder"("projectId", "salesOrderId");
CREATE INDEX "ProjectSalesOrder_salesOrderId_idx" ON "ProjectSalesOrder"("salesOrderId");
CREATE UNIQUE INDEX "ProjectPurchaseOrder_projectId_purchaseOrderId_key" ON "ProjectPurchaseOrder"("projectId", "purchaseOrderId");
CREATE INDEX "ProjectPurchaseOrder_purchaseOrderId_idx" ON "ProjectPurchaseOrder"("purchaseOrderId");
CREATE UNIQUE INDEX "MarketingChannel_companyId_name_key" ON "MarketingChannel"("companyId", "name");
CREATE INDEX "MarketingChannel_companyId_type_idx" ON "MarketingChannel"("companyId", "type");
CREATE UNIQUE INDEX "MarketingCampaign_companyId_code_key" ON "MarketingCampaign"("companyId", "code");
CREATE INDEX "MarketingCampaign_companyId_status_idx" ON "MarketingCampaign"("companyId", "status");
CREATE INDEX "MarketingCampaign_channelId_idx" ON "MarketingCampaign"("channelId");
CREATE INDEX "MarketingCampaign_startDate_endDate_idx" ON "MarketingCampaign"("startDate", "endDate");
CREATE UNIQUE INDEX "MarketingCampaignLead_campaignId_prospectId_key" ON "MarketingCampaignLead"("campaignId", "prospectId");
CREATE INDEX "MarketingCampaignLead_prospectId_idx" ON "MarketingCampaignLead"("prospectId");
CREATE INDEX "MarketingCampaignLead_campaignId_capturedAt_idx" ON "MarketingCampaignLead"("campaignId", "capturedAt");
CREATE UNIQUE INDEX "MarketingCampaignOpportunity_campaignId_prospectId_key" ON "MarketingCampaignOpportunity"("campaignId", "prospectId");
CREATE INDEX "MarketingCampaignOpportunity_prospectId_idx" ON "MarketingCampaignOpportunity"("prospectId");
CREATE INDEX "MarketingCampaignOpportunity_customerId_idx" ON "MarketingCampaignOpportunity"("customerId");
CREATE INDEX "MarketingCampaignOpportunity_salesOrderId_idx" ON "MarketingCampaignOpportunity"("salesOrderId");
CREATE INDEX "MarketingCampaignExpense_companyId_date_idx" ON "MarketingCampaignExpense"("companyId", "date");
CREATE INDEX "MarketingCampaignExpense_campaignId_date_idx" ON "MarketingCampaignExpense"("campaignId", "date");
CREATE INDEX "MarketingCalendarEvent_companyId_startAt_idx" ON "MarketingCalendarEvent"("companyId", "startAt");
CREATE INDEX "MarketingCalendarEvent_campaignId_idx" ON "MarketingCalendarEvent"("campaignId");
CREATE UNIQUE INDEX "MarketingMetric_campaignId_date_key" ON "MarketingMetric"("campaignId", "date");
CREATE INDEX "MarketingMetric_companyId_date_idx" ON "MarketingMetric"("companyId", "date");
CREATE UNIQUE INDEX "FiscalIssuerProfile_companyId_key" ON "FiscalIssuerProfile"("companyId");
CREATE INDEX "FiscalIssuerProfile_rfc_idx" ON "FiscalIssuerProfile"("rfc");
CREATE UNIQUE INDEX "FiscalCustomerProfile_customerId_key" ON "FiscalCustomerProfile"("customerId");
CREATE INDEX "FiscalCustomerProfile_rfc_idx" ON "FiscalCustomerProfile"("rfc");
CREATE UNIQUE INDEX "FiscalInvoice_salesInvoiceId_key" ON "FiscalInvoice"("salesInvoiceId");
CREATE UNIQUE INDEX "FiscalInvoice_uuid_key" ON "FiscalInvoice"("uuid");
CREATE UNIQUE INDEX "FiscalInvoice_companyId_folio_key" ON "FiscalInvoice"("companyId", "folio");
CREATE INDEX "FiscalInvoice_companyId_status_issueDate_idx" ON "FiscalInvoice"("companyId", "status", "issueDate");
CREATE INDEX "FiscalInvoice_customerId_issueDate_idx" ON "FiscalInvoice"("customerId", "issueDate");
CREATE INDEX "FiscalInvoice_salesOrderId_idx" ON "FiscalInvoice"("salesOrderId");
CREATE UNIQUE INDEX "FiscalInvoiceItem_fiscalInvoiceId_lineNumber_key" ON "FiscalInvoiceItem"("fiscalInvoiceId", "lineNumber");
CREATE INDEX "FiscalInvoiceItem_fiscalInvoiceId_idx" ON "FiscalInvoiceItem"("fiscalInvoiceId");
CREATE INDEX "FiscalInvoiceTax_itemId_idx" ON "FiscalInvoiceTax"("itemId");
CREATE INDEX "FiscalCancellation_companyId_status_idx" ON "FiscalCancellation"("companyId", "status");
CREATE INDEX "FiscalCancellation_fiscalInvoiceId_idx" ON "FiscalCancellation"("fiscalInvoiceId");
CREATE UNIQUE INDEX "FiscalPaymentComplement_collectionReceiptId_key" ON "FiscalPaymentComplement"("collectionReceiptId");
CREATE UNIQUE INDEX "FiscalPaymentComplement_uuid_key" ON "FiscalPaymentComplement"("uuid");
CREATE UNIQUE INDEX "FiscalPaymentComplement_companyId_folio_key" ON "FiscalPaymentComplement"("companyId", "folio");
CREATE INDEX "FiscalPaymentComplement_companyId_status_issueDate_idx" ON "FiscalPaymentComplement"("companyId", "status", "issueDate");
CREATE INDEX "FiscalPaymentComplement_customerId_idx" ON "FiscalPaymentComplement"("customerId");
CREATE INDEX "FiscalPayment_paymentComplementId_paymentDate_idx" ON "FiscalPayment"("paymentComplementId", "paymentDate");
CREATE UNIQUE INDEX "FiscalPaymentRelatedDocument_paymentId_fiscalInvoiceId_key" ON "FiscalPaymentRelatedDocument"("paymentId", "fiscalInvoiceId");
CREATE INDEX "FiscalPaymentRelatedDocument_fiscalInvoiceId_idx" ON "FiscalPaymentRelatedDocument"("fiscalInvoiceId");
CREATE UNIQUE INDEX "ProductionWorkCenter_companyId_code_key" ON "ProductionWorkCenter"("companyId", "code");
CREATE INDEX "ProductionWorkCenter_companyId_active_idx" ON "ProductionWorkCenter"("companyId", "active");
CREATE UNIQUE INDEX "BillOfMaterials_companyId_code_version_key" ON "BillOfMaterials"("companyId", "code", "version");
CREATE INDEX "BillOfMaterials_companyId_finishedProductId_idx" ON "BillOfMaterials"("companyId", "finishedProductId");
CREATE UNIQUE INDEX "BillOfMaterialsItem_bomId_componentId_key" ON "BillOfMaterialsItem"("bomId", "componentId");
CREATE INDEX "BillOfMaterialsItem_componentId_idx" ON "BillOfMaterialsItem"("componentId");
CREATE UNIQUE INDEX "ProductionOrder_companyId_folio_key" ON "ProductionOrder"("companyId", "folio");
CREATE INDEX "ProductionOrder_companyId_status_plannedStartAt_idx" ON "ProductionOrder"("companyId", "status", "plannedStartAt");
CREATE INDEX "ProductionOrder_productId_idx" ON "ProductionOrder"("productId");
CREATE INDEX "ProductionOrder_salesOrderId_idx" ON "ProductionOrder"("salesOrderId");
CREATE INDEX "ProductionOrder_projectId_idx" ON "ProductionOrder"("projectId");
CREATE UNIQUE INDEX "ProductionOrderMaterial_productionOrderId_productId_key" ON "ProductionOrderMaterial"("productionOrderId", "productId");
CREATE INDEX "ProductionOrderMaterial_productId_idx" ON "ProductionOrderMaterial"("productId");
CREATE INDEX "ProductionOrderOutput_productionOrderId_completedAt_idx" ON "ProductionOrderOutput"("productionOrderId", "completedAt");
CREATE INDEX "ProductionOrderOutput_productId_idx" ON "ProductionOrderOutput"("productId");
CREATE UNIQUE INDEX "ProductionOperation_productionOrderId_sequence_key" ON "ProductionOperation"("productionOrderId", "sequence");
CREATE INDEX "ProductionOperation_workCenterId_status_idx" ON "ProductionOperation"("workCenterId", "status");
CREATE INDEX "ProductionOperation_employeeId_idx" ON "ProductionOperation"("employeeId");
CREATE INDEX "ProductionConsumption_productionOrderId_consumedAt_idx" ON "ProductionConsumption"("productionOrderId", "consumedAt");
CREATE INDEX "ProductionConsumption_productId_idx" ON "ProductionConsumption"("productId");
CREATE INDEX "ProductionWaste_productionOrderId_recordedAt_idx" ON "ProductionWaste"("productionOrderId", "recordedAt");
CREATE INDEX "ProductionCost_companyId_recordedAt_idx" ON "ProductionCost"("companyId", "recordedAt");
CREATE INDEX "ProductionCost_productionOrderId_type_idx" ON "ProductionCost"("productionOrderId", "type");
CREATE UNIQUE INDEX "ProductionBatch_companyId_lotNumber_key" ON "ProductionBatch"("companyId", "lotNumber");
CREATE INDEX "ProductionBatch_productId_manufacturedAt_idx" ON "ProductionBatch"("productId", "manufacturedAt");
CREATE UNIQUE INDEX "PosTerminal_companyId_code_key" ON "PosTerminal"("companyId", "code");
CREATE INDEX "PosTerminal_companyId_active_idx" ON "PosTerminal"("companyId", "active");
CREATE INDEX "PosSession_companyId_status_openedAt_idx" ON "PosSession"("companyId", "status", "openedAt");
CREATE INDEX "PosSession_terminalId_status_idx" ON "PosSession"("terminalId", "status");
CREATE UNIQUE INDEX "PosSale_salesOrderId_key" ON "PosSale"("salesOrderId");
CREATE UNIQUE INDEX "PosSale_companyId_folio_key" ON "PosSale"("companyId", "folio");
CREATE INDEX "PosSale_companyId_status_saleDate_idx" ON "PosSale"("companyId", "status", "saleDate");
CREATE INDEX "PosSale_terminalId_saleDate_idx" ON "PosSale"("terminalId", "saleDate");
CREATE INDEX "PosSale_customerId_idx" ON "PosSale"("customerId");
CREATE UNIQUE INDEX "PosSaleItem_saleId_lineNumber_key" ON "PosSaleItem"("saleId", "lineNumber");
CREATE INDEX "PosSaleItem_productId_idx" ON "PosSaleItem"("productId");
CREATE UNIQUE INDEX "PosPayment_collectionReceiptId_key" ON "PosPayment"("collectionReceiptId");
CREATE INDEX "PosPayment_saleId_method_idx" ON "PosPayment"("saleId", "method");
CREATE INDEX "PosCashMovement_companyId_createdAt_idx" ON "PosCashMovement"("companyId", "createdAt");
CREATE INDEX "PosCashMovement_sessionId_type_idx" ON "PosCashMovement"("sessionId", "type");
CREATE INDEX "PosDiscount_saleId_idx" ON "PosDiscount"("saleId");
CREATE UNIQUE INDEX "Module_key_key" ON "Module"("key");
CREATE INDEX "Module_active_sortOrder_idx" ON "Module"("active", "sortOrder");
CREATE UNIQUE INDEX "CompanyModule_companyId_moduleId_key" ON "CompanyModule"("companyId", "moduleId");
CREATE INDEX "CompanyModule_companyId_enabled_idx" ON "CompanyModule"("companyId", "enabled");
CREATE UNIQUE INDEX "ModuleFeature_moduleId_key_key" ON "ModuleFeature"("moduleId", "key");
CREATE UNIQUE INDEX "CompanyModuleFeature_companyModuleId_featureId_key" ON "CompanyModuleFeature"("companyModuleId", "featureId");
CREATE UNIQUE INDEX "SubscriptionPlan_key_key" ON "SubscriptionPlan"("key");
CREATE INDEX "SubscriptionPlan_active_sortOrder_idx" ON "SubscriptionPlan"("active", "sortOrder");
CREATE UNIQUE INDEX "SubscriptionPlanModule_planId_moduleId_key" ON "SubscriptionPlanModule"("planId", "moduleId");
CREATE UNIQUE INDEX "SubscriptionPlanFeature_planId_featureId_key" ON "SubscriptionPlanFeature"("planId", "featureId");
CREATE UNIQUE INDEX "SubscriptionPlanLimit_planId_metricKey_key" ON "SubscriptionPlanLimit"("planId", "metricKey");
CREATE INDEX "CompanySubscription_companyId_status_idx" ON "CompanySubscription"("companyId", "status");
CREATE INDEX "CompanySubscription_planId_status_idx" ON "CompanySubscription"("planId", "status");
CREATE UNIQUE INDEX "CompanyFeatureLimit_companyId_metricKey_key" ON "CompanyFeatureLimit"("companyId", "metricKey");
CREATE UNIQUE INDEX "UsageRecord_companyId_metricKey_periodStart_periodEnd_key" ON "UsageRecord"("companyId", "metricKey", "periodStart", "periodEnd");
CREATE INDEX "UsageRecord_companyId_periodStart_periodEnd_idx" ON "UsageRecord"("companyId", "periodStart", "periodEnd");
CREATE INDEX "SubscriptionChange_companyId_status_effectiveAt_idx" ON "SubscriptionChange"("companyId", "status", "effectiveAt");
CREATE UNIQUE INDEX "BillingInvoice_companyId_number_key" ON "BillingInvoice"("companyId", "number");
CREATE INDEX "BillingInvoice_companyId_status_createdAt_idx" ON "BillingInvoice"("companyId", "status", "createdAt");
CREATE INDEX "BillingInvoiceLine_invoiceId_idx" ON "BillingInvoiceLine"("invoiceId");
CREATE INDEX "BillingCredit_companyId_createdAt_idx" ON "BillingCredit"("companyId", "createdAt");
CREATE INDEX "BillingPaymentMethod_companyId_active_idx" ON "BillingPaymentMethod"("companyId", "active");
CREATE INDEX "BillingPaymentAttempt_companyId_status_attemptedAt_idx" ON "BillingPaymentAttempt"("companyId", "status", "attemptedAt");
CREATE UNIQUE INDEX "ApprovalWorkflow_companyId_key_key" ON "ApprovalWorkflow"("companyId", "key");
CREATE INDEX "ApprovalWorkflow_companyId_entityType_active_idx" ON "ApprovalWorkflow"("companyId", "entityType", "active");
CREATE UNIQUE INDEX "ApprovalRule_workflowId_sequence_key" ON "ApprovalRule"("workflowId", "sequence");
CREATE INDEX "ApprovalRule_workflowId_idx" ON "ApprovalRule"("workflowId");
CREATE INDEX "ApprovalRequest_companyId_status_requestedAt_idx" ON "ApprovalRequest"("companyId", "status", "requestedAt");
CREATE INDEX "ApprovalRequest_companyId_entityType_entityId_idx" ON "ApprovalRequest"("companyId", "entityType", "entityId");
CREATE UNIQUE INDEX "ApprovalStep_requestId_sequence_key" ON "ApprovalStep"("requestId", "sequence");
CREATE INDEX "ApprovalStep_status_approverUserId_idx" ON "ApprovalStep"("status", "approverUserId");
CREATE INDEX "ApprovalAction_requestId_createdAt_idx" ON "ApprovalAction"("requestId", "createdAt");
CREATE UNIQUE INDEX "ExpenseCategory_companyId_code_key" ON "ExpenseCategory"("companyId", "code");
CREATE INDEX "ExpenseCategory_companyId_active_idx" ON "ExpenseCategory"("companyId", "active");
CREATE UNIQUE INDEX "Expense_companyId_folio_key" ON "Expense"("companyId", "folio");
CREATE INDEX "Expense_companyId_status_expenseDate_idx" ON "Expense"("companyId", "status", "expenseDate");
CREATE INDEX "Expense_employeeId_idx" ON "Expense"("employeeId");
CREATE INDEX "Expense_categoryId_idx" ON "Expense"("categoryId");
CREATE UNIQUE INDEX "FixedAssetCategory_companyId_code_key" ON "FixedAssetCategory"("companyId", "code");
CREATE INDEX "FixedAssetCategory_companyId_active_idx" ON "FixedAssetCategory"("companyId", "active");
CREATE UNIQUE INDEX "FixedAsset_companyId_code_key" ON "FixedAsset"("companyId", "code");
CREATE INDEX "FixedAsset_companyId_status_idx" ON "FixedAsset"("companyId", "status");
CREATE INDEX "FixedAsset_categoryId_idx" ON "FixedAsset"("categoryId");
CREATE INDEX "MasterDataContact_companyId_entityType_entityId_idx" ON "MasterDataContact"("companyId", "entityType", "entityId");
CREATE INDEX "MasterDataContact_companyId_email_idx" ON "MasterDataContact"("companyId", "email");
CREATE INDEX "MasterDataAddress_companyId_entityType_entityId_idx" ON "MasterDataAddress"("companyId", "entityType", "entityId");
CREATE UNIQUE INDEX "MasterDataCatalog_companyId_key_key" ON "MasterDataCatalog"("companyId", "key");
CREATE UNIQUE INDEX "MasterDataCatalogValue_catalogId_code_key" ON "MasterDataCatalogValue"("catalogId", "code");
CREATE INDEX "MasterDataCatalogValue_catalogId_active_sortOrder_idx" ON "MasterDataCatalogValue"("catalogId", "active", "sortOrder");
CREATE INDEX "DataQualityIssue_companyId_status_issueType_idx" ON "DataQualityIssue"("companyId", "status", "issueType");
CREATE INDEX "DataQualityIssue_companyId_entityType_entityId_idx" ON "DataQualityIssue"("companyId", "entityType", "entityId");
CREATE INDEX "DataImportJob_companyId_createdAt_idx" ON "DataImportJob"("companyId", "createdAt");
CREATE INDEX "DataImportJob_companyId_status_idx" ON "DataImportJob"("companyId", "status");
CREATE UNIQUE INDEX "DataImportRow_jobId_rowNumber_key" ON "DataImportRow"("jobId", "rowNumber");
CREATE INDEX "DataImportRow_jobId_status_idx" ON "DataImportRow"("jobId", "status");
CREATE INDEX "IntegrationConnection_companyId_status_idx" ON "IntegrationConnection"("companyId", "status");
CREATE INDEX "IntegrationConnection_companyId_provider_idx" ON "IntegrationConnection"("companyId", "provider");
CREATE UNIQUE INDEX "ApiCredential_prefix_key" ON "ApiCredential"("prefix");
CREATE INDEX "ApiCredential_companyId_status_idx" ON "ApiCredential"("companyId", "status");
CREATE INDEX "WebhookEndpoint_companyId_active_idx" ON "WebhookEndpoint"("companyId", "active");
CREATE UNIQUE INDEX "WebhookDeliveryLog_webhookId_requestId_attempt_key" ON "WebhookDeliveryLog"("webhookId", "requestId", "attempt");
CREATE INDEX "WebhookDeliveryLog_companyId_createdAt_idx" ON "WebhookDeliveryLog"("companyId", "createdAt");
CREATE INDEX "WebhookDeliveryLog_webhookId_createdAt_idx" ON "WebhookDeliveryLog"("webhookId", "createdAt");
CREATE INDEX "ApiAccessLog_companyId_createdAt_idx" ON "ApiAccessLog"("companyId", "createdAt");
CREATE INDEX "ApiAccessLog_credentialId_createdAt_idx" ON "ApiAccessLog"("credentialId", "createdAt");
CREATE UNIQUE INDEX "IntegrationEventLog_companyId_dedupKey_key" ON "IntegrationEventLog"("companyId", "dedupKey");
CREATE INDEX "IntegrationEventLog_companyId_createdAt_idx" ON "IntegrationEventLog"("companyId", "createdAt");
CREATE INDEX "IntegrationEventLog_companyId_event_idx" ON "IntegrationEventLog"("companyId", "event");
CREATE INDEX "IntegrationEventLog_companyId_correlationId_idx" ON "IntegrationEventLog"("companyId", "correlationId");
CREATE INDEX "IntegrationEventLog_replayOfId_idx" ON "IntegrationEventLog"("replayOfId");
CREATE INDEX "WebhookDeliveryJob_status_nextAttemptAt_idx" ON "WebhookDeliveryJob"("status", "nextAttemptAt");
CREATE INDEX "WebhookDeliveryJob_companyId_createdAt_idx" ON "WebhookDeliveryJob"("companyId", "createdAt");
CREATE INDEX "WebhookDeliveryJob_webhookId_status_idx" ON "WebhookDeliveryJob"("webhookId", "status");
CREATE INDEX "WebhookDeliveryJob_eventLogId_idx" ON "WebhookDeliveryJob"("eventLogId");
CREATE UNIQUE INDEX "AutomationFlow_companyId_key_key" ON "AutomationFlow"("companyId", "key");
CREATE INDEX "AutomationFlow_companyId_triggerEvent_active_idx" ON "AutomationFlow"("companyId", "triggerEvent", "active");
CREATE INDEX "AutomationFlowRun_companyId_createdAt_idx" ON "AutomationFlowRun"("companyId", "createdAt");
CREATE INDEX "AutomationFlowRun_flowId_createdAt_idx" ON "AutomationFlowRun"("flowId", "createdAt");
CREATE INDEX "AutomationFlowRun_eventLogId_idx" ON "AutomationFlowRun"("eventLogId");
CREATE UNIQUE INDEX "AutomationFlowActionRun_runId_sequence_key" ON "AutomationFlowActionRun"("runId", "sequence");
CREATE INDEX "AutomationFlowActionRun_runId_status_idx" ON "AutomationFlowActionRun"("runId", "status");
CREATE UNIQUE INDEX "IntelligenceMetricDefinition_companyId_key_key" ON "IntelligenceMetricDefinition"("companyId", "key");
CREATE INDEX "IntelligenceMetricDefinition_companyId_category_active_idx" ON "IntelligenceMetricDefinition"("companyId", "category", "active");
CREATE UNIQUE INDEX "IntelligenceInsight_companyId_fingerprint_key" ON "IntelligenceInsight"("companyId", "fingerprint");
CREATE INDEX "IntelligenceInsight_companyId_status_severity_idx" ON "IntelligenceInsight"("companyId", "status", "severity");
CREATE INDEX "IntelligenceInsight_companyId_category_detectedAt_idx" ON "IntelligenceInsight"("companyId", "category", "detectedAt");
CREATE UNIQUE INDEX "IntelligenceMetricSnapshot_companyId_metricKey_capturedDay_key" ON "IntelligenceMetricSnapshot"("companyId", "metricKey", "capturedDay");
CREATE INDEX "IntelligenceMetricSnapshot_companyId_metricKey_capturedDay_idx" ON "IntelligenceMetricSnapshot"("companyId", "metricKey", "capturedDay");
CREATE UNIQUE INDEX "BusinessParty_customerId_key" ON "BusinessParty"("customerId");
CREATE UNIQUE INDEX "BusinessParty_supplierId_key" ON "BusinessParty"("supplierId");
CREATE INDEX "BusinessParty_companyId_active_idx" ON "BusinessParty"("companyId", "active");
CREATE INDEX "BusinessParty_companyId_displayName_idx" ON "BusinessParty"("companyId", "displayName");
CREATE INDEX "BusinessParty_companyId_taxId_idx" ON "BusinessParty"("companyId", "taxId");
CREATE INDEX "BusinessParty_companyId_email_idx" ON "BusinessParty"("companyId", "email");
CREATE UNIQUE INDEX "BusinessPartyRole_partyId_role_key" ON "BusinessPartyRole"("partyId", "role");
CREATE INDEX "BusinessPartyRole_role_active_idx" ON "BusinessPartyRole"("role", "active");
CREATE INDEX "BusinessPartyContact_companyId_partyId_active_idx" ON "BusinessPartyContact"("companyId", "partyId", "active");
CREATE INDEX "BusinessPartyContact_companyId_email_idx" ON "BusinessPartyContact"("companyId", "email");
CREATE INDEX "BusinessPartyAddress_companyId_partyId_active_idx" ON "BusinessPartyAddress"("companyId", "partyId", "active");
CREATE INDEX "BusinessPartyAddress_companyId_postalCode_idx" ON "BusinessPartyAddress"("companyId", "postalCode");
CREATE INDEX "BusinessPartyMergeHistory_companyId_targetPartyId_createdAt_idx" ON "BusinessPartyMergeHistory"("companyId", "targetPartyId", "createdAt");
CREATE INDEX "BusinessPartyMergeHistory_companyId_sourcePartyId_createdAt_idx" ON "BusinessPartyMergeHistory"("companyId", "sourcePartyId", "createdAt");
CREATE INDEX "PlatformSupportTicket_status_priority_createdAt_idx" ON "PlatformSupportTicket"("status", "priority", "createdAt");
CREATE INDEX "PlatformSupportTicket_companyId_status_idx" ON "PlatformSupportTicket"("companyId", "status");

ALTER TABLE "IdempotencyRecord" ADD CONSTRAINT "IdempotencyRecord_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SequenceCounter" ADD CONSTRAINT "SequenceCounter_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Warehouse" ADD CONSTRAINT "Warehouse_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Supplier" ADD CONSTRAINT "Supplier_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PurchaseRequest" ADD CONSTRAINT "PurchaseRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PurchaseRequestItem" ADD CONSTRAINT "PurchaseRequestItem_purchaseRequestId_fkey" FOREIGN KEY ("purchaseRequestId") REFERENCES "PurchaseRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PurchaseRequestItem" ADD CONSTRAINT "PurchaseRequestItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_purchaseRequestId_fkey" FOREIGN KEY ("purchaseRequestId") REFERENCES "PurchaseRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GoodsReceipt" ADD CONSTRAINT "GoodsReceipt_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GoodsReceipt" ADD CONSTRAINT "GoodsReceipt_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GoodsReceipt" ADD CONSTRAINT "GoodsReceipt_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GoodsReceipt" ADD CONSTRAINT "GoodsReceipt_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GoodsReceiptItem" ADD CONSTRAINT "GoodsReceiptItem_goodsReceiptId_fkey" FOREIGN KEY ("goodsReceiptId") REFERENCES "GoodsReceipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GoodsReceiptItem" ADD CONSTRAINT "GoodsReceiptItem_purchaseOrderItemId_fkey" FOREIGN KEY ("purchaseOrderItemId") REFERENCES "PurchaseOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GoodsReceiptItem" ADD CONSTRAINT "GoodsReceiptItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryBalance" ADD CONSTRAINT "InventoryBalance_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryBalance" ADD CONSTRAINT "InventoryBalance_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_goodsReceiptId_fkey" FOREIGN KEY ("goodsReceiptId") REFERENCES "GoodsReceipt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryAdjustment" ADD CONSTRAINT "InventoryAdjustment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryAdjustment" ADD CONSTRAINT "InventoryAdjustment_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryAdjustment" ADD CONSTRAINT "InventoryAdjustment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryAdjustmentItem" ADD CONSTRAINT "InventoryAdjustmentItem_adjustmentId_fkey" FOREIGN KEY ("adjustmentId") REFERENCES "InventoryAdjustment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryAdjustmentItem" ADD CONSTRAINT "InventoryAdjustmentItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryTransfer" ADD CONSTRAINT "InventoryTransfer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryTransfer" ADD CONSTRAINT "InventoryTransfer_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryTransfer" ADD CONSTRAINT "InventoryTransfer_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryTransfer" ADD CONSTRAINT "InventoryTransfer_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryTransferItem" ADD CONSTRAINT "InventoryTransferItem_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "InventoryTransfer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InventoryTransferItem" ADD CONSTRAINT "InventoryTransferItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AccountsPayable" ADD CONSTRAINT "AccountsPayable_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccountsPayable" ADD CONSTRAINT "AccountsPayable_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AccountsPayable" ADD CONSTRAINT "AccountsPayable_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AccountsPayable" ADD CONSTRAINT "AccountsPayable_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SupplierPayment" ADD CONSTRAINT "SupplierPayment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupplierPayment" ADD CONSTRAINT "SupplierPayment_accountsPayableId_fkey" FOREIGN KEY ("accountsPayableId") REFERENCES "AccountsPayable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SupplierPayment" ADD CONSTRAINT "SupplierPayment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccountsReceivable" ADD CONSTRAINT "AccountsReceivable_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccountsReceivable" ADD CONSTRAINT "AccountsReceivable_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AccountsReceivable" ADD CONSTRAINT "AccountsReceivable_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CustomerPayment" ADD CONSTRAINT "CustomerPayment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomerPayment" ADD CONSTRAINT "CustomerPayment_accountsReceivableId_fkey" FOREIGN KEY ("accountsReceivableId") REFERENCES "AccountsReceivable"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CustomerPayment" ADD CONSTRAINT "CustomerPayment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Department" ADD CONSTRAINT "Department_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Position" ADD CONSTRAINT "Position_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Position" ADD CONSTRAINT "Position_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AttendanceRecord" ADD CONSTRAINT "AttendanceRecord_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HrIncident" ADD CONSTRAINT "HrIncident_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "HrIncident" ADD CONSTRAINT "HrIncident_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployeeDocument" ADD CONSTRAINT "EmployeeDocument_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EmployeeDocument" ADD CONSTRAINT "EmployeeDocument_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PayrollPeriod" ADD CONSTRAINT "PayrollPeriod_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PayrollPeriod" ADD CONSTRAINT "PayrollPeriod_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PayrollItem" ADD CONSTRAINT "PayrollItem_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PayrollItem" ADD CONSTRAINT "PayrollItem_payrollPeriodId_fkey" FOREIGN KEY ("payrollPeriodId") REFERENCES "PayrollPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PayrollItem" ADD CONSTRAINT "PayrollItem_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AgendaEvent" ADD CONSTRAINT "AgendaEvent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgendaEvent" ADD CONSTRAINT "AgendaEvent_assigneeEmployeeId_fkey" FOREIGN KEY ("assigneeEmployeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AgendaEvent" ADD CONSTRAINT "AgendaEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TreasuryAccount" ADD CONSTRAINT "TreasuryAccount_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TreasuryMovement" ADD CONSTRAINT "TreasuryMovement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TreasuryMovement" ADD CONSTRAINT "TreasuryMovement_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "TreasuryAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TreasuryMovement" ADD CONSTRAINT "TreasuryMovement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CostCenter" ADD CONSTRAINT "CostCenter_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BudgetLine" ADD CONSTRAINT "BudgetLine_costCenterId_fkey" FOREIGN KEY ("costCenterId") REFERENCES "CostCenter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesQuote" ADD CONSTRAINT "SalesQuote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesQuote" ADD CONSTRAINT "SalesQuote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesQuote" ADD CONSTRAINT "SalesQuote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesQuoteItem" ADD CONSTRAINT "SalesQuoteItem_salesQuoteId_fkey" FOREIGN KEY ("salesQuoteId") REFERENCES "SalesQuote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesQuoteItem" ADD CONSTRAINT "SalesQuoteItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_salesQuoteId_fkey" FOREIGN KEY ("salesQuoteId") REFERENCES "SalesQuote"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SalesOrder" ADD CONSTRAINT "SalesOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesOrderItem" ADD CONSTRAINT "SalesOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesActivity" ADD CONSTRAINT "SalesActivity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesActivity" ADD CONSTRAINT "SalesActivity_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesActivity" ADD CONSTRAINT "SalesActivity_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesActivity" ADD CONSTRAINT "SalesActivity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesActivity" ADD CONSTRAINT "SalesActivity_salesQuoteId_fkey" FOREIGN KEY ("salesQuoteId") REFERENCES "SalesQuote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesActivity" ADD CONSTRAINT "SalesActivity_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesDelivery" ADD CONSTRAINT "SalesDelivery_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesDeliveryItem" ADD CONSTRAINT "SalesDeliveryItem_salesDeliveryId_fkey" FOREIGN KEY ("salesDeliveryId") REFERENCES "SalesDelivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesDeliveryItem" ADD CONSTRAINT "SalesDeliveryItem_salesOrderItemId_fkey" FOREIGN KEY ("salesOrderItemId") REFERENCES "SalesOrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesDeliveryItem" ADD CONSTRAINT "SalesDeliveryItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesInvoice" ADD CONSTRAINT "SalesInvoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_salesDeliveryId_fkey" FOREIGN KEY ("salesDeliveryId") REFERENCES "SalesDelivery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesReturn" ADD CONSTRAINT "SalesReturn_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesReturnItem" ADD CONSTRAINT "SalesReturnItem_salesReturnId_fkey" FOREIGN KEY ("salesReturnId") REFERENCES "SalesReturn"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesReturnItem" ADD CONSTRAINT "SalesReturnItem_salesDeliveryItemId_fkey" FOREIGN KEY ("salesDeliveryItemId") REFERENCES "SalesDeliveryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesReturnItem" ADD CONSTRAINT "SalesReturnItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesCreditNote" ADD CONSTRAINT "SalesCreditNote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SalesCreditNote" ADD CONSTRAINT "SalesCreditNote_salesInvoiceId_fkey" FOREIGN KEY ("salesInvoiceId") REFERENCES "SalesInvoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SalesCreditNote" ADD CONSTRAINT "SalesCreditNote_salesReturnId_fkey" FOREIGN KEY ("salesReturnId") REFERENCES "SalesReturn"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SalesCreditNote" ADD CONSTRAINT "SalesCreditNote_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CollectionReceipt" ADD CONSTRAINT "CollectionReceipt_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CollectionReceipt" ADD CONSTRAINT "CollectionReceipt_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CollectionReceipt" ADD CONSTRAINT "CollectionReceipt_treasuryAccountId_fkey" FOREIGN KEY ("treasuryAccountId") REFERENCES "TreasuryAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CollectionReceipt" ADD CONSTRAINT "CollectionReceipt_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CollectionApplication" ADD CONSTRAINT "CollectionApplication_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CollectionApplication" ADD CONSTRAINT "CollectionApplication_collectionReceiptId_fkey" FOREIGN KEY ("collectionReceiptId") REFERENCES "CollectionReceipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CollectionApplication" ADD CONSTRAINT "CollectionApplication_accountsReceivableId_fkey" FOREIGN KEY ("accountsReceivableId") REFERENCES "AccountsReceivable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BankStatement" ADD CONSTRAINT "BankStatement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BankStatement" ADD CONSTRAINT "BankStatement_treasuryAccountId_fkey" FOREIGN KEY ("treasuryAccountId") REFERENCES "TreasuryAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BankStatement" ADD CONSTRAINT "BankStatement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BankStatementLine" ADD CONSTRAINT "BankStatementLine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BankStatementLine" ADD CONSTRAINT "BankStatementLine_bankStatementId_fkey" FOREIGN KEY ("bankStatementId") REFERENCES "BankStatement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BankStatementLine" ADD CONSTRAINT "BankStatementLine_treasuryMovementId_fkey" FOREIGN KEY ("treasuryMovementId") REFERENCES "TreasuryMovement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BankStatementLine" ADD CONSTRAINT "BankStatementLine_reconciledById_fkey" FOREIGN KEY ("reconciledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CashFlowScenario" ADD CONSTRAINT "CashFlowScenario_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CashFlowScenario" ADD CONSTRAINT "CashFlowScenario_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CashFlowAdjustment" ADD CONSTRAINT "CashFlowAdjustment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CashFlowAdjustment" ADD CONSTRAINT "CashFlowAdjustment_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "CashFlowScenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccountingAccount" ADD CONSTRAINT "AccountingAccount_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AccountingAccount" ADD CONSTRAINT "AccountingAccount_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "AccountingAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AccountingPeriod" ADD CONSTRAINT "AccountingPeriod_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "AccountingPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "JournalLine" ADD CONSTRAINT "JournalLine_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "JournalEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JournalLine" ADD CONSTRAINT "JournalLine_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "AccountingAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_parentProjectId_fkey" FOREIGN KEY ("parentProjectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_parentTaskId_fkey" FOREIGN KEY ("parentTaskId") REFERENCES "ProjectTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProjectTimeEntry" ADD CONSTRAINT "ProjectTimeEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectTimeEntry" ADD CONSTRAINT "ProjectTimeEntry_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ProjectTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProjectTimeEntry" ADD CONSTRAINT "ProjectTimeEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProjectTimeEntry" ADD CONSTRAINT "ProjectTimeEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProjectComment" ADD CONSTRAINT "ProjectComment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectComment" ADD CONSTRAINT "ProjectComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ProjectTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectComment" ADD CONSTRAINT "ProjectComment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProjectSalesOrder" ADD CONSTRAINT "ProjectSalesOrder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectSalesOrder" ADD CONSTRAINT "ProjectSalesOrder_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectPurchaseOrder" ADD CONSTRAINT "ProjectPurchaseOrder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectPurchaseOrder" ADD CONSTRAINT "ProjectPurchaseOrder_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketingChannel" ADD CONSTRAINT "MarketingChannel_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketingCampaign" ADD CONSTRAINT "MarketingCampaign_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketingCampaign" ADD CONSTRAINT "MarketingCampaign_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "MarketingChannel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MarketingCampaign" ADD CONSTRAINT "MarketingCampaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MarketingCampaign" ADD CONSTRAINT "MarketingCampaign_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MarketingCampaignLead" ADD CONSTRAINT "MarketingCampaignLead_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MarketingCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketingCampaignLead" ADD CONSTRAINT "MarketingCampaignLead_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketingCampaignOpportunity" ADD CONSTRAINT "MarketingCampaignOpportunity_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MarketingCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketingCampaignOpportunity" ADD CONSTRAINT "MarketingCampaignOpportunity_prospectId_fkey" FOREIGN KEY ("prospectId") REFERENCES "Prospect"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketingCampaignOpportunity" ADD CONSTRAINT "MarketingCampaignOpportunity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MarketingCampaignOpportunity" ADD CONSTRAINT "MarketingCampaignOpportunity_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MarketingCampaignExpense" ADD CONSTRAINT "MarketingCampaignExpense_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketingCampaignExpense" ADD CONSTRAINT "MarketingCampaignExpense_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MarketingCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketingCampaignExpense" ADD CONSTRAINT "MarketingCampaignExpense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MarketingCalendarEvent" ADD CONSTRAINT "MarketingCalendarEvent_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketingCalendarEvent" ADD CONSTRAINT "MarketingCalendarEvent_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MarketingCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketingCalendarEvent" ADD CONSTRAINT "MarketingCalendarEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MarketingMetric" ADD CONSTRAINT "MarketingMetric_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketingMetric" ADD CONSTRAINT "MarketingMetric_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "MarketingCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FiscalIssuerProfile" ADD CONSTRAINT "FiscalIssuerProfile_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FiscalCustomerProfile" ADD CONSTRAINT "FiscalCustomerProfile_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FiscalInvoice" ADD CONSTRAINT "FiscalInvoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FiscalInvoice" ADD CONSTRAINT "FiscalInvoice_salesInvoiceId_fkey" FOREIGN KEY ("salesInvoiceId") REFERENCES "SalesInvoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FiscalInvoice" ADD CONSTRAINT "FiscalInvoice_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FiscalInvoice" ADD CONSTRAINT "FiscalInvoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FiscalInvoice" ADD CONSTRAINT "FiscalInvoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FiscalInvoiceItem" ADD CONSTRAINT "FiscalInvoiceItem_fiscalInvoiceId_fkey" FOREIGN KEY ("fiscalInvoiceId") REFERENCES "FiscalInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FiscalInvoiceTax" ADD CONSTRAINT "FiscalInvoiceTax_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "FiscalInvoiceItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FiscalCancellation" ADD CONSTRAINT "FiscalCancellation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FiscalCancellation" ADD CONSTRAINT "FiscalCancellation_fiscalInvoiceId_fkey" FOREIGN KEY ("fiscalInvoiceId") REFERENCES "FiscalInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FiscalCancellation" ADD CONSTRAINT "FiscalCancellation_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FiscalPaymentComplement" ADD CONSTRAINT "FiscalPaymentComplement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FiscalPaymentComplement" ADD CONSTRAINT "FiscalPaymentComplement_collectionReceiptId_fkey" FOREIGN KEY ("collectionReceiptId") REFERENCES "CollectionReceipt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "FiscalPaymentComplement" ADD CONSTRAINT "FiscalPaymentComplement_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FiscalPaymentComplement" ADD CONSTRAINT "FiscalPaymentComplement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FiscalPayment" ADD CONSTRAINT "FiscalPayment_paymentComplementId_fkey" FOREIGN KEY ("paymentComplementId") REFERENCES "FiscalPaymentComplement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FiscalPaymentRelatedDocument" ADD CONSTRAINT "FiscalPaymentRelatedDocument_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "FiscalPayment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FiscalPaymentRelatedDocument" ADD CONSTRAINT "FiscalPaymentRelatedDocument_fiscalInvoiceId_fkey" FOREIGN KEY ("fiscalInvoiceId") REFERENCES "FiscalInvoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductionWorkCenter" ADD CONSTRAINT "ProductionWorkCenter_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BillOfMaterials" ADD CONSTRAINT "BillOfMaterials_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BillOfMaterials" ADD CONSTRAINT "BillOfMaterials_finishedProductId_fkey" FOREIGN KEY ("finishedProductId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BillOfMaterialsItem" ADD CONSTRAINT "BillOfMaterialsItem_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES "BillOfMaterials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BillOfMaterialsItem" ADD CONSTRAINT "BillOfMaterialsItem_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductionOrder" ADD CONSTRAINT "ProductionOrder_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductionOrder" ADD CONSTRAINT "ProductionOrder_bomId_fkey" FOREIGN KEY ("bomId") REFERENCES "BillOfMaterials"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductionOrder" ADD CONSTRAINT "ProductionOrder_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductionOrder" ADD CONSTRAINT "ProductionOrder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductionOrder" ADD CONSTRAINT "ProductionOrder_issueWarehouseId_fkey" FOREIGN KEY ("issueWarehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductionOrder" ADD CONSTRAINT "ProductionOrder_receiptWarehouseId_fkey" FOREIGN KEY ("receiptWarehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductionOrder" ADD CONSTRAINT "ProductionOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductionOrder" ADD CONSTRAINT "ProductionOrder_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductionOrderMaterial" ADD CONSTRAINT "ProductionOrderMaterial_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "ProductionOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductionOrderMaterial" ADD CONSTRAINT "ProductionOrderMaterial_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductionOrderOutput" ADD CONSTRAINT "ProductionOrderOutput_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "ProductionOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductionOrderOutput" ADD CONSTRAINT "ProductionOrderOutput_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductionOperation" ADD CONSTRAINT "ProductionOperation_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "ProductionOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductionOperation" ADD CONSTRAINT "ProductionOperation_workCenterId_fkey" FOREIGN KEY ("workCenterId") REFERENCES "ProductionWorkCenter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductionOperation" ADD CONSTRAINT "ProductionOperation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductionOperation" ADD CONSTRAINT "ProductionOperation_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductionConsumption" ADD CONSTRAINT "ProductionConsumption_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "ProductionOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductionConsumption" ADD CONSTRAINT "ProductionConsumption_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductionWaste" ADD CONSTRAINT "ProductionWaste_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "ProductionOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductionWaste" ADD CONSTRAINT "ProductionWaste_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProductionCost" ADD CONSTRAINT "ProductionCost_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductionCost" ADD CONSTRAINT "ProductionCost_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "ProductionOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductionBatch" ADD CONSTRAINT "ProductionBatch_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductionBatch" ADD CONSTRAINT "ProductionBatch_productionOrderId_fkey" FOREIGN KEY ("productionOrderId") REFERENCES "ProductionOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductionBatch" ADD CONSTRAINT "ProductionBatch_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PosTerminal" ADD CONSTRAINT "PosTerminal_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PosTerminal" ADD CONSTRAINT "PosTerminal_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PosSession" ADD CONSTRAINT "PosSession_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PosSession" ADD CONSTRAINT "PosSession_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "PosTerminal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PosSession" ADD CONSTRAINT "PosSession_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PosSession" ADD CONSTRAINT "PosSession_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PosSale" ADD CONSTRAINT "PosSale_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PosSale" ADD CONSTRAINT "PosSale_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "PosTerminal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PosSale" ADD CONSTRAINT "PosSale_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PosSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PosSale" ADD CONSTRAINT "PosSale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PosSale" ADD CONSTRAINT "PosSale_salesOrderId_fkey" FOREIGN KEY ("salesOrderId") REFERENCES "SalesOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PosSale" ADD CONSTRAINT "PosSale_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PosSaleItem" ADD CONSTRAINT "PosSaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "PosSale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PosSaleItem" ADD CONSTRAINT "PosSaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PosPayment" ADD CONSTRAINT "PosPayment_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "PosSale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PosPayment" ADD CONSTRAINT "PosPayment_collectionReceiptId_fkey" FOREIGN KEY ("collectionReceiptId") REFERENCES "CollectionReceipt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PosCashMovement" ADD CONSTRAINT "PosCashMovement_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PosCashMovement" ADD CONSTRAINT "PosCashMovement_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "PosSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PosCashMovement" ADD CONSTRAINT "PosCashMovement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PosDiscount" ADD CONSTRAINT "PosDiscount_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "PosSale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyModule" ADD CONSTRAINT "CompanyModule_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyModule" ADD CONSTRAINT "CompanyModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ModuleFeature" ADD CONSTRAINT "ModuleFeature_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyModuleFeature" ADD CONSTRAINT "CompanyModuleFeature_companyModuleId_fkey" FOREIGN KEY ("companyModuleId") REFERENCES "CompanyModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanyModuleFeature" ADD CONSTRAINT "CompanyModuleFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "ModuleFeature"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubscriptionPlanModule" ADD CONSTRAINT "SubscriptionPlanModule_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubscriptionPlanModule" ADD CONSTRAINT "SubscriptionPlanModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubscriptionPlanFeature" ADD CONSTRAINT "SubscriptionPlanFeature_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubscriptionPlanFeature" ADD CONSTRAINT "SubscriptionPlanFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "ModuleFeature"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubscriptionPlanLimit" ADD CONSTRAINT "SubscriptionPlanLimit_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanySubscription" ADD CONSTRAINT "CompanySubscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CompanySubscription" ADD CONSTRAINT "CompanySubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CompanySubscription" ADD CONSTRAINT "CompanySubscription_scheduledPlanId_fkey" FOREIGN KEY ("scheduledPlanId") REFERENCES "SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CompanySubscription" ADD CONSTRAINT "CompanySubscription_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CompanyFeatureLimit" ADD CONSTRAINT "CompanyFeatureLimit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UsageRecord" ADD CONSTRAINT "UsageRecord_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubscriptionChange" ADD CONSTRAINT "SubscriptionChange_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubscriptionChange" ADD CONSTRAINT "SubscriptionChange_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "CompanySubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SubscriptionChange" ADD CONSTRAINT "SubscriptionChange_fromPlanId_fkey" FOREIGN KEY ("fromPlanId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SubscriptionChange" ADD CONSTRAINT "SubscriptionChange_toPlanId_fkey" FOREIGN KEY ("toPlanId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SubscriptionChange" ADD CONSTRAINT "SubscriptionChange_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BillingInvoice" ADD CONSTRAINT "BillingInvoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BillingInvoice" ADD CONSTRAINT "BillingInvoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "CompanySubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BillingInvoiceLine" ADD CONSTRAINT "BillingInvoiceLine_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "BillingInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BillingCredit" ADD CONSTRAINT "BillingCredit_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BillingCredit" ADD CONSTRAINT "BillingCredit_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "BillingInvoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BillingPaymentMethod" ADD CONSTRAINT "BillingPaymentMethod_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BillingPaymentAttempt" ADD CONSTRAINT "BillingPaymentAttempt_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BillingPaymentAttempt" ADD CONSTRAINT "BillingPaymentAttempt_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "BillingInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApprovalWorkflow" ADD CONSTRAINT "ApprovalWorkflow_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApprovalRule" ADD CONSTRAINT "ApprovalRule_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "ApprovalWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApprovalRule" ADD CONSTRAINT "ApprovalRule_approverUserId_fkey" FOREIGN KEY ("approverUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ApprovalRule" ADD CONSTRAINT "ApprovalRule_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "ApprovalWorkflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ApprovalRequest" ADD CONSTRAINT "ApprovalRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ApprovalStep" ADD CONSTRAINT "ApprovalStep_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ApprovalRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApprovalStep" ADD CONSTRAINT "ApprovalStep_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "ApprovalRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ApprovalStep" ADD CONSTRAINT "ApprovalStep_approverUserId_fkey" FOREIGN KEY ("approverUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ApprovalStep" ADD CONSTRAINT "ApprovalStep_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ApprovalStep" ADD CONSTRAINT "ApprovalStep_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ApprovalAction" ADD CONSTRAINT "ApprovalAction_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ApprovalRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApprovalAction" ADD CONSTRAINT "ApprovalAction_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ExpenseCategory" ADD CONSTRAINT "ExpenseCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FixedAssetCategory" ADD CONSTRAINT "FixedAssetCategory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FixedAsset" ADD CONSTRAINT "FixedAsset_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FixedAsset" ADD CONSTRAINT "FixedAsset_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "FixedAssetCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FixedAsset" ADD CONSTRAINT "FixedAsset_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "MasterDataContact" ADD CONSTRAINT "MasterDataContact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MasterDataAddress" ADD CONSTRAINT "MasterDataAddress_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MasterDataCatalog" ADD CONSTRAINT "MasterDataCatalog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MasterDataCatalogValue" ADD CONSTRAINT "MasterDataCatalogValue_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "MasterDataCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DataQualityIssue" ADD CONSTRAINT "DataQualityIssue_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DataImportJob" ADD CONSTRAINT "DataImportJob_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DataImportJob" ADD CONSTRAINT "DataImportJob_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DataImportRow" ADD CONSTRAINT "DataImportRow_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "DataImportJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IntegrationConnection" ADD CONSTRAINT "IntegrationConnection_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IntegrationConnection" ADD CONSTRAINT "IntegrationConnection_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ApiCredential" ADD CONSTRAINT "ApiCredential_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApiCredential" ADD CONSTRAINT "ApiCredential_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WebhookEndpoint" ADD CONSTRAINT "WebhookEndpoint_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WebhookEndpoint" ADD CONSTRAINT "WebhookEndpoint_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WebhookDeliveryLog" ADD CONSTRAINT "WebhookDeliveryLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WebhookDeliveryLog" ADD CONSTRAINT "WebhookDeliveryLog_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "WebhookEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApiAccessLog" ADD CONSTRAINT "ApiAccessLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ApiAccessLog" ADD CONSTRAINT "ApiAccessLog_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "ApiCredential"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "IntegrationEventLog" ADD CONSTRAINT "IntegrationEventLog_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WebhookDeliveryJob" ADD CONSTRAINT "WebhookDeliveryJob_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WebhookDeliveryJob" ADD CONSTRAINT "WebhookDeliveryJob_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "WebhookEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WebhookDeliveryJob" ADD CONSTRAINT "WebhookDeliveryJob_eventLogId_fkey" FOREIGN KEY ("eventLogId") REFERENCES "IntegrationEventLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AutomationFlow" ADD CONSTRAINT "AutomationFlow_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AutomationFlow" ADD CONSTRAINT "AutomationFlow_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AutomationFlow" ADD CONSTRAINT "AutomationFlow_runAsUserId_fkey" FOREIGN KEY ("runAsUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AutomationFlowRun" ADD CONSTRAINT "AutomationFlowRun_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AutomationFlowRun" ADD CONSTRAINT "AutomationFlowRun_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "AutomationFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AutomationFlowRun" ADD CONSTRAINT "AutomationFlowRun_eventLogId_fkey" FOREIGN KEY ("eventLogId") REFERENCES "IntegrationEventLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AutomationFlowActionRun" ADD CONSTRAINT "AutomationFlowActionRun_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AutomationFlowRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IntelligenceMetricDefinition" ADD CONSTRAINT "IntelligenceMetricDefinition_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IntelligenceInsight" ADD CONSTRAINT "IntelligenceInsight_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IntelligenceMetricSnapshot" ADD CONSTRAINT "IntelligenceMetricSnapshot_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BusinessParty" ADD CONSTRAINT "BusinessParty_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BusinessParty" ADD CONSTRAINT "BusinessParty_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BusinessParty" ADD CONSTRAINT "BusinessParty_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BusinessPartyRole" ADD CONSTRAINT "BusinessPartyRole_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "BusinessParty"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BusinessPartyContact" ADD CONSTRAINT "BusinessPartyContact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BusinessPartyContact" ADD CONSTRAINT "BusinessPartyContact_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "BusinessParty"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BusinessPartyAddress" ADD CONSTRAINT "BusinessPartyAddress_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BusinessPartyAddress" ADD CONSTRAINT "BusinessPartyAddress_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "BusinessParty"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BusinessPartyMergeHistory" ADD CONSTRAINT "BusinessPartyMergeHistory_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
