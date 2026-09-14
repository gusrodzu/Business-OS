$ErrorActionPreference = 'Stop'

function New-HexSecret([int]$Bytes = 32) {
  $buffer = New-Object byte[] $Bytes
  [System.Security.Cryptography.RandomNumberGenerator]::Fill($buffer)
  return ([System.BitConverter]::ToString($buffer)).Replace('-', '').ToLowerInvariant()
}

Write-Host "=== BuzzBee ERP v18.2.0 | Preparar PRODUCCION ===" -ForegroundColor Cyan
Write-Host "Genera .env.production. Nunca subas ese archivo a Git." -ForegroundColor Yellow

$domain = Read-Host "Dominio (ej. app.buzzbee.mx, sin https://)"
if ([string]::IsNullOrWhiteSpace($domain) -or $domain -match '^https?://') { throw "Escribe sólo el dominio" }

$s3Endpoint = Read-Host "S3/R2 endpoint (https://...)"
$s3Bucket = Read-Host "Bucket privado"
$s3Access = Read-Host "S3 Access Key ID"
$s3SecretSecure = Read-Host "S3 Secret Access Key" -AsSecureString
$s3Secret = [System.Net.NetworkCredential]::new('', $s3SecretSecure).Password
if (-not $s3Endpoint.StartsWith('https://')) { throw 'S3_ENDPOINT debe usar https://' }
if ([string]::IsNullOrWhiteSpace($s3Bucket) -or [string]::IsNullOrWhiteSpace($s3Access) -or [string]::IsNullOrWhiteSpace($s3Secret)) { throw 'Faltan credenciales S3/R2' }

$content = @"
APP_DOMAIN=$domain
POSTGRES_USER=buzzbee_prod
POSTGRES_PASSWORD=$(New-HexSecret 24)
POSTGRES_DB=buzzbee_prod
JWT_SECRET=$(New-HexSecret 48)
MFA_ENCRYPTION_KEY=$(New-HexSecret 32)
INTEGRATION_ENCRYPTION_KEY=$(New-HexSecret 32)
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
COOKIE_DOMAIN=
ALLOW_LEGACY_BEARER_AUTH=false
PRIVATE_STORAGE_DRIVER=s3
S3_ENDPOINT=$s3Endpoint
S3_BUCKET=$s3Bucket
S3_REGION=auto
S3_ACCESS_KEY_ID=$s3Access
S3_SECRET_ACCESS_KEY=$s3Secret
S3_SESSION_TOKEN=
ALLOW_LOCAL_PRIVATE_STORAGE=false
ALLOW_PUBLIC_LOCAL_UPLOADS=false
OPENAI_API_KEY=
BUZZBEE_AI_MODEL=gpt-5-mini
"@

Set-Content -Path '.env.production' -Value $content -Encoding UTF8
Write-Host "`n.env.production creado. Protégelo como secreto." -ForegroundColor Green
Write-Host "Siguiente: .\PRODUCTION-PREFLIGHT.ps1" -ForegroundColor Cyan
