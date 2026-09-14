$ErrorActionPreference = 'Stop'

function New-RandomSecret([int]$Bytes = 48) {
  $buffer = New-Object byte[] $Bytes
  [System.Security.Cryptography.RandomNumberGenerator]::Fill($buffer)
  return [Convert]::ToBase64String($buffer).TrimEnd('=').Replace('+','-').Replace('/','_')
}

Write-Host "BuzzBee ERP v18.3.0 - Preparacion Cloud" -ForegroundColor Cyan
Write-Host "Este script NO crea cuentas ni publica secretos; genera una plantilla local para copiar a Render/Vercel." -ForegroundColor DarkGray

$domain = Read-Host "Dominio raiz (ej. buzzbee.mx)"
if ([string]::IsNullOrWhiteSpace($domain)) { throw 'El dominio es requerido.' }
$domain = $domain.Trim().ToLower().Replace('https://','').Replace('http://','').TrimEnd('/')
$appUrl = "https://app.$domain"
$apiUrl = "https://api.$domain"

$jwt = New-RandomSecret 64
$mfa = New-RandomSecret 48
$integration = New-RandomSecret 48

$content = @"
# Generado localmente. NO COMMIT.
# Vercel
VITE_API_URL=$apiUrl/api
VITE_PRODUCT_PROFILE=buzzbee

# Render
NODE_ENV=production
HOST=0.0.0.0
CLIENT_URL=$appUrl
TRUST_PROXY=1
DATABASE_URL=PEGAR_URL_POOLED_DE_NEON
JWT_SECRET=$jwt
MFA_ENCRYPTION_KEY=$mfa
INTEGRATION_ENCRYPTION_KEY=$integration
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax
COOKIE_DOMAIN=
ALLOW_LEGACY_BEARER_AUTH=false
PRIVATE_STORAGE_DRIVER=s3
S3_ENDPOINT=PEGAR_ENDPOINT_R2
S3_BUCKET=buzzbee-private
S3_REGION=auto
S3_ACCESS_KEY_ID=PEGAR_ACCESS_KEY_R2
S3_SECRET_ACCESS_KEY=PEGAR_SECRET_KEY_R2
ALLOW_LOCAL_PRIVATE_STORAGE=false
ALLOW_PUBLIC_LOCAL_UPLOADS=false
OPENAI_API_KEY=
BUZZBEE_AI_MODEL=gpt-5-mini

# Smoke test
BUZZBEE_WEB_URL=$appUrl
BUZZBEE_API_URL=$apiUrl
"@

$out = Join-Path $PSScriptRoot '.env.cloud.local'
Set-Content -Path $out -Value $content -Encoding UTF8
Write-Host "Creado: $out" -ForegroundColor Green
Write-Host "No subas este archivo a Git. Copia cada valor secreto directamente al dashboard correspondiente." -ForegroundColor Yellow
