# Skill local: business-os-ui-ux

Esta skill pertenece al repositorio Business OS. Codex puede descubrirla dentro de `.agents/skills/business-os-ui-ux/SKILL.md` al trabajar en el proyecto. No requiere un plugin privado ni credenciales adicionales.

## Activación en el equipo local

Después de fusionar el PR de esta skill:

```powershell
cd "C:\Users\gorz1\Desktop\PROYCTO ERP\Business-OS"
git pull origin main
codex
```

Dentro de Codex, solicita:

```text
$business-os-ui-ux Audita el Dashboard de Business OS y mejora el diseño de las cards originales sin introducir hexágonos. Implementa cambios pequeños por PR y verifica CI.
```

Si Codex estaba abierto cuando añadiste la skill, inicia una nueva sesión. Comprueba que el proyecto abierto es el repositorio que contiene `.agents/skills`.

Esta skill no cambia la aplicación por sí sola ni resuelve bloqueos de despliegue: describe el método de implementación y validación que debe seguir Codex.

## Capacidades disponibles en v2

La skill contiene cinco guías internas originales, adaptadas al ERP. Invócala **siempre con el mismo identificador** `$business-os-ui-ux`; Codex elegirá las referencias según el pedido:

| Función | Ejemplo de uso dentro de Codex |
|---|---|
| Dashboard SaaS UI | `$business-os-ui-ux Audita KPIs, tablas, gráficos y filtros del dashboard por rol y empresa` |
| Design System Builder | `$business-os-ui-ux Consolida tokens y CSS compartido de Ventas, Compras, Inventario y Finanzas sin parches !important` |
| Design to Code | `$business-os-ui-ux Implementa esta referencia aprobada en React/CSS Modules, sin sustituir datos reales` |
| Mobile App UI | `$business-os-ui-ux Audita navegación de dos niveles y formularios para web móvil y define qué sería distinto en Expo` |
| Accessibility Audit | `$business-os-ui-ux Revisa contraste, foco, semántica y formularios de Inventario según WCAG 2.2 AA` |

Para cambios integrales: `$business-os-ui-ux Audita y mejora el módulo Ventas aplicando las cinco capacidades, abre un PR y reporta las verificaciones reales.`

Para validar la estructura de esta skill sin editar código de la app: `npm run ui:skill:audit`.

### Alcance

Estas referencias **no instalan** los otros plugins ni crean por sí mismas una aplicación nativa. Se adaptaron criterios generales a las rutas, decisiones UI y riesgos de Business OS. Las cinco capacidades son parte de una sola skill versionada en el repositorio, no cinco skills independientes.
