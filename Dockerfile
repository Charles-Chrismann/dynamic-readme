FROM node:16

WORKDIR /app

COPY package.json ./

RUN npm install --silent

COPY . .

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "dist/src/main.js"]