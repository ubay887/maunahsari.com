# syntax=docker/dockerfile:1

# Stage order: vendor -> frontend -> production.
# Targets: `production` (default, last stage). One image runs the web, queue and
# scheduler containers; the command decides the role (see docker-compose.yaml).

ARG PHP_BASE_TAG=8.4-fpm-nginx-bookworm-v5.1.1
ARG PHP_CLI_TAG=8.4-cli-bookworm-v5.1.1
ARG NODE_TAG=22.22-bookworm-slim

# ---------------------------------------------------------------------------
# node-runtime: only a source for the Node binary and npm (copied into frontend)
# ---------------------------------------------------------------------------
FROM node:${NODE_TAG} AS node-runtime

# ---------------------------------------------------------------------------
# vendor: production Composer dependencies + optimized autoloader
# ---------------------------------------------------------------------------
FROM serversideup/php:${PHP_CLI_TAG} AS vendor

ENV COMPOSER_CACHE_DIR=/tmp/composer-cache \
    COMPOSER_NO_INTERACTION=1

WORKDIR /var/www/html

COPY --chown=www-data:www-data composer.json composer.lock ./

RUN --mount=type=cache,target=/tmp/composer-cache,uid=33,gid=33 \
    composer install \
        --no-dev \
        --no-scripts \
        --no-autoloader \
        --prefer-dist

COPY --chown=www-data:www-data . .

# Runs the post-autoload-dump hook (package:discover), so bootstrap/cache must exist.
RUN mkdir -p bootstrap/cache \
    && composer dump-autoload --no-dev --optimize --classmap-authoritative

# ---------------------------------------------------------------------------
# frontend: Vite build. The Wayfinder plugin shells out to `php artisan
# wayfinder:generate`, so this stage needs PHP and the app's vendor directory.
# ---------------------------------------------------------------------------
FROM serversideup/php:${PHP_CLI_TAG} AS frontend

USER root
COPY --from=node-runtime /usr/local/bin/node /usr/local/bin/node
COPY --from=node-runtime /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
    && node --version \
    && npm --version
USER www-data

ENV NPM_CONFIG_CACHE=/tmp/npm-cache \
    APP_ENV=production

WORKDIR /var/www/html

COPY --chown=www-data:www-data package.json package-lock.json .npmrc ./

RUN --mount=type=cache,target=/tmp/npm-cache,uid=33,gid=33 \
    npm ci --no-audit --no-fund

COPY --chown=www-data:www-data --from=vendor /var/www/html ./

# Values prefixed with VITE_ are compiled into the bundle, so they are build args.
ARG VITE_APP_NAME="PTQ Ma'unah Sari"
ENV VITE_APP_NAME=${VITE_APP_NAME}

RUN npm run build

# ---------------------------------------------------------------------------
# production: nginx + PHP-FPM runtime, no Composer dev packages, no Node
# ---------------------------------------------------------------------------
FROM serversideup/php:${PHP_BASE_TAG} AS production

# GD is needed by app/Services/AlumniPhotos.php (imagecreatefromstring).
USER root
RUN install-php-extensions gd
USER www-data

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    PHP_OPCACHE_ENABLE=1 \
    HEALTHCHECK_PATH=/up \
    AUTORUN_ENABLED=false

WORKDIR /var/www/html

COPY --chown=www-data:www-data --from=vendor /var/www/html ./
COPY --chown=www-data:www-data --from=frontend /var/www/html/public/build ./public/build

# storage/app is a persistent volume in production (uploads, PSB documents), so
# the directory tree and ownership must already exist in the image to seed it.
RUN mkdir -p \
        storage/app/public \
        storage/app/private \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
    && chmod -R ug+rwX storage bootstrap/cache

EXPOSE 8080
