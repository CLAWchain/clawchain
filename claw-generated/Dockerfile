# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/claw-generated ./claw-generated
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY package*.json ./
RUN npm ci --production
CMD ["npm", "start"]