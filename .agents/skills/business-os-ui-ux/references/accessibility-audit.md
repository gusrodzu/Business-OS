# Capacidad 5 — Accessibility Audit · WCAG 2.2 AA aplicado a Business OS

## Activación
Auditoría explícita de WCAG, teclado, lectores de pantalla, contraste, modales, formularios, zoom, gestos o revisión general de un dashboard/módulo.

## Criterios de revisión
1. **Color y contraste**: medir texto normal a 4.5:1; texto grande a 3:1; indicadores visuales de controles y límites relevantes a 3:1. No afirmar conformidad por inspeccionar variables sin renderizar.
2. **No sólo color**: estados de stock, pagos, aprobaciones, éxito/error y gráficas se comunican con texto o patrón/ícono además del color.
3. **Teclado**: recorrer secuencia de Tab/Shift+Tab; foco visible y no oculto por header/drawer; Enter/Espacio donde corresponde; Escape en diálogos; restaurar foco al disparador y mantener foco dentro de modal cuando esté abierto.
4. **Semántica y lector de pantalla**: jerarquía H1/H2 correcta, `aria-label` en icon buttons, `aria-expanded` en explorador, tablas con encabezados, `role=dialog`/`aria-modal` correctos, nombres/roles/valores accesibles.
5. **Formularios**: label persistente asociada, errores específicos vinculados al campo (`aria-describedby`), estado `aria-invalid` cuando procede, instrucciones claras y confirmación de guardado.
6. **Tamaño de objetivos**: WCAG 2.2 AA 2.5.8 establece mínimo **24 × 24 CSS px o excepciones de separación/equivalente**; objetivo de producto ~44 × 44 CSS px, con recomendaciones nativas propias (44pt/48dp). Evitar describir 44 como obligación universal WCAG.
7. **Zoom/reflow**: zoom 200% de texto y reflow de contenido sin pérdida significativa; a 400% de zoom / viewport efectivo de 320 CSS px, verificar ausencia de scroll bidimensional injustificado (excepto contenidos intrínsecamente 2D, como tablas de datos).
8. **Movimiento**: respetar `prefers-reduced-motion`, evitar parpadeo y ofrecer alternativas al drag & drop o gestos complejos.
9. **Notificaciones y estados**: anunciar errores/resultados importantes sin spam de `aria-live`; no robar foco, conservar contexto ante refrescos y cambios de empresa.
10. **Offline/roles**: mensajes de acceso denegado y conectividad accesibles sin filtrar información de otros tenants.

## Protocolo de auditoría
- Inventariar ruta, rol, tema, viewport y tarea; realizar inspección estática *y* prueba con Chrome real.
- Recorrer teclado y foco en Inicio, menú de dos niveles, tabla, formularios, personalizador y modal.
- Medir contraste en light/dark, imágenes/iconos y estados seleccionados/deshabilitados.
- Revisar lector de pantalla (NVDA/VoiceOver/TalkBack) cuando el entorno lo permita; si no se probó, marcar pendiente y no declarar WCAG AA completo.
- Registrar cada hallazgo como: **pantalla | criterio WCAG | severidad P0/P1/P2 | evidencia | corrección | prueba de aceptación**.
- No cambiar roles o permisos para resolver una accesibilidad visual; accesibilidad nunca implica mostrar recursos no autorizados.

## Entregable
Matriz de hallazgos priorizados, cambios por PR y resultados diferenciados: PASS, FAIL, no ejecutado. En particular, registrar la prueba de retorno de foco de NAV-02 y los efectos en smartphone.
