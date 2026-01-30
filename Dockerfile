# Multi-stage build for production
# Build timestamp: 2026-01-26-moltbot-redesign (cache bust)
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies (skip root, only install backend and frontend)
RUN cd backend && npm ci
RUN cd frontend && npm ci

# Copy source code
COPY . .

# Build applications
RUN cd backend && npm run build
RUN cd frontend && npm run build

# Production stage
FROM node:18-alpine AS production

# Install git for agent commits
RUN apk add --no-cache git

WORKDIR /app

# Copy built backend
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/backend/node_modules ./backend/node_modules

# Copy source code for agent to modify
COPY --from=builder /app/backend/src ./backend/src
COPY --from=builder /app/frontend/src ./frontend/src

# Copy built frontend
COPY --from=builder /app/frontend/dist ./frontend/dist

# Copy environment and config files
COPY --from=builder /app/backend/.env* ./backend/
COPY --from=builder /app/vercel.json ./

# Create directories for agent work
RUN mkdir -p /app/backend/data /app/backend/src/claw-generated

# Initialize git repo for agent commits
RUN git init && \
    git config user.name "CLAWchain" && \
    git config user.email "claw@clawchain.app"

# Expose port
EXPOSE 4000

# Set environment
ENV NODE_ENV=production

# Start the application
CMD ["node", "backend/dist/index.js"]