FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate

ENV NODE_ENV=production
EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push && node src/index.js"]
