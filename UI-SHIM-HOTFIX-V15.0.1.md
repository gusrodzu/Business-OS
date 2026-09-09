# BuzzBee ERP v15.0.1 · UI Shim Hotfix

Corrige instalaciones que llegaron a v15.0.0 aplicando patches acumulativos y conservaron archivos legacy en `apps/web/src/pages`.

## Uso

```powershell
npm run fix:ui-shims
```

El comando elimina **únicamente** archivos que contienen el marcador oficial:

`Compatibility shim. Canonical UI lives`

Luego ejecuta automáticamente `qa:modular-all`.

Resultado esperado:

`PASS  No UI compatibility shims · 0`

La distribución completa v15.0.0 ya estaba limpia; este hotfix está pensado especialmente para árboles de trabajo actualizados mediante patches.
