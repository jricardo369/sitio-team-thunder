# Sitio estático Thunders -> nginx en Docker
# Puerto interno: 80 | Puerto host en EC2: 8081 (8080 ya lo usa el backend Java)
FROM nginx:1.27-alpine

# Config personalizada (SPA fallback, gzip, cache de assets)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Sitio
# NOTA auto-arranque en EC2: la policy de reinicio NO se fija en el Dockerfile,
# se fija al crear el contenedor con --restart unless-stopped (ver deploy.yml)
# + daemon habilitado con `systemctl enable docker` para que sobreviva reboots.
COPY index.html /usr/share/nginx/html/index.html
COPY app.js /usr/share/nginx/html/app.js
COPY disenio.css /usr/share/nginx/html/disenio.css
COPY images /usr/share/nginx/html/images

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null 2>&1 || exit 1
