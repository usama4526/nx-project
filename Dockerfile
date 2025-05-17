# ┌─────────────────────────────┐
# │ 1) Install & Build Stage   │
# └─────────────────────────────┘
FROM node:20-alpine AS builder

RUN apk add --no-cache git \
 && npm install -g pnpm

WORKDIR /app

# copy manifests & lockfile
COPY package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json /apps/root/project.json ./
COPY tsconfig.* ./

RUN pnpm install --frozen-lockfile

# copy your source
COPY libs/ libs/
COPY apps/ apps/
COPY tools/ tools/

# build browser + SSR
RUN pnpm nx build root --configuration=production \
 && pnpm nx run root:server:production

# ┌─────────────────────────────┐
# │ 2) Runtime / Serve Stage   │
# └─────────────────────────────┘
FROM node:20-alpine AS runner

RUN npm install -g pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
ENV HUSKY_SKIP_INSTALL=1
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist/apps/root/browser ./dist/browser
COPY --from=builder /app/dist/apps/root/server ./dist/server

EXPOSE 4000
CMD ["node", "dist/server/server.mjs"]
