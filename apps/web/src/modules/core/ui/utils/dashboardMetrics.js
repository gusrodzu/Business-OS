import {Activity, Box, CalendarDays, CircleDollarSign, ClipboardCheck, PackageX, ShoppingBag, TrendingUp, Users} from 'lucide-react';

// Presentation-only catalog; IDs remain stable for saved company/user preferences.
export function getDashboardMetrics(data, currency, {money, number}) {
  const baseKpis = [
    {
      id: 'pendingRequests',
      label: 'Solicitudes pendientes',
      value: number(data?.kpis?.pendingRequests),
      change: 'Por atender',
      trend: 'neutral',
      icon: ClipboardCheck,
      tone: 'blue',
    },
    {
      id: 'ordersThisMonth',
      label: 'Órdenes del mes',
      value: number(data?.kpis?.ordersThisMonth),
      change: `${data?.kpis?.purchaseChange >= 0 ? '+' : ''}${number(data?.kpis?.purchaseChange)}%`,
      trend: data?.kpis?.purchaseChange >= 0 ? 'up' : 'down',
      icon: ShoppingBag,
      tone: 'violet',
    },
    {
      id: 'inventoryValue',
      label: 'Valor de inventario',
      value: money(data?.kpis?.inventoryValue, currency),
      change: 'Valor actual',
      trend: 'neutral',
      icon: CircleDollarSign,
      tone: 'green',
    },
    {
      id: 'criticalStock',
      label: 'Stock crítico',
      value: number(data?.kpis?.criticalStock),
      change: Number(data?.kpis?.criticalStock) > 0 ? 'Requiere atención' : 'Sin alertas',
      trend: 'neutral',
      icon: PackageX,
      tone: 'amber',
    },
  ];

  const monthlyValues = (data?.monthlyPurchases || []).map((item) => Number(item.total || 0));
  const purchaseTotal = monthlyValues.reduce((sum, value) => sum + value, 0);
  return [
    ...baseKpis,
    {
      id:'annualPurchases',label:'Compras del año',value:money(purchaseTotal,currency),
      change:'Datos de compras disponibles',trend:'neutral',icon:TrendingUp,tone:'violet',
    },
    {
      id:'recentRequests',label:'Solicitudes recientes',value:number(data?.recentRequests?.length),
      change:'Últimos registros',trend:'neutral',icon:ClipboardCheck,tone:'blue',
    },
    {
      id:'activeUsers',label:'Usuarios activos',value:number(data?.activity?.activeUsers),
      change:`De ${number(data?.activity?.totalUsers)} usuarios`,trend:'neutral',icon:Users,tone:'green',
    },
    {
      id:'pendingAgenda',label:'Próximos vencimientos',value:number(data?.agenda?.length),
      change:'Agenda financiera',trend:'neutral',icon:CalendarDays,tone:'violet',
    },
    {
      id:'notifications',label:'Avisos operativos',value:number(recentNotifications.length),
      change:'Notificaciones registradas',trend:'neutral',icon:Activity,tone:'amber',
    },
    {
      id:'inventoryCategories',label:'Categorías inventariadas',value:number(data?.categorySpend?.length),
      change:'Categorías con registros',trend:'neutral',icon:Box,tone:'green',
    },
  ];

}
