# BuzzBee ERP v17.4.3 — POS Layout Hotfix

Corrige la vista `/pos` para evitar que tarjetas de categoría y producto hereden la geometría pill del contrato global de botones.

## Cambios
- Nuevo atributo `data-ui-surface="card"` para superficies clicables que no son botones convencionales.
- `unified-ui.css` excluye estas superficies del estándar global pill.
- Categorías y productos recuperan cards rectangulares con radio 14px.
- Grid de productos más estable entre 1180–1440px.
- Panel de ticket sin `max-height` artificial; se respeta el scroll principal del workspace.
- Área de carrito más usable y formas de pago normalizadas a controles de 40px.
