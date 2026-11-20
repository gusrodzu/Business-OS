import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const dock=readFileSync(new URL('../apps/web/src/layout/os/OSDock.jsx',import.meta.url),'utf8');
test('dock context menu distinguishes active, background and minimized windows',()=>{
 assert.match(dock,/const menuIsForeground=Boolean\(menuWindow&&!menuWindow\.minimized&&activeWindowKey===menuWindow\.key\)/);
 assert.match(dock,/!menuIsForeground \? <button type="button" role="menuitem"/);
 assert.match(dock,/menuWindow\.minimized\?'Restaurar ventana':'Mostrar ventana'/);
 assert.doesNotMatch(dock,/\?'Ventana activa'/);
 assert.match(dock,/!menuWindow\.minimized \? <button type="button" role="menuitem"/);
 assert.match(dock,/Cerrar ventana/);
 assert.doesNotMatch(dock,/Forzar cierre/);
 assert.match(dock,/onForceCloseWindow\?\.\(menu\.key\)/);
});
