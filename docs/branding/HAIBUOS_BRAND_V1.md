# HaibuOS · identidad visual preliminar v1

**Estado:** propuesta de rebranding revisable; no implica registro legal, publicación ni cambio de identificadores técnicos.

## Marca

- Nombre visible: **HaibuOS** (estilización exacta; no «Haibu OS» ni «HAIBU OS» en producto).
- Frase de marca: **Tu negocio. Tu sistema.**
- Descriptor: plataforma empresarial modular, adaptable y colaborativa.
- Narrativa: una colmena digital donde cada empresa configura su espacio y cada colaborador ve solo las herramientas que necesita.
- Marca corta en conversación: «Haibu» **solo después** de validar su viabilidad comercial.

## Diseño visual

- Isotipo: tres celdas hexagonales conectadas con una celda central activa. Archivo maestro SVG: `apps/web/public/haibu-mark.svg`.
- Base carbón `#151D29`, acento de marca ámbar `#E9BF63`, blanco `#FFFFFF`.
- **Conservar** las superficies, tokens, colores de controles y patrones aprobados en el sistema actual. La aplicación no cambia a un tema global amarillo; el ámbar pertenece al icono y a la presentación de marca.
- Modo claro/oscuro, accesibilidad y dispositivos plegables siguen el contrato actual de Workspace OS/Pocket OS.

## Aplicación

- HaibuOS: plataforma principal (web/PWA).
- Workspace OS: experiencia de escritorio y tablet; «HaibuOS Desktop» solo como nombre comercial.
- Pocket OS: experiencia móvil; «HaibuOS Pocket» como nombre comercial.
- HaibuOS Apps: catálogo de módulos opcionales.
- HaibuOS AI: nombre visible del asistente; no cambiar contratos API.

## Límites de este cambio

1. No cambiar nombre del repositorio, nombre de paquetes npm, rutas, IDs DOM, llaves de localStorage, eventos, schemas, permisos ni rutas de despliegue.
2. No alterar las funciones empresariales, la seguridad multiempresa ni la navegación de cinco elementos del dock móvil.
3. Los archivos PNG de iconos se generan mediante `npm run mobile:assets`, a partir de `scripts/generate-mobile-assets.mjs` durante build; revisar que el icono instalado de PWA coincida.
4. Se requiere revisión manual de navegadores, accesibilidad, light/dark, instalaciones previas de PWA, 320–430px y plegables antes de fusionar.
5. El nombre Haibu ya se usa para software de recursos humanos en México. **No se ha verificado la viabilidad registral de HaibuOS**; revisión legal ante IMPI antes de lanzamiento público.

## Rollout

**Fase 1 (este PR):** marca visible en shell, accesos, login, título web y manifest, isotipo SVG y generador de iconos.

**Fase 2:** auditoría visual completa de textos residuales y superficies legadas, páginas secundarias, emails transaccionales y capturas. Cualquier cambio de infraestructura/dominio se gestiona por separado con aprobación.
