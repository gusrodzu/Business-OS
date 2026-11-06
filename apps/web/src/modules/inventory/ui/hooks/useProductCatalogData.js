import {useEffect, useState} from 'react';
import {inventoryRequest as apiRequest} from '../../services/inventoryApi';

// Solo lectura del catálogo: las mutaciones y permisos siguen en Products.
export function useProductCatalogData() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const result = await apiRequest('/products');
      setItems(result.products ?? []);
      setCategories(result.categories ?? []);
    } catch (error) {
      setMessage({type: 'error', text: error.message});
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  return {items, setItems, categories, loading, message, setMessage, loadData};
}
