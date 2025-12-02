$ErrorActionPreference = "Stop"

# Check if OpenSSL is installed else install it
if (-not (Get-Command openssl -ErrorAction SilentlyContinue)) {
    Write-Host "OpenSSL not found. Installing via winget..." -ForegroundColor Yellow

    try {
        if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
            Write-Error "winget not found. Please install winget manually from Microsoft Store."
            exit 1
        }

        winget install -e --id ShiningLight.OpenSSL.Light --accept-package-agreements --accept-source-agreements -h

        Write-Host "OpenSSL installed successfully. Please restart your terminal if needed." -ForegroundColor Green
    }
    catch {
        Write-Error "Failed to install OpenSSL automatically. Please install manually using:
  winget install -e --id ShiningLight.OpenSSL.Light"
        exit 1
    }
}

New-Item -ItemType Directory -Force -Path "certificates" | Out-Null

Write-Host "Generating localhost SSL certificate..."
openssl req -x509 -newkey rsa:4096 `
  -keyout "certificates\localhost-key.pem" `
  -out "certificates\localhost.pem" `
  -days 365 -nodes `
  -subj "/C=US"
