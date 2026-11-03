FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .

RUN node db/seed.js

EXPOSE 3000

CMD ["node", "server.js"]
