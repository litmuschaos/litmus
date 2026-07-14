# delete crt and key file
rm *.crt
rm *.key

# Create CA private key and self-signed certificate
# adding -nodes to not encrypt the private key
openssl req -x509 -newkey rsa:4096 -nodes -days 365 -keyout ca.key -out ca.crt -subj "/C=TR/ST=ASIA/L=ISTANBUL/O=DEV/OU=TUTORIAL/CN=*.litmuschaos.io/emailAddress=litmuschaos@gmail.com"

echo "CA's self-signed certificate"
openssl x509 -in ca.crt -noout -text

# Create Web Server private key and CSR
# adding -nodes to not encrypt the private key
openssl req -newkey rsa:4096 -nodes -keyout tls.key -out server-req.pem -subj "/C=TR/ST=ASIA/L=ISTANBUL/O=DEV/OU=BLOG/CN=*.litmuschaos.io/emailAddress=litmuschaos@gmail.com"

# Sign the Web Server Certificate Request (CSR)
openssl x509 -req -in server-req.pem -CA ca.crt -CAkey ca.key -CAcreateserial -out tls.crt -extfile server-ext.conf

echo "Server's signed certificate"
openssl x509 -in tls.crt -noout -text

# Verify certificate
echo "Verifying certificate"
openssl verify -CAfile ca.crt tls.crt





