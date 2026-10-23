import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';

// Tests the exact parser contract used by both Data Hub APIs. No DB, HTTP or secrets.
assert.equal(XLSX.version,'0.20.3','Data Hub must use the security-patched SheetJS release');
let assertions=1;
for(const bookType of ['xlsx','biff8','csv']){
  const wb=XLSX.utils.book_new();
  const ws=XLSX.utils.aoa_to_sheet([
    ['Código','Razón social','Precio','Fecha'],
    ['MN-001','MotorNorte',149.50,'2026-10-23'],
    ['MN-002','Refacciones del Norte',0,'2026-10-24'],
  ]);
  XLSX.utils.book_append_sheet(wb,ws,'Proveedores');
  const buf=XLSX.write(wb,{bookType,type:'buffer'});
  const parsed=XLSX.read(buf,{type:'buffer',cellDates:true,sheetRows:5002});
  const sheet=parsed.Sheets[parsed.SheetNames[0]];
  const rows=XLSX.utils.sheet_to_json(sheet,{defval:'',raw:true});
  assert.equal(rows.length,2,bookType+' should preserve both rows');
  assert.equal(rows[0]['Código'],'MN-001',bookType+' should preserve the mapped header');
  assert.equal(rows[1]['Razón social'],'Refacciones del Norte',bookType+' should preserve text');
  assert.equal(Number(rows[0].Precio),149.5,bookType+' should preserve numeric values');
  assertions+=4;
}
const many=XLSX.utils.aoa_to_sheet([
  ['sku'],...Array.from({length:5002},(_,i)=>['SKU-'+i]),
]);
const limitBook=XLSX.utils.book_new();
XLSX.utils.book_append_sheet(limitBook,many,'Limite');
const result=XLSX.read(XLSX.write(limitBook,{bookType:'xlsx',type:'buffer'}),{
  type:'buffer',cellDates:true,sheetRows:5002,
});
const limitedRows=XLSX.utils.sheet_to_json(result.Sheets.Limite,{defval:'',raw:true});
assert.ok(limitedRows.length>5000,'Files beyond 5000 rows must be rejected by the existing Data Hub validation');
assert.ok(limitedRows.length<=5001,'Never parse beyond header + 5001 rows in a sheet');
assert.equal(XLSX.SSF.parse_date_code(45292)?.y,2024,'Excel numeric dates must be supported');
assert.equal(Object.prototype.polluted,undefined,'Parsing must not alter Object.prototype');
assertions+=4;
console.log('PASS: Data Hub XLSX, legacy XLS, CSV, row limit and date parsing ('+assertions+' assertions)');
