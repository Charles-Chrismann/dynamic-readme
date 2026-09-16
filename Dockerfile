FROM node:22 AS base

WORKDIR /usr/src/app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install

COPY . .
RUN mkdir config


# Development
FROM base AS dev


# Production
FROM base AS prod

RUN pnpm run build

CMD ["pnpm", "run", "start:prod"]