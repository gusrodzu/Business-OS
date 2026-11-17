# Business OS · Colmena conectada v2 (Home Dashboard)

## Objetivo
Alinear los paneles hexagonales personalizables a una colmena realmente teselada, inspirada en la referencia gráfica del usuario del 26 de octubre de 2026. Se adopta **hexágono de cara plana** (dos lados horizontales) con bordes compartidos, en vez de tarjetas con punta arriba separadas por `grid-gap` y `translateY`.

## Geometría
- Un hexágono regular tiene `alto = ancho × √3 / 2`.
- Entre columnas vecinas, el centro se desplaza `0.75 × ancho` en X y `0.5 × alto` en Y: así comparten un lado completo.
- A partir de nueve celdas (indicadores más botón de agregar), el patrón visible de escritorio es **1–2–3–2–1**, centrado. La composición no depende de una cantidad fija de indicadores.
- Cada botón/indicador se posiciona mediante `apps/web/src/components/honeycombLayout.js`. `ResizeObserver` mide el ancho del **componente real**, no del viewport. Esto es importante cuando la barra derecha reduce el espacio de trabajo.
- El catálogo permite hasta 10 KPIs, por lo que la estructura tiene máximo 11 celdas incluyendo **Agregar indicador**.

## Diseño adaptable
- Contenedor disponible de 680 px o más: agrupación tipo flor/panal centrada.
- Entre 480 y 679 px: tres columnas intercaladas.
- Entre 245 y 479 px: dos columnas compactas intercaladas.
- Inferior a 245 px: una columna para evitar desbordamiento.
- El CSS redimensiona iconos/texto sin perder legibilidad; respeta `prefers-reduced-motion`, contraste de temas, foco de teclado y botones existentes para mover/quitar KPIs.

## Seguridad y persistencia
No se modifican los datos, las llamadas `/dashboard`, los diez indicadores permitidos, ni los permisos, roles, rutas o adaptadores offline. La selección y el orden existentes siguen persistiendo localmente por usuario y empresa.

## QA
- `npm run ui:honeycomb:audit`: personalización y contexto por usuario.
- `npm run ui:honeycomb:layout`: posiciones dentro del contenedor, proporción hexagonal y bordes compartidos para 1–11 celdas, modo compacto/normal y ocho anchos distintos.
- `Smartphone Browser Review`: inspecciona la teselación real en Chrome a 390 y 1440 px, además de seguir comprobando agregar, persistir, reorganizar y quitar indicadores.
- Las pruebas y demás módulos de Business OS se mantienen en los workflows de GitHub.

## Límite operativo
Este cambio queda en `main` solo tras pasar las validaciones. No se debe declarar que está publicado en el dominio mientras Vercel no reporte despliegue Production READY del commit esperado.
