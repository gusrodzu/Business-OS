# BuzzBee v21.0.0 — React + CSS Modules Architecture

## Resultado de la auditoría de migración

La aplicación ya estaba construida en React 19 y una parte muy grande de la UI ya utilizaba CSS Modules. La migración v21 formaliza esa arquitectura y añade un gate que impide volver a introducir dependencias visuales globales dentro de páginas/componentes.

- 160 archivos JSX auditados.
- 142 CSS Modules detectados.
- 33 CSS globales conservados temporalmente exclusivamente como foundation/theme/compatibilidad.
- `App.jsx` dejó de depender de la clase global `route-loading`; ahora usa `App.module.css`.
- Ningún componente/página React puede importar CSS global directamente (salvo `main.jsx`, que es el punto de entrada de foundation/theme).
- Ningún elemento JSX puede introducir `className="..."` literal sin que falle el gate arquitectónico.
- Versiones root/web/api sincronizadas en 21.0.0.

## Gate nuevo

```powershell
npm run architecture:react-css-modules
```

Este gate debe permanecer PASS antes de integrar nuevos módulos.

## Regla v21

Las páginas y componentes deben usar `*.module.css`. `main.jsx` es el único punto permitido para cargar estilos globales de tokens, reset, temas y la capa temporal de compatibilidad. Las clases recibidas por `className` en componentes del Design System siguen siendo válidas porque son clases generadas por CSS Modules desde el consumidor.

## Compatibilidad legacy

Los 33 CSS globales actuales no se eliminan de golpe para evitar regresiones. Se consideran deuda de compatibilidad y se retirarán por oleadas conforme cada módulo sea certificado visualmente. El objetivo final es dejar globales únicamente tokens, reset/base tipográfica y temas light/dark.

## Estado

`npm run architecture:react-css-modules`: PASS.

El build no se certificó dentro del entorno de empaquetado porque no contiene `node_modules` y `vite` no está instalado allí. Debe validarse después de `npm install` en el entorno de desarrollo/CI.
