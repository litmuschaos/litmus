# Create directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "certificates" | Out-Null

# Generate the SSL certificate
openssl req -x509 -newkey rsa:4096 `
  -keyout "certificates\localhost-key.pem" `
  -out "certificates\localhost.pem" `
  -days 365 -nodes `
  -subj "/C=US"
