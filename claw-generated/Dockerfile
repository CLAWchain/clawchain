# Build stage
FROM node:16 AS builder
WORKDIR /app

# Copy project files
COPY . .

# Install dependencies
RUN npm ci

# Build the application
RUN npm run build

# Runtime stage
FROM node:16-slim
WORKDIR /app

# Copy built artifacts from the builder stage
COPY --from=builder /app/dist ./dist

# Install only runtime dependencies
RUN npm install --omit=dev

# Set the entrypoint
CMD ["node", "dist/index.js"]