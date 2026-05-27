# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

# 生产阶段
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# 安装 Prisma 所需的 OpenSSL
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY ecosystem.config.js ./

EXPOSE 3000

CMD ["node", "dist/index.js"]
