$ErrorActionPreference = 'Stop'
Write-Host "=== BuzzBee ERP v18.2.0 | Production Preflight ===" -ForegroundColor Cyan

$errors = @()
if (-not (Test-Path '.env.production')) { $errors += '.env.production no existe' }
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { $errors += 'Docker no está instalado/disponible' }
if (-not (Test-Path 'apps/api/prisma/migrations/0_init/migration.sql')) { $errors += 'Falta migrations/0_init/migration.sql' }

if (Test-Path '.env.production') {
  $envMap = @{}
  Get-Content '.env.production' | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') { $envMap[$matches[1].Trim()] = $matches[2].Trim() }
  }
  foreach ($key in @('APP_DOMAIN','JWT_SECRET','MFA_ENCRYPTION_KEY','INTEGRATION_ENCRYPTION_KEY','S3_ENDPOINT','S3_BUCKET','S3_ACCESS_KEY_ID','S3_SECRET_ACCESS_KEY')) {
    if (-not $envMap.ContainsKey($key) -or [string]::IsNullOrWhiteSpace($envMap[$key]) -or $envMap[$key] -match 'REEMPLAZAR') { $errors += "$key no está configurado" }
  }
  if ($envMap['JWT_SECRET'].Length -lt 48) { $errors += 'JWT_SECRET debe tener al menos 48 caracteres' }
  if ($envMap['MFA_ENCRYPTION_KEY'].Length -lt 32) { $errors += 'MFA_ENCRYPTION_KEY debe tener al menos 32 caracteres' }
  if ($envMap['INTEGRATION_ENCRYPTION_KEY'].Length -lt 32) { $errors += 'INTEGRATION_ENCRYPTION_KEY debe tener al menos 32 caracteres' }
  if ($envMap['S3_ENDPOINT'] -and -not $envMap['S3_ENDPOINT'].StartsWith('https://')) { $errors += 'S3_ENDPOINT debe usar HTTPS' }
}

if ($errors.Count -gt 0) {
  Write-Host "`nBLOQUEANTES:" -ForegroundColor Red
  $errors | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 1
}

npm run qa:production-ready
if ($LASTEXITCODE -ne 0) { throw 'QA Production Ready falló' }

docker compose --env-file .env.production -f docker-compose.production.yml config | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'docker compose config falló' }
Write-Host "Preflight OK." -ForegroundColor Green
