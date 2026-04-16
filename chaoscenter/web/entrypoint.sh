#!/bin/sh
# Entrypoint script for Litmus frontend with dynamic base path configuration
# Signed-off-by: NETIZEN-11 <kumarnitesh121411@gmail.com>

# Get the base path from environment variable, default to "/"
BASE_PATH="${PUBLIC_URL:-/}"

# Normalize base path: ensure it starts with / and doesn't end with / (unless it's just "/")
BASE_PATH=$(echo "$BASE_PATH" | sed 's:/*$::')
if [ -z "$BASE_PATH" ]; then
  BASE_PATH="/"
fi

echo "Configuring Litmus frontend with BASE_PATH: $BASE_PATH"

# Use the template if it exists, otherwise use the default config
NGINX_TEMPLATE="/etc/nginx/nginx.conf.template"
NGINX_CONFIG_FILE="/etc/nginx/nginx.conf"

if [ -f "$NGINX_TEMPLATE" ]; then
  echo "Using template $NGINX_TEMPLATE to generate $NGINX_CONFIG_FILE"
  # Replace BASE_PATH_PLACEHOLDER with actual base path
  sed "s|BASE_PATH_PLACEHOLDER|$BASE_PATH|g" "$NGINX_TEMPLATE" > "$NGINX_CONFIG_FILE"
else
  echo "Template not found, using existing $NGINX_CONFIG_FILE"
fi

echo "Starting nginx with config: $NGINX_CONFIG_FILE"
nginx -c "$NGINX_CONFIG_FILE" -g 'daemon off;'

