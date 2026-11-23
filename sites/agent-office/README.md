# Agent Office — sitio descentralizado

Esta oficina **no es una ruta ni una ventana de Business OS**. Tiene HTML, CSS y JavaScript propios y se publica como **Cloudflare Worker independiente** (`name = "business-os-agent-office"`). No importa React, AuthContext, AppShell, PlatformShell, cookies, tokens, ni endpoints internos de Business OS. Abre directamente en la oficina: sin sidebar, escritorio de ERP o panel de Super Admin.

## Origen de datos

- Lee exclusivamente los últimos 40 PRs y últimas 40 ejecuciones de GitHub Actions del repositorio **público** `gusrodzu/Business-OS` mediante GitHub REST API.
- Refresca cada 3 minutos cuando la pestaña está visible. GitHub puede aplicar límites o retrasar eventos; se muestran errores sin fingir estar en vivo.
- Los movimientos representan **señales de GitHub**, nunca ejecución interna de los agentes ChatGPT: CI activo → escribir, workflow en cola → esperar, PR abierto → leer, ejecución completada con éxito/fallo en los últimos cuatro minutos → celebración/alerta, sin actividad confirmada → reposo. Cuando el feed falla se desactivan los movimientos asociados a estados activos.
- Las entregas visuales entre cubículos se dibujan **únicamente** cuando el SHA del PR abierto coincide con `head_sha` de un workflow activo/en cola de otro equipo. Compartir SHA prueba relación con el commit, no una conversación entre agentes. Sin evidencia no aparece entrega.
- No hay flujo WebSocket ni webhooks en esta fase: una segunda fase puede implementar un Worker con receptor de webhooks autenticado y estado persistente para actualizaciones casi instantáneas.
- **No añadir datos privados de automatizaciones, clientes o empresas** a esta página de acceso público. Para esos datos debe configurarse autenticación, acceso privado y controles de autorización de servidor.

## Desarrollo y pruebas

```bash
node --check sites/agent-office/public/app.js
node --check sites/agent-office/public/officeMotion.js
node --test scripts/validate-agent-office-independent.test.mjs scripts/validate-agent-office-motion.test.mjs
# Server local static, sin acceso a Business OS:
cd sites/agent-office/public
python3 -m http.server 8765
```

Abrir `http://localhost:8765`.

## Publicación futura

Requiere aprobación del propietario y configuración de Cloudflare apropiada. Esta rama **no modifica** `wrangler.toml` de Business OS ni sus workflows de despliegue.

```bash
npx wrangler deploy --config sites/agent-office/wrangler.toml
```

Se debe verificar la dirección efectiva del Worker tras desplegar. **No inventar ni anunciar un subdominio como operativo** hasta que Cloudflare lo confirme. El viejo enlace `business-os.gorz12.workers.dev/agent-office` sigue perteneciendo a Business OS y NO es la dirección de este proyecto independiente.

## Despliegue de esta actualización

La nueva página requiere publicar **todos** los archivos HTML, CSS y JS, incluido `officeMotion.js`, en el Worker independiente `business-os-agent-office`. En una publicación mediante API que empaquete los archivos estáticos, añadir `/officeMotion.js` al paquete de recursos; de lo contrario el módulo importado desde `app.js` no cargará. No modificar el Worker `business-os`, ni usar la ruta heredada `/agent-office` del ERP. La implementación y el despliegue son acciones separadas sujetas a aprobación del propietario.

## Experiencia móvil · interfaz de app

- En celulares y pantallas estrechas (hasta 900 px) Agent Office ofrece una interfaz independiente estilo Android: encabezado fijo, resumen compacto y navegación inferior accesible con **Oficina / Actividad / Agentes**.
- Oficina muestra seis cubículos en una cuadrícula de dos columnas; tocar uno abre su ficha dentro de la misma página, sin cargar Business OS ni Super Admin. En Agentes hay un directorio táctil con ilustraciones e indicadores de cada equipo.
- Actividad muestra directamente el registro público de GitHub. La barra inferior tiene zonas táctiles de al menos 48 px, estilos de foco visibles y contempla áreas seguras del sistema operativo. Para escritorio se conserva el diseño completo.
- No es una aplicación Android nativa: es un sitio web adaptable y autónomo. No se instala ni registra servicios en el dispositivo.
- QA: `node --test scripts/validate-agent-office-mobile-app.test.mjs`; verificar después en navegador real Android a 360, 390 y 430 px, además de horizontal 832 × 384, y contraste/zoom 200 %.

## Diseño de personajes v2 · seis estaciones pixel art

