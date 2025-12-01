# scripts/generate-certificate.ps1

$ErrorActionPreference = "Stop"

# 1) Check if OpenSSL is installed
if (-not (Get-Command openssl -ErrorAction SilentlyContinue)) {
    Write-Host "OpenSSL not found. Installing via Chocolatey..."

    # 1a) Check if Chocolatey is installed
    if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Host "Chocolatey not found. Installing Chocolatey first..."
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    }

    # 1b) Install OpenSSL
    choco install openssl.light -y

    # 1c) Make sure current session can see it
    $possiblePath = "C:\Program Files\OpenSSL-Win64\bin"
    if (Test-Path $possiblePath) {
        $env:Path += ";$possiblePath"
    }

    if (-not (Get-Command openssl -ErrorAction SilentlyContinue)) {
        Write-Error "OpenSSL installation failed or is still not in PATH. Close this window, reopen PowerShell, and try again."
        exit 1
    }

    Write-Host "OpenSSL installed successfully."
}

# 2) Create certificates directory
New-Item -ItemType Directory -Force -Path "certificates" | Out-Null

# 3) Generate self-signed certificate
Write-Host "Generating localhost SSL certificate..."
openssl req -x509 -newkey rsa:4096 `
  -keyout "certificates\localhost-key.pem" `
  -out "certificates\localhost.pem" `
  -days 365 -nodes `
  -subj "/C=US"

Write-Host "Certificate generation complete."
