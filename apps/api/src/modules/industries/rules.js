import {PROFILES} from './catalog.js';

// Declarative hints only: they do not grant permissions, change schemas or enable paid modules.
export const CAPABILITY_RULES=Object.freeze({
 vehicle_fitment:{module:'inventory',feature:'vehicleCompatibility',fields:['make','model','year','engine'],workflow:'compatibility_lookup'},
 multi_warehouse:{module:'inventory',feature:'warehouseLocations',fields:['warehouseId'],workflow:'stock_by_location'},
 part_cross_references:{module:'inventory',feature:'partCrossReferences',fields:['alternativePartNumbers'],workflow:'part_lookup'},
 service_orders:{module:'sales',feature:'serviceOrders',fields:['serviceOrderId','status'],workflow:'service_order'},
 vehicle_history:{module:'crm',feature:'vehicleHistory',fields:['vehicleId'],workflow:'vehicle_service_history'},
 technician_assignment:{module:'hr',feature:'technicianAssignment',fields:['technicianId'],workflow:'technician_schedule'},
 tables:{module:'pos',feature:'tableService',fields:['tableId'],workflow:'table_order'},
 kitchen_orders:{module:'pos',feature:'kitchenTickets',fields:['orderId'],workflow:'kitchen_queue'},
 recipes:{module:'inventory',feature:'recipes',fields:['recipeId'],workflow:'ingredient_consumption'},
 staff_booking:{module:'agenda',feature:'staffBooking',fields:['staffId','startsAt'],workflow:'appointment'},
 commissions:{module:'sales',feature:'commissions',fields:['commissionRuleId'],workflow:'commission_tracking'},
 fleet:{module:'operations',feature:'fleetManagement',fields:['vehicleId'],workflow:'fleet_tracking'},
 dispatch:{module:'operations',feature:'dispatchBoard',fields:['dispatchId'],workflow:'dispatch'},
 routing:{module:'operations',feature:'routePlanning',fields:['routeId'],workflow:'route_planning'},
 proof_of_delivery:{module:'operations',feature:'proofOfDelivery',fields:['deliveryId'],workflow:'delivery_confirmation'},
 bom:{module:'production',feature:'billOfMaterials',fields:['bomId'],workflow:'production_order'},
 quality_control:{module:'production',feature:'qualityChecks',fields:['inspectionId'],workflow:'quality_inspection'},
 medical_records:{module:'crm',feature:'clinicalRecords',fields:['patientId'],workflow:'clinical_record_review',restricted:true},
 restricted_access:{module:'crm',feature:'sensitiveRecordAccess',fields:['accessPolicyId'],workflow:'access_control',restricted:true},
 enrollment:{module:'crm',feature:'studentEnrollment',fields:['studentId'],workflow:'enrollment'},
 attendance:{module:'hr',feature:'attendance',fields:['attendanceDate'],workflow:'attendance_tracking'},
 work_sites:{module:'projects',feature:'workSites',fields:['siteId'],workflow:'site_management'},
 progress_tracking:{module:'projects',feature:'progressTracking',fields:['progressPercent'],workflow:'progress_reporting'},
 billable_hours:{module:'projects',feature:'billableHours',fields:['timeEntryId'],workflow:'time_tracking'},
 unit_conversions:{module:'inventory',feature:'unitConversions',fields:['unitId'],workflow:'unit_conversion'},
 tiered_pricing:{module:'sales',feature:'volumePricing',fields:['priceTierId'],workflow:'volume_quotation'},
 online_orders:{module:'sales',feature:'onlineOrders',fields:['externalOrderId'],workflow:'online_order_import'},
 returns:{module:'sales',feature:'returns',fields:['returnId'],workflow:'returns_processing'},
 shipping_integrations:{module:'operations',feature:'shippingIntegrations',fields:['shipmentId'],workflow:'shipping'},
 room_inventory:{module:'operations',feature:'roomInventory',fields:['roomId'],workflow:'room_availability'},
 bookings:{module:'agenda',feature:'reservations',fields:['reservationId'],workflow:'booking'},
 housekeeping:{module:'operations',feature:'housekeeping',fields:['roomId'],workflow:'housekeeping'},
 property_inventory:{module:'crm',feature:'propertyInventory',fields:['propertyId'],workflow:'property_listing'},
 contracts:{module:'sales',feature:'contracts',fields:['contractId'],workflow:'contract_management'},
 crop_cycles:{module:'production',feature:'cropCycles',fields:['cropCycleId'],workflow:'crop_planning'},
 field_costs:{module:'finance',feature:'fieldCosting',fields:['fieldId'],workflow:'field_costing'},
 traceability:{module:'inventory',feature:'lotTraceability',fields:['lotId'],workflow:'traceability'},
 recurring_maintenance:{module:'agenda',feature:'recurringMaintenance',fields:['maintenancePlanId'],workflow:'maintenance_schedule'}
});

export function resolveIndustryRules(activities){
 if(!Array.isArray(activities)||activities.length===0||activities.length>30)throw new Error('Selecciona entre 1 y 30 actividades');
 const keys=[...new Set(activities)];
 const selected=keys.map(key=>PROFILES.find(profile=>profile.slug===key));
 if(selected.some(profile=>!profile))throw new Error('Actividad no reconocida');
 const map=new Map();
 for(const profile of selected){
  for(const capability of profile.capabilities||[]){
   const definition=CAPABILITY_RULES[capability];
   if(!definition)continue;
   if(!map.has(capability))map.set(capability,{key:capability,...definition,sourceActivities:[]});
   map.get(capability).sourceActivities.push(profile.slug);
  }
 }
 return {primaryActivity:keys[0],secondaryActivities:keys.slice(1),rules:[...map.values()],mode:'SUGGESTED',autoEnabled:false};
}
