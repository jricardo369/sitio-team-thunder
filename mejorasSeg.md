# Mejoras de Seguridad Pre-Producción — sitio-team-thunder

> Alcance: Nivel 2 / Recomendado — CSP en enforce + mover JS inline, SIN vendorizar Tailwind.
> Fecha: 2026-10-03 (actualizado: Paso 2 + auto-arranque ya implementados)
> Stack: sitio estático + `nginx:1.27-alpine` en Docker (host `8081`) + deploy SSH a EC2 (`deploy.yml`).

## 0. Estado actual

### ✅ Ya implementado (2026-10-03)
- **JS externo:** `app.js` creado, `index.html` sin `onclick`/`onerror`/`onkeydown` inline (15 cards con `data-index`, binding por `addEventListener`, `heroImg` y `modalClose` por JS).
- **CDN pineado:** Tailwind fijado a `@4.1.12` + `meta referrer`.
- **Muro endurecido:** `getLikes()` con `try/catch`, `rating` clamp 1-5, `id` anti-colisión, throttle 30s, honeypot `fanWebsite`.
- **Auto-arranque EC2:** `deploy.yml` con `systemctl enable --now docker` + `--restart unless-stopped` + `docker update --restart unless-stopped`; `Dockerfile` con `COPY app.js` y nota de restart policy.

### ⚠️ Pendiente (lo que queda en este archivo)
- HTTP plano sin TLS (puerto 8081 expuesto).
- `nginx.conf` solo tiene 2 headers (`X-Content-Type-Options` + `X-Frame-Options`).
- Contenedor corre como `root`, filesystem escribible, imagen sin digest.
- CI con acción por tag mutable, sin `concurrency`/`permissions`, sin escaneo ni check de headers, `EC2_PATH` sin validar.

## 1. Paso 0 — TLS / Infra (bloqueante, fuera del repo)

**Problema:** `listen 80` y mapeo `8081:80` en HTTP. Sin esto HSTS/CSP pierden sentido y navegadores marcan "no seguro".

**Plan:**
1. Conseguir dominio (ej. `thunders.ejemplo.mx`) + cert ACM (si ALB/CloudFront) o Certbot (si EC2 directo).
2. Opción recomendada AWS: ALB `:443` → target `:8081`. Security Group del EC2 solo acepta tráfico del ALB, no `0.0.0.0/8081`.
3. Solo tras verificar `https://dominio/` con `200`, activar HSTS en nginx.
4. Cerrar puerto 8081 público si queda detrás del LB.

**Verificación:**
```bash
curl -I https://TU-DOMINIO/
# debe dar 200 + strict-transport-security (tras activar HSTS)
```

> Si no hay dominio/LB aún, dejar HSTS comentado y desplegar resto con CSP en `Report-Only` primero.

## 2. Paso 1 — `nginx.conf` (headers + defensa en profundidad)

**Estado actual (`nginx.conf:26-27`):** solo `nosniff` + `SAMEORIGIN`.

**Aplicar:**
```nginx
server_tokens off;

add_header X-Content-Type-Options nosniff always;
add_header X-Frame-Options SAMEORIGIN always;
add_header Referrer-Policy strict-origin-when-cross-origin always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
add_header Cross-Origin-Opener-Policy same-origin always;
add_header Cross-Origin-Resource-Policy same-origin always;
# HSTS — descomentar SOLO con HTTPS verificado:
# add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# CSP compatible con Tailwind browser@4.1.12 + Google Fonts + app.js externo:
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'" always;

# Bloquear dotfiles (.git, .env, etc.)
location ~ /\. { deny all; access_log off; log_not_found off; }

# Rate-limit básico anti-scrape
limit_req_zone $binary_remote_addr zone=wall:10m rate=10r/s;
limit_req zone=wall burst=20 nodelay;
limit_conn_zone $binary_remote_addr zone=addr:10m;
limit_conn addr 20;

# Solo GET/HEAD en sitio estático
# (poner dentro de server{})
# if ($request_method !~ ^(GET|HEAD)$ ) { return 405; }
```

