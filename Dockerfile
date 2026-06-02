FROM node:20-slim

# Prisma precisa do openssl
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia dependências primeiro (melhor cache de layers)
COPY package.json ./
COPY prisma ./prisma/

# npm install já roda postinstall -> prisma generate
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3001
CMD ["npm", "start"]
