import {lazy} from 'react';
const Products=lazy(()=>import('./ui/pages/Products'));
const InventoryBalances=lazy(()=>import('./ui/pages/InventoryBalances'));
const InventoryMovements=lazy(()=>import('./ui/pages/InventoryMovements'));
const InventoryOperations=lazy(()=>import('./ui/pages/InventoryOperations'));
const ModulePlaceholder=lazy(()=>import('../shared/ui/ModulePlaceholder'));
const Warehouses=lazy(()=>import('./ui/pages/Warehouses'));

export const inventoryRoutes = [
  {id: 'inventory:inventario/productos', path: 'inventario/productos', Component: Products},
  {id: 'inventory:inventario/existencias', path: 'inventario/existencias', Component: InventoryBalances},
  {id: 'inventory:inventario/movimientos', path: 'inventario/movimientos', Component: InventoryMovements},
  {id: 'inventory:inventario/operaciones', path: 'inventario/operaciones', Component: InventoryOperations},
  {id: 'inventory:inventario/*', path: 'inventario/*', Component: ModulePlaceholder},
  {id: 'inventory:almacenes', path: 'almacenes', Component: Warehouses},
];
