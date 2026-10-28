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
