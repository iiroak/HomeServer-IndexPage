# Stage 1: Build
FROM node:22-alpine AS build

RUN corepack enable && corepack prepare pnpm@10.10.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile=false

COPY astro.config.mjs tsconfig.json ./
COPY public ./public
COPY src ./src

RUN pnpm run build

# Stage 2: Runtime
FROM node:22-alpine AS runtime

WORKDIR /app

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

ENV PORT=4321
ENV HOST=0.0.0.0

EXPOSE 4321

CMD ["node", "dist/server/entry.mjs"]
