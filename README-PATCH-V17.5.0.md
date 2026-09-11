# Patch BuzzBee ERP v17.5.0

Base requerida: **v17.4.4 — Projects Layout & Data Hotfix**.

Copiar el contenido del patch sobre la raíz del proyecto conservando rutas.

Después ejecutar:

```powershell
npm install
npm run qa:visual-controls
npm run qa:ui-contract
npm run qa:offline-dependencies
npm run build
```

El patch normaliza superficies clicables, icon-actions, switches densos y el layout del POS. No cambia lógica de negocio ni el contrato offline.
