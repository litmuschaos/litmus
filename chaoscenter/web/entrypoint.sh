

sed -i "s|__ENABLE_CDN__|$ENABLE_CDN|" remoteEntry.js

NGINX_CONFIG_FILE="/etc/nginx/nginx.conf"
echo "Using $NGINX_CONFIG_FILE for nginx"
nginx -c $NGINX_CONFIG_FILE -g 'daemon off;'