**Notas:**
- `style-src 'unsafe-inline'` se mantiene a propósito: Tailwind browser inyecta estilos en runtime. Quitarlo rompería el sitio. Eliminarlo exige vendorizar Tailwind (nivel 3, fuera de alcance).
- `add_header ... always` se pierde en `location = /healthz` con `return` — duplicar headers ahí o mover a nivel http.
- Estrategia CSP: desplegar 24h en `Content-Security-Policy-Report-Only`, revisar consola, luego pasar a `enforce`.

**Verificación:**
```bash
curl -I http://127.0.0.1:8081/ | grep -i "content-security\|x-frame\|referrer\|permissions"
curl -I http://127.0.0.1:8081/.git/config # debe dar 403
```

## 3. Paso 2 — `Dockerfile` endurecido (queda pendiente lo non-root)

**Problemas restantes:** corre como `root`, FS escribible, `FROM nginx:1.27-alpine` sin digest, `EXPOSE 80` como root.

**Aplicar:**
```dockerfile
FROM nginx:1.27.3-alpine@sha256:<digest-fijado>
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html app.js /usr/share/nginx/html/
COPY images /usr/share/nginx/html/images
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/run
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null 2>&1 || exit 1
```

Y en `deploy.yml` (`docker run`, adicional a la policy ya existente):
```
--read-only --cap-drop ALL --security-opt no-new-privileges:true --tmpfs /var/cache/nginx --tmpfs /var/run
```

**Nota intencional:** al correr como `USER nginx` no puede bindear `80` → cambiar `nginx.conf` a `listen 8080` + mapear `-p 8081:8080`.

**Obtener digest:**
```bash
docker buildx imagetools inspect nginx:1.27.3-alpine --format '{{json .Manifest}}' | head -c 500
```

## 4. Paso 3 — `.github/workflows/deploy.yml` (queda pendiente pin/scan)

**Ya hecho:** auto-arranque (`systemctl enable docker` + `--restart unless-stopped` + `docker update`).

**Falta aplicar:**
1. Pinar acción por SHA:
   ```yaml
   - uses: appleboy/ssh-action@<sha-40> # v1.0.3
   ```
2. Arriba del workflow:
   ```yaml
   concurrency: { group: prod-thunders, cancel-in-progress: false }
   permissions: { contents: read }
   ```
3. Nuevo job `scan` antes de `deploy`: `hadolint` + `trivy fs --severity HIGH,CRITICAL`.
4. Post-deploy añadir:
   ```bash
   curl -fsS http://127.0.0.1:8081/healthz
   curl -sI http://127.0.0.1:8081/ | grep -i "content-security-policy\|x-frame-options"
   ```
5. Validar `EC2_PATH` en script remoto:
   ```bash
   case "$DEPLOY_DIR" in $HOME/*) ;; *) echo "path no permitido"; exit 1;; esac
   ```

**P2 (fuera de este sprint):** migrar a OIDC o deploy-key solo-lectura + `environment: production` con aprobador + backup de imagen previa para rollback.

## 5. Orden de ejecución restante

1. TLS + SG (infra) → 2. `nginx.conf` en Report-Only → 3. CSP a enforce → 4. Dockerfile non-root (cambia a 8080) → 5. CI pin+scan → 6. verificación final.

**Verificación final:**
```bash
curl -I http://127.0.0.1:8081/
curl -I http://127.0.0.1:8081/.git/config
docker ps --filter name=thunders
trivy image thunders:latest --severity HIGH,CRITICAL
# + Lighthouse + prueba manual muro/modal
```

## 6. Explícitamente fuera de alcance (nivel 3)

- Vendorizar Tailwind (eliminar CDN y `unsafe-inline` en `style-src`).
- WAF completo / CloudFront + OAC.
- Backend para muro (CSRF/rate-limit server-side, moderación, captcha).
- Migración SSH → OIDC.
