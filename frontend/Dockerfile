# Build stage
FROM node:18 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
# Clear npm cache and install dependencies
RUN npm cache clean --force && npm install
COPY . .
RUN npm run build

# Production stage
FROM node:18 AS production
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.mjs ./next.config.mjs
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "run", "start"]