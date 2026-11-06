import {Edit3} from 'lucide-react';
import {Badge,Button} from '../../../../design-system/components';
import {EntityDrawer} from '../../../../ux-foundation/UXFoundation';
import ProductDetailPanel from './ProductDetailPanel';

const productTabs = [
  {id:'summary',label:'Resumen'},
  {id:'commercial',label:'Comercial'},
  {id:'inventory',label:'Inventario'},
];

export default function ProductDetailDrawer({product,activeTab,onTabChange,onClose,onEdit,formatMoney}){
  return <EntityDrawer
    open={Boolean(product)}
    onClose={onClose}
    eyebrow="Producto"
    title={product?.name}
    subtitle={product?.sku}
    status={product?<Badge tone={product.active?'success':'neutral'}>{product.active?'Activo':'Inactivo'}</Badge>:null}
    activeTab={activeTab}
    onTabChange={onTabChange}
    tabs={productTabs}
    actions={product?<Button size="sm" variant="secondary" onClick={()=>onEdit(product)}><Edit3 size={15}/> Editar</Button>:null}
    footer={<Button variant="secondary" onClick={onClose}>Cerrar</Button>}
  >
    <ProductDetailPanel product={product} activeTab={activeTab} formatMoney={formatMoney}/>
  </EntityDrawer>;
}
