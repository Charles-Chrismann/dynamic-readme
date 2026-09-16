FROM node:22
WORKDIR /usr/src/app
RUN mkdir config
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install
COPY . .
RUN pnpm run build
CMD pnpm run start:prod
