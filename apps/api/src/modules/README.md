# BuzzBee API Modules

`src/modules` es la frontera oficial entre el core de Express y los dominios de BuzzBee.

Cada módulo publica un manifiesto mínimo:

```js
export default {
  id: 'inventory',
  routes: [
    {path: '/api/inventory', router: inventoryRouter},
  ],
};
```

## Reglas de mantenimiento

1. `src/index.js` no importa routers de negocio.
2. Cada endpoint pertenece a un solo módulo.
3. Un módulo puede usar `routes/` y `services/` legacy durante la migración, pero su registro público vive aquí.
4. Nuevos dominios se agregan a `bootstrap/registerApiModules.js`.
5. Workers se registran únicamente en `bootstrap/workers.js`.
6. No introducir dependencias circulares entre módulos; compartir infraestructura desde `lib/`, `middleware/` o futuros paquetes `packages/*`.

## Migración física progresiva

La capa modular permite mover después, dominio por dominio:

`routes/inventory.js` → `modules/inventory/http/inventory.routes.js`

sin cambiar el bootstrap global. La migración puede hacerse por sprint y verificarse con QA.
