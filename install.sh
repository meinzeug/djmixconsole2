#!/bin/bash

# This script sets up nginx with Let's Encrypt and deploys the djmixconsole.
# It supports an install mode for fresh setup and an update mode for pulling
# the latest git repository and rebuilding the site. Required packages are
# only installed if missing.

set -e

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run as root" >&2
  exit 1
fi

read -rp "Choose mode (install/update): " MODE
MODE=$(echo "$MODE" | tr '[:upper:]' '[:lower:]')

case "$MODE" in
  install)
    read -rp "Enter your domain (e.g., example.com): " DOMAIN
    read -rp "Enter your email address for Let's Encrypt: " EMAIL
    read -rp "Enter your name: " NAME
    ;;
  update)
    read -rp "Enter your domain (e.g., example.com): " DOMAIN
    ;;
  *)
    echo "Invalid mode" >&2
    exit 1
    ;;
esac

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET_DIR="/var/www/${DOMAIN}"

install_pkg() {
  dpkg -s "$1" >/dev/null 2>&1 || apt-get install -y "$1"
}

install_node() {
  if ! command -v node >/dev/null || ! node --version | grep -q '^v22'; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
  fi
}

install_vite() {
  if ! command -v vite >/dev/null; then
    npm install -g vite
  fi
}

if [ "$MODE" = "install" ]; then
  apt-get update
  apt-get upgrade -y

  install_pkg nginx
  install_pkg git
  install_pkg certbot
  install_pkg python3-certbot-nginx

  install_node
  install_vite

  mkdir -p "$TARGET_DIR"
  rsync -a --exclude=".git" "$REPO_DIR/" "$TARGET_DIR/"
  cd "$TARGET_DIR"
  npm install
  npm run build

  NGINX_CONF="/etc/nginx/sites-available/${DOMAIN}"
  cat > "$NGINX_CONF" <<NGINX
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root $TARGET_DIR/dist;
    index index.html;
    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
NGINX

  ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/${DOMAIN}"
  rm -f /etc/nginx/sites-enabled/default

  systemctl reload nginx

  if [ ! -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" \
      --non-interactive --agree-tos -m "$EMAIL" --redirect
  fi

  systemctl reload nginx
  echo "Installation complete, $NAME. Visit https://$DOMAIN"
else
  if [ ! -d "$TARGET_DIR" ]; then
    echo "Target directory $TARGET_DIR does not exist." >&2
    exit 1
  fi
  rsync -a --exclude=".git" "$REPO_DIR/" "$TARGET_DIR/"
  cd "$TARGET_DIR"
  npm install
  npm run build
  systemctl reload nginx
  echo "Update complete for $DOMAIN"
fi