El arte fue rediseñado siguiendo la referencia de los seis agentes sentados frente a su laptop: **caritas amigables grandes, fondos pastel, mesa completa, zapatos, ropa y accesorios por especialidad**. En lugar de incrustar una captura estática, `public/agentArtwork.js` construye escenas SVG locales, con capas independientes para el personaje, cabeza, manos, laptop, escritorio, monitor y utilería. Así conservamos escalabilidad en teléfonos y animaciones por estados verificables de GitHub.

| Equipo | Fondo | Accesorios clave |
| --- | --- | --- |
| Frontend | Lila | Diadema, planta, taza |
| Backend | Azul | Servidores, taza de código |
| Ciberseguridad | Menta | Sudadera oscura, escudo y candado |
| QA | Durazno | Gafas de prueba, catarina, lista |
| Director Técnico | Lavanda | Atuendo formal, globo y libros |
| DevOps/SRE | Turquesa | Servidores, nube, lentes |

`drawAgentScene(team)` produce el escenario de cada cubículo; `drawAgentPortrait(team)` genera un retrato de cara para la lista móvil. Ambos utilizan los mismos datos de diseño, sin importaciones del ERP, cookies, dependencias de terceros ni llamadas externas.

- La tarjeta sigue indicando los estados **CI activo / en cola / PR pendiente / en espera**. Las ilustraciones solo se animan cuando `officeMotion.js` confirma evidencia pública.
- Mobile utiliza los mismos SVG y conserva la cuadrícula de dos columnas, controles táctiles y navegación inferior.
- Respeta `prefers-reduced-motion:reduce`, el modo de pestaña en segundo plano y el estado sin señal.
- Pruebas: `node --test scripts/validate-agent-office-character-art.test.mjs` más suites independientes de Agent Office.
- En el despliegue independiente por API hay que incluir **`/agentArtwork.js`** además de `/index.html`, `/styles.css`, `/app.js` y `/officeMotion.js`. Publicar un `app.js` que importa un archivo ausente rompe la vista.

Esta actualización se implementa en un PR separado de #824 (ya fusionado). El servicio principal `business-os` permanece intacto. **No publicar ni fusionar sin aprobación del propietario**.

## Arte 16-bit v2 (actualización de sprites)

El sistema original de seis personajes SVG se refinó sobre la dirección de arte aprobada (16-bit tipo SNES): cuatro tonos de piel, brillos de ojos, cejas, sonrisa por píxeles, sombras y reflejos en cabello y ropa, pantalla y laptop con contorno, tablero decorado y mesa con mayor profundidad. Cada rol conserva sus seis paletas, vestimenta y props específicos. No se sustituyó el sitio por una imagen estática: las capas siguen siendo accesibles desde CSS para gestos basados en CI/PR verificable.

- `data-sprite-style="16-bit-v2"` identifica el nuevo estilo en las seis escenas y retratos móviles.
- `art-head`, `art-eyes`, `art-hair-details`, `art-hands`, `art-laptop`, `art-16bit-props` son capas independientes.
- Gestos por pasos (8–12 cuadros aproximados por segundo): parpadeos decorativos solo en estados permitidos, mirar/leer, teclear y celebrar; pausados cuando la pestaña está oculta y desactivados con `prefers-reduced-motion`.
- No hay llamadas de red añadidas ni cambios en API, seguridad, datos privados ni la estructura standalone de Cloudflare.
- Verificar con `node --test scripts/validate-agent-office-16bit.test.mjs` además de los tests independientes existentes; hacer comprobaciones visuales a 390 × 844 px y escritorio antes de fusionar.

Nota: la hoja 16-bit aprobada se mantiene como referencia gráfica. Los sprites productivos se renderizan en SVG por capas para animación de estado; no se copian píxeles sin estructura como una sola imagen.


## Oficina panorámica · seis programadores de espaldas

La dirección visual aprobada (oficina 16-bit nerd con seis escritorios, programadores mirando sus monitores, plantas, memorabilia retro, café, paisaje nocturno y perro dormido) inspira una **nueva vista panorámica funcional** en el sitio independiente. `public/officePanorama.js` crea un escenario SVG local, con capas decorativas y seis agentes sentados de espaldas; no se depende de rutas, CSS o permisos del ERP.

