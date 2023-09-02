FROM node:16-alpine

WORKDIR /app

COPY package.json ./

RUN npm install --silent

COPY . .

RUN npm run build

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "dist/src/main.js"]