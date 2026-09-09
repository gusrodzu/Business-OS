# BuzzBee Web Modules

Cada carpeta representa un dominio funcional. `routes.jsx` es el contrato público del módulo con el shell web.

Reglas:
1. Un módulo no registra rutas directamente en `App.jsx`.
2. Las rutas nuevas se agregan en `src/modules/<dominio>/routes.jsx`.
3. `src/modules/registry.jsx` compone los dominios y valida duplicados.
4. Las páginas legacy en `src/pages` siguen siendo compatibles durante la migración física.
5. Cuando un dominio se migre, sus páginas/componentes/hooks pueden moverse dentro de su carpeta sin modificar el shell global.
