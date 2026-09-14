param(
  [Parameter(Mandatory=$true)][string]$BackupFile,
  [string]$Container="erp-cliente-postgres",
  [string]$User="erp_admin",
  [string]$VerifyDatabase="buzzbee_restore_verify"
)
$ErrorActionPreference="Stop"
if(!(Test-Path $BackupFile)){throw "No existe el archivo."}
$exists=docker exec $Container psql -U $User -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$VerifyDatabase'"
if($LASTEXITCODE -ne 0){throw "No fue posible consultar PostgreSQL"}
if($exists.Trim() -eq "1"){throw "La base de verificación ya existe. No se sobrescribirá."}
$remote="/tmp/buzzbee-restore-$([guid]::NewGuid().ToString('N')).dump"
try {
  docker cp $BackupFile "${Container}:$remote"
  if($LASTEXITCODE -ne 0){throw "docker cp falló"}
  docker exec $Container createdb -U $User $VerifyDatabase
  if($LASTEXITCODE -ne 0){throw "createdb falló"}
  docker exec $Container pg_restore -U $User -d $VerifyDatabase --no-owner --no-privileges $remote
  if($LASTEXITCODE -ne 0){throw "pg_restore falló"}
  docker exec $Container psql -U $User -d $VerifyDatabase -c "SELECT current_database(), now();"
  if($LASTEXITCODE -ne 0){throw "La verificación SQL falló"}
} finally {
  docker exec $Container rm -f $remote 2>$null | Out-Null
}
Write-Host "OK: restore verificado en base aislada. No se tocó la base productiva." -ForegroundColor Green
