# Agent Office — sitio descentralizado

Esta oficina **no es una ruta ni una ventana de Business OS**. Tiene HTML, CSS y JavaScript propios y se publica como **Cloudflare Worker independiente** (`name = "business-os-agent-office"`). No importa React, AuthContext, AppShell, PlatformShell, cookies, tokens, ni endpoints internos de Business OS. Abre directamente en la oficina: sin sidebar, escritorio de ERP o panel de Super Admin.

## Origen de datos

- Lee exclusivamente los últimos 40 PRs y últimas 40 ejecuciones de GitHub Actions del repositorio **público** `gusrodzu/Business-OS` mediante GitHub REST API.
- Refresca cada 3 minutos cuando la pestaña está visible. GitHub puede aplicar límites o retrasar eventos; se muestran errores sin fingir estar en vivo.
- Un PR abierto significa revisión pendiente. Solo un **workflow GitHub en progreso** activa la animación de un personaje. No se afirma conocer la ejecución interna de los agentes de ChatGPT.
- No hay flujo WebSocket ni webhooks en esta fase: una segunda fase puede implementar un Worker con receptor de webhooks autenticado y estado persistente para actualizaciones casi instantáneas.
- **No añadir datos privados de automatizaciones, clientes o empresas** a esta página de acceso público. Para esos datos debe configurarse autenticación, acceso privado y controles de autorización de servidor.

## Desarrollo y pruebas

```bash
node --check sites/agent-office/public/app.js
node --test scripts/validate-agent-office-independent.test.mjs
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
