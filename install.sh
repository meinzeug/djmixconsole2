#!/bin/bash

# This script manages the deployment of the djmixconsole2.
# It can install, update, deinstall or reinstall the application and its
# dependencies. Existing Let's Encrypt certificates are kept during
# deinstallation so that they can be reused on the next installation.

set -e

# Global package lists so install, reinstall, update and deinstall
# always operate on the same set of dependencies.
# Core system dependencies required for running the application
APT_PACKAGES=(
  nginx
  git
  certbot
  python3-certbot-nginx
  rsync
  curl
)
GLOBAL_NPM_PACKAGES=(vite)

if [ "$(id -u)" -ne 0 ]; then
  echo "Please run as root" >&2
  exit 1
fi

echo "Select mode:"
echo "  (i)nstall"
echo "  (u)pdate"
echo "  (d)einstall"
echo "  (r)einstall"
read -rp "Choice: " MODE
MODE=$(echo "$MODE" | tr '[:upper:]' '[:lower:]')

case "$MODE" in
  i|install)
    MODE="install"
    ;;
  u|update)
    MODE="update"
    ;;
  d|deinstall)
    MODE="deinstall"
    ;;
  r|reinstall)
    MODE="reinstall"
    ;;
  *)
    echo "Invalid mode" >&2
    exit 1
    ;;
esac

case "$MODE" in
  install|reinstall)
    read -rp "Enter your domain (e.g., example.com): " DOMAIN
    CERT_EXIST=no
    if [ -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
      read -rp "Use existing certificate for $DOMAIN? (y/n): " CERT_CHOICE
      CERT_CHOICE=$(echo "$CERT_CHOICE" | tr '[:upper:]' '[:lower:]')
      case "$CERT_CHOICE" in
        y|yes|"" ) CERT_EXIST=yes ;;
        n|no) CERT_EXIST=no ;;
      esac
    fi
    if [ "$CERT_EXIST" = "no" ]; then
      read -rp "Enter your email address for Let's Encrypt: " EMAIL
      read -rp "Enter your name: " NAME
    fi
    ;;
  update|deinstall)
    read -rp "Enter your domain (e.g., example.com): " DOMAIN
    ;;
esac

REPO_URL="https://github.com/meinzeug/djmixconsole2.git"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -d "$SCRIPT_DIR/.git" ] || [ -f "$SCRIPT_DIR/app/package.json" ]; then
  REPO_DIR="$SCRIPT_DIR"
else
  REPO_DIR="/tmp/djmixconsole2"
  if ! command -v git >/dev/null; then
    apt-get update
    apt-get install -y git
  fi
  if [ -d "$REPO_DIR/.git" ]; then
    git -C "$REPO_DIR" pull --ff-only
  else
    git clone --depth 1 "$REPO_URL" "$REPO_DIR"
  fi
fi
TARGET_DIR="/var/www/${DOMAIN}"
APP_SOURCE_DIR="${REPO_DIR}/app"

install_pkg() {
  if ! dpkg-query -W -f='${Status}' "$1" 2>/dev/null | grep -q "install ok installed"; then
    apt-get install -y "$1"
  fi
}

install_node() {
  if ! command -v node >/dev/null || ! node --version | grep -q '^v22'; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
  fi
}

install_global_npm() {
  for pkg in "${GLOBAL_NPM_PACKAGES[@]}"; do
    if ! npm list -g --depth=0 "$pkg" >/dev/null 2>&1; then
      npm install -g "$pkg"
    fi
  done
}

# Ensure rsync is available before attempting to copy files
ensure_rsync() {
  if ! command -v rsync >/dev/null; then
    install_pkg rsync
  fi
}

# Open firewall ports for HTTP and HTTPS access if possible
open_ports() {
  if command -v ufw >/dev/null 2>&1; then
    ufw allow 80 >/dev/null 2>&1 || true
    ufw allow 443 >/dev/null 2>&1 || true
    ufw reload >/dev/null 2>&1 || true
  elif command -v iptables >/dev/null 2>&1; then
    iptables -C INPUT -p tcp --dport 80 -j ACCEPT 2>/dev/null || \
      iptables -I INPUT -p tcp --dport 80 -j ACCEPT
    iptables -C INPUT -p tcp --dport 443 -j ACCEPT 2>/dev/null || \
      iptables -I INPUT -p tcp --dport 443 -j ACCEPT
  else
    echo "Warning: No firewall tool found to open ports 80/443" >&2
  fi
}

install_dependencies() {
  for pkg in "${APT_PACKAGES[@]}"; do
    install_pkg "$pkg"
  done
  install_node
  install_global_npm
}

remove_installed() {
  apt-get remove -y "${APT_PACKAGES[@]}" nodejs >/dev/null 2>&1 || true
  apt-get autoremove -y
  rm -rf "$TARGET_DIR"
  rm -f "/etc/nginx/sites-enabled/${DOMAIN}"
  rm -f "/etc/nginx/sites-available/${DOMAIN}"
  systemctl reload nginx || true
}

do_install() {
  apt-get update
  apt-get upgrade -y

  install_dependencies
  mkdir -p "$TARGET_DIR"
  ensure_rsync
  rsync -a --exclude=".git" "$APP_SOURCE_DIR/" "$TARGET_DIR/"
  cd "$TARGET_DIR"
  npm ci
  # Ensure optional peer dependencies are installed
  npm list immer >/dev/null 2>&1 || npm install immer
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
  open_ports

  if [ "$CERT_EXIST" = "no" ]; then
    certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" \
      --non-interactive --agree-tos -m "$EMAIL" --redirect
  else
    certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" \
      --non-interactive --redirect
  fi

  systemctl reload nginx
  if [ -n "$NAME" ]; then
    echo "Installation complete, $NAME. Visit https://$DOMAIN"
  else
    echo "Installation complete. Visit https://$DOMAIN"
  fi
}

do_update() {
  if [ ! -d "$TARGET_DIR" ]; then
    echo "Target directory $TARGET_DIR does not exist." >&2
    exit 1
  fi
  apt-get update
  apt-get upgrade -y
  install_dependencies
  ensure_rsync
  rsync -a --exclude=".git" "$APP_SOURCE_DIR/" "$TARGET_DIR/"
  cd "$TARGET_DIR"
  npm ci
  # Ensure optional peer dependencies are installed
  npm list immer >/dev/null 2>&1 || npm install immer
  npm run build
  systemctl reload nginx
  echo "Update complete for $DOMAIN"
}

do_deinstall() {
  remove_installed
  echo "Deinstallation complete for $DOMAIN"
}

case "$MODE" in
  install)
    do_install
    ;;
  update)
    do_update
    ;;
  deinstall)
    do_deinstall
    ;;
  reinstall)
    remove_installed
    do_install
    ;;
esac

