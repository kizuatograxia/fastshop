# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build

# Production Stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

RUN npm install --only=production
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]
