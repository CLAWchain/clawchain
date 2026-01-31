# Build backend
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json .
RUN npm ci
COPY backend .
RUN npm run build

# Build frontend 
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json .
RUN npm ci
COPY frontend .
RUN npm run build

# Runtime image
FROM node:18-alpine
WORKDIR /app

# Copy backend
COPY --from=backend-builder /app/backend/dist ./backend/dist

# Copy frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Install dependencies
COPY package*.json ./
RUN npm ci --production

CMD ["npm", "start"]