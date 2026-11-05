# syntax=docker/dockerfile:1

# ----------------------------------------------------------------------------
# Build stage: install dependencies and build the production bundle with pnpm.
# BuildKit cache mounts keep the pnpm content-addressable store warm across
# builds, so repeat/CI builds reinstall dependencies in seconds on a cache hit.
#
# --platform=$BUILDPLATFORM pins this stage to the builder's native architecture.
# The output is architecture-independent static assets, so on a multi-arch build
# the Node/webpack step runs natively instead of under slow, memory-heavy QEMU
# emulation for the non-native target(s).
# ----------------------------------------------------------------------------
FROM --platform=$BUILDPLATFORM node:22-alpine AS build

# pnpm is provided via corepack, pinned to a known-good version for
# reproducible installs across CI and local builds.
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV COREPACK_ENABLE_AUTO_PIN=0
RUN corepack enable && corepack prepare pnpm@10.6.1 --activate

WORKDIR /app

# Use a flat, hoisted node_modules layout (like npm/Yarn). This project predates
# pnpm and relies on "phantom" dependencies (e.g. tslib) being hoisted to the top
# level, so pnpm's default isolated layout breaks the webpack build. This .npmrc
# is generated here rather than committed so that no developer registry
# credentials can ever leak into the repository or the build context.
RUN printf 'node-linker=hoisted\nauto-install-peers=true\n' > .npmrc

# Install dependencies first so this layer is cached unless the manifest or
# lockfile changes. --frozen-lockfile enforces an install that exactly matches
# pnpm-lock.yaml (fails if the lockfile is out of date). --ignore-scripts skips
# lifecycle scripts (husky git hooks, optional native rebuilds) that are neither
# available nor needed inside the image.
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts --store-dir=/pnpm/store

# Build the static assets.
COPY . .
ARG PUBLIC_URL=""
ENV PUBLIC_URL=${PUBLIC_URL}
RUN pnpm run build

# ----------------------------------------------------------------------------
# Runtime stage: serve the prebuilt assets with nginx. Only the compiled
# bundle is copied in, so the final image carries no sources or node_modules.
# ----------------------------------------------------------------------------
FROM registry.access.redhat.com/ubi10/nginx-126:10.1

COPY --from=build /app/dist /opt/chaos
COPY nginx/nginx.conf /etc/nginx/
COPY ./entrypoint.sh /opt

WORKDIR /opt/chaos

USER 0

RUN chown 65534:0 -R /opt/chaos && \
    chown 65534:0 -R /var/log/nginx && \
    chown 65534:0 -R /etc/nginx

USER 65534

EXPOSE 8185

ENTRYPOINT ["sh", "/opt/entrypoint.sh"]
