# BuzzBee Business OS

## Arquitectura modular
BuzzBee organiza frontend y API por dominios funcionales. Los módulos no deben importar páginas o rutas legacy; las dependencias transversales deben vivir en contratos compartidos explícitos. Las rutas públicas existentes se conservan para no romper Demo Offline, Demo Live ni producción.

## Shared kernel
El Shared kernel contiene únicamente contratos y utilidades realmente compartidos entre dominios: identidad/tenant, eventos, permisos, tipos y primitivas comunes. No debe convertirse en un módulo de negocio genérico ni introducir dependencias circulares.

## Fluid UI
La capa Fluid UI combina la estructura MD3 existente con respuesta inmediata, jerarquía espacial, superficies contextuales, movimiento interrumpible cuando aplica, accesibilidad, dark mode y reduced motion/transparency. Los componentes canónicos se reutilizan en todos los módulos.

## Validación
Ejecutar los validadores en `scripts/` antes de publicar. Para el frontend: `cd apps/web`, `npm install`, `npm run build` y `npm run lint`.