- Los seis puestos se sitúan en dos filas de tres: Frontend, Backend, Ciberseguridad / QA, Dirección Técnica, DevOps.
- Cada escritorio tiene un botón semitransparente accesible con el **nombre y estado verificado de GitHub**. El fondo jamás muestra estados inventados o palabras de trabajo activas preimpresas. En caso de error del feed el chip dice `Sin datos actuales`.
- Al tocar un puesto en móvil se abre su ficha `Agentes`; en escritorio se desplaza al panel de actividad. Los botones superiores permiten saltar a cada escritorio con desplazamiento horizontal suave; movimiento reducido desactiva el efecto.
- En smartphone el escenario conserva una composición panorámica desplazable mediante gestos, con indicadores superiores compactos, barra inferior nativa estilo Android y una alternativa expandible con las tarjetas individuales originales.
- `officePanorama.js` solo dibuja SVG; no hace peticiones, no lee almacenamiento, no carga archivos externos ni depende de una imagen remota. La referencia aprobada sirve como objetivo de dirección de arte, **no está insertada píxel a píxel**: el escenario funcional es una recreación vectorial para permitir capas, estados y navegación.
- Los movimientos de brazos y cuerpos se aplican solo a estados verificables del feed público de GitHub; se detienen al perder sincronización y con `prefers-reduced-motion`. La actividad interna de las automatizaciones de ChatGPT sigue sin telemetría conectada.
- CI: `node --check sites/agent-office/public/officePanorama.js` y `node --test scripts/validate-agent-office-panorama.test.mjs` además de las suites anteriores.

**Publicación:** requiere aprobación y merge del PR. Cuando se despliegue en Cloudflare hay que incluir `/officePanorama.js` en el paquete del Worker `business-os-agent-office`; no cambiar `business-os`.


## Indicador unificado · Oficina / Agentes / Detalle

El nuevo módulo `public/agentStatusChip.js` construye un **componente DOM compartido, no interactivo**: ícono del equipo, nombre opcional y cápsula de estado. No inserta HTML arbitrario ni hace llamadas de red. El modo se toma exclusivamente de `chooseMotion(team,{fresh:state.fresh})` en `officeMotion.js`; si la sincronización falla, el estado es **Sin señal**, nunca un supuesto trabajo activo.

Se reutiliza en:
- **Oficina panorámica:** indicador flotante oscuro con conector fino; se ancla a la derecha del puesto. El botón invisible se centra respecto al programador y se acorta verticalmente para evitar que el recuadro tape personajes o el monitor de la siguiente fila.
- **Agentes:** pill compacta de estado junto al retrato y nombre del equipo.
- **Tarjetas individuales:** el mismo estado junto al título del agente.
- **Detalle de agente:** cápsula legible sobre la descripción verificable y el enlace al workflow cuando exista.

Paleta semántica: verde para CI en curso o recién aprobado; ámbar para PR pendiente; lavanda para espera o cola; rojo para fallo reciente; gris para ausencia de señal. Se conserva accesibilidad mediante `aria-label` y `role="group"`, botones con nombre accesible, toque y navegación con teclado, así como `prefers-reduced-motion`.

Verificar con `node --test scripts/validate-agent-office-status-chip.test.mjs` además de las pruebas existentes. **Al publicar** el sitio independiente por Cloudflare API, incluir también **`/agentStatusChip.js`** en los archivos servidos junto con `app.js`, `officeMotion.js`, `officePanorama.js`, `agentArtwork.js`, HTML y CSS. El PR por sí mismo no modifica producción ni el Worker del ERP.


## Retratos consistentes · misma vista trasera en todos los módulos

Los seis programadores aprobados se representan **de espaldas** en el panorama, el directorio móvil `Agentes`, las tarjetas opcionales de oficina y el detalle de cada equipo. `officePanorama.js` reutiliza la función interna `station()` para las tres vistas, y expone `drawRearAgentPortrait(team)` y `drawRearAgentScene(team)`. La versión de retrato realiza solamente un recorte más cercano a cabello, audífonos y hombros; el diseño original de cada equipo, sus props, colores y la geometría del cuerpo se mantienen compartidos.

- La lista `Agentes` utiliza un recorte cuadrado nítido con fondos oscuros, marcos de color y el mismo indicador de GitHub que la oficina.
- El detalle presenta un retrato ampliado junto a la cápsula de estado, y las tarjetas individuales muestran la misma estación desde atrás.
- Los dibujos anteriores `agentArtwork.js` se conservan como legado y referencia de regresión, pero **ya no se importan** desde la aplicación publicada.
- No se añaden imágenes remotas, dependencias, cookies, rastreo ni accesos al ERP. El componente no consulta nada; la veracidad de los estados sigue dependiendo de GitHub público.
- CI: `node --test scripts/validate-agent-office-rear-portraits.test.mjs` más el resto de `Agent Office Independent QA`.
- Tras aprobación y fusión, publicar el nuevo `officePanorama.js`, `app.js` y `styles.css` solo en `business-os-agent-office`. El cambio no se despliega por sí solo.
