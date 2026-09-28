# Stage 1: Build
FROM node:22-alpine AS build

RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY astro.config.mjs tsconfig.json ./
COPY public ./public
COPY src ./src

RUN pnpm run build

# Stage 1b: dependencias de producción solamente (sin devDependencies,
# que en el runtime anterior se copiaban completas — @astrojs/check y
# typescript no hacen falta para servir la app).
RUN pnpm install --frozen-lockfile --prod

# Stage 2: Runtime
FROM node:22-alpine AS runtime

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
COPY --from=build /app/src/db/schema.sql ./src/db/schema.sql
COPY --from=build /app/src/db/migrate.mjs ./src/db/migrate.mjs
COPY --from=build /app/src/db/seed.mjs ./src/db/seed.mjs

ENV PORT=4321
ENV HOST=0.0.0.0
ENV NODE_ENV=production

USER node

EXPOSE $PORT

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:$PORT/ || exit 1

CMD ["node", "dist/server/entry.mjs"]
