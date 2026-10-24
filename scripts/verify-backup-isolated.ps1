#requires -Version 5.1
<#
.SYNOPSIS
  Verifica un .dump PostgreSQL en un contenedor Docker temporal.
.DESCRIPTION
  Nunca utiliza erp-cliente-postgres ni erp_cliente.
  Crea un contenedor SIN red, SIN puertos y SIN volumen persistente.
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\scripts\verify-backup-isolated.ps1 -DumpPath "$env:USERPROFILE\Documents\BusinessOS-Backups\backup.dump"
#>
[CmdletBinding()]
param([Parameter(Mandatory = $true)][string]$DumpPath)
$ErrorActionPreference = "Stop"
$source = (Resolve-Path -LiteralPath $DumpPath -ErrorAction Stop).Path
$item = Get-Item -LiteralPath $source
if ($item.PSIsContainer -or $item.Length -le 0 -or $item.Extension.ToLowerInvariant() -ne ".dump") {
  throw "Se requiere un archivo .dump no vacio."
}
docker version --format '{{.Server.Version}}' | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Docker Desktop no esta disponible." }

$containerName = "businessos-restore-qa-$([Guid]::NewGuid().ToString('N').Substring(0,12))"
$password = [Guid]::NewGuid().ToString("N")
$created = $false
try {
  Write-Host "Inicializando PostgreSQL 17 temporal (sin puertos, red ni volumen persistente)..."
  $identifier = docker run --rm -d --network none --name $containerName -e "POSTGRES_USER=restore_qa" -e "POSTGRES_PASSWORD=$password" -e "POSTGRES_DB=businessos_restore_qa" postgres:17
  if ($LASTEXITCODE -ne 0) { throw "No se pudo iniciar PostgreSQL temporal." }
  $created = $true

  $ready = $false
  for ($i=0; $i -lt 40; $i++) {
    docker exec $containerName pg_isready -U restore_qa -d businessos_restore_qa | Out-Null
    if ($LASTEXITCODE -eq 0) { $ready=$true; break }
    Start-Sleep -Milliseconds 500
  }
  if (-not $ready) { throw "El contenedor PostgreSQL temporal no inicio." }

  docker cp $source "$($containerName):/tmp/backup.dump"
  if ($LASTEXITCODE -ne 0) { throw "No se pudo copiar el respaldo." }
  docker exec $containerName pg_restore --list /tmp/backup.dump | Out-Null
  if ($LASTEXITCODE -ne 0) { throw "El catalogo del respaldo no es valido." }

  Write-Host "Restaurando SOLO en businessos_restore_qa..."
  docker exec -e "PGPASSWORD=$password" $containerName pg_restore -U restore_qa -d businessos_restore_qa --no-owner --no-acl --exit-on-error /tmp/backup.dump
  if ($LASTEXITCODE -ne 0) { throw "La restauracion aislada fallo." }

  $sql="SELECT count(*) FROM pg_tables WHERE schemaname='public';"
  $count=docker exec -e "PGPASSWORD=$password" $containerName psql -U restore_qa -d businessos_restore_qa -At -c $sql
  if ($LASTEXITCODE -ne 0) { throw "No fue posible verificar las tablas restauradas." }
  Write-Host "Tablas restauradas en public: $count"
  if ([int]$count -le 0) { throw "No se encontraron tablas en public." }
  Write-Host "PASS: respaldo restaurable en PostgreSQL 17 sin alterar el ERP existente."
  Write-Host "Este script NO ejecuta migraciones Prisma ni valida datos funcionales."
} finally {
  if ($created) {
    docker rm -f $containerName | Out-Null
    if ($LASTEXITCODE -eq 0) { Write-Host "Contenedor temporal eliminado." }
    else { Write-Warning "Revisa el contenedor temporal $containerName; fallo su eliminacion." }
  }
}
