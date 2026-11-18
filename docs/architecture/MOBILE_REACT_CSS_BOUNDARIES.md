# Business OS Next — límites React y CSS para evolución móvil

Guía incremental para el [roadmap #73](https://github.com/gusrodzu/Business-OS/issues/73). Fuente de experiencia: [wireframe móvil v2](../ui-ux/BUSINESS_OS_MOBILE_WIREFRAME_V2.md). **No es una autorización para cambiar contratos de negocio ni rediseñar desktop.**

## Responsabilidades por feature

Preferir la estructura existente del módulo. Cuando el tamaño lo justifique:

```text
modules/<area>/
  ui/
    pages/           # composición, rutas y guardias existentes
    components/      # unidades de presentación con consumidores concretos
    hooks/           # estado de interfaz y coordinación de consultas
  services/          # adaptadores de servicios ya existentes, sin cambiar endpoints
```

- **Página:** conecta contexto de empresa, permisos, carga y navegación; no duplica la implementación de tarjetas, listas o formularios.
- **Componente:** props explícitas de datos, estados y callbacks. No importa servicios, no decide permisos y no cambia de tenant por su cuenta.
- **Hook:** extraer únicamente estado/derivaciones que tengan una responsabilidad identificable. Evitar mover operaciones sensibles para «limpiar» JSX.
- **Servicio:** conservar contratos actuales, autenticación, manejo de errores, licencias y transacciones. No trasladar lógica de backend al cliente.
- **Compartidos:** promover a design-system solo después de verificar al menos dos consumidores reales con el mismo comportamiento; no crear wrappers de un solo `div`.

## CSS y tokens

1. Conservar `foundation.css` como entrada global existente y consultar `tokens.css` antes de agregar valores. No introducir nuevas hojas globales en cascada.
2. Cada componente con estilos propios utiliza preferentemente su `*.module.css`. Evitar que un módulo dependa mediante `composes` de clases internas de otra página.
3. Usar primero tokens semánticos existentes para superficie, texto, bordes, foco, espaciado, radio y elevación. No duplicar hexadecimales ni inventar un segundo vocabulario de tokens.
4. Variantes explícitas por props/clases del módulo; evitar selectores profundos, `!important` y cambios masivos de especificidad.
5. Preservar temas claro/oscuro, `:focus-visible`, targets táctiles, safe areas y preferencias de movimiento. No alterar el comportamiento desktop durante la migración.

## Secuencia por PR

1. Leer `main`, PR abiertos y archivos consumidores para evitar extraer una pieza ya trabajada.
2. Elegir **una** responsabilidad con límites claros y un consumidor real.
3. Extraer componente o hook sin cambiar endpoints, roles, permisos, aislamiento multiempresa, operaciones, stock, cobros ni modo demo.
4. Consolidar únicamente las reglas CSS relacionadas con ese componente; no reformatear hojas enteras.
5. Abrir PR pequeño y reversible, describiendo origen, destino, consumidores y contratos preservados.
6. Mantener checks automáticos y protección de rama; si bloquean la integración, dejar el PR abierto. QA visual, accesibilidad, responsive e integración se agrupan al final de los bloques de diseño, no se desactivan checks requeridos.

## Contrato de experiencia móvil

Mantener Home app-first (4/3 columnas según ancho), favoritos por empresa, giros SCIAN, navegación de dos niveles, un único estado activo en bottom dock, tarjetas KPI rectangulares y listas táctiles. Consultar siempre el wireframe v2 antes de extender un patrón a Inventario, Ventas, POS, CRM o Configuración. Los datos y las acciones deben permanecer sujetos al tenant y los permisos actuales.
