FROM node:20-alpine

WORKDIR /app

# Instalar dependências nativas necessárias para Baileys
RUN apk add --no-cache python3 make g++

COPY package.json tsconfig.json ./
RUN npm install

COPY src ./src
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
