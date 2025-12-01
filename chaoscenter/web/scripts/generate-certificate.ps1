# scripts/generate-certificate.ps1
$ErrorActionPreference = "Stop"

# 1) Require OpenSSL, but don't try to be the system package manager
if (-not (Get-Command openssl -ErrorAction SilentlyContinue)) {
    Write-Error @"
OpenSSL is not installed or not on PATH.

On Windows, install it once using (in an elevated PowerShell):
  winget install -e --id ShiningLight.OpenSSL.Light

Then reopen your terminal and rerun:
  yarn generate-certificate:win
"@
    exit 1
}

# 2) Create certificates directory
New-Item -ItemType Directory -Force -Path "certificates" | Out-Null

# 4) Generate self-signed certificate
Write-Host "Generating localhost SSL certificate..."
openssl req -x509 -newkey rsa:4096 `
  -keyout "certificates\localhost-key.pem" `
  -out "certificates\localhost.pem" `
  -days 365 -nodes `
  -subj "/C=US"

Write-Host "Certificate generation complete."
