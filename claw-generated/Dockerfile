# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app/backend
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine
WORKDIR /app/backend
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/package*.json ./
RUN npm ci --only=production
CMD ["node", "dist/api/server.js"]