# ==============================
# generate-certificate.ps1
# Auto-installs OpenSSL (Windows) if missing,
# then generates localhost certificates.
# ==============================

# Exit on error
$ErrorActionPreference = "Stop"

# 1️⃣ Check if OpenSSL is installed
if (-not (Get-Command openssl -ErrorAction SilentlyContinue)) {
    Write-Host "🔍 OpenSSL not found. Installing via Chocolatey..."

    # Check if Chocolatey is installed
    if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Host "🍫 Chocolatey not found. Installing Chocolatey first..."
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    }

    # Install OpenSSL
    choco install openssl.light -y

    # Refresh PATH so this session sees OpenSSL immediately
    $env:Path += ";C:\Program Files\OpenSSL-Win64\bin"

    if (-not (Get-Command openssl -ErrorAction SilentlyContinue)) {
        Write-Error "❌ OpenSSL installation failed or path not recognized. Try reopening PowerShell and re-running."
        exit 1
    }

    Write-Host "✅ OpenSSL installed successfully."
} else {
    Write-Host "✅ OpenSSL already installed."
}

# 2️⃣ Create certificates directory
New-Item -ItemType Directory -Force -Path "certificates" | Out-Null

# 3️⃣ Generate self-signed certificate
Write-Host "🔐 Generating localhost SSL certificate..."
openssl req -x509 -newkey rsa:4096 `
  -keyout "certificates\localhost-key.pem" `
  -out "certificates\localhost.pem" `
  -days 365 -nodes `
  -subj "/C=US"

Write-Host "🎉 Certificate generation complete!"
