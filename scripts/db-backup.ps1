param(
  [string]$Container="erp-cliente-postgres",
  [string]$Database="erp_cliente",
  [string]$User="erp_admin",
  [string]$OutputDir=".\backups"
)
$ErrorActionPreference="Stop"
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
$stamp=Get-Date -Format "yyyyMMdd-HHmmss"
$file=Join-Path $OutputDir "buzzbee-$stamp.dump"
$remote="/tmp/buzzbee-$stamp.dump"
try {
  docker exec $Container pg_dump -U $User -d $Database -Fc -f $remote
  if ($LASTEXITCODE -ne 0) { throw "pg_dump falló" }
  docker cp "${Container}:$remote" $file
  if ($LASTEXITCODE -ne 0) { throw "docker cp falló" }
} finally {
  docker exec $Container rm -f $remote 2>$null | Out-Null
}
if(!(Test-Path $file) -or (Get-Item $file).Length -lt 1024){throw "El respaldo no parece válido."}
Write-Host "OK: respaldo creado sin modificar la base de datos: $file" -ForegroundColor Green
