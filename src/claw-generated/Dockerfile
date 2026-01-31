# Build stage
FROM node:14-alpine AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
RUN yarn test

# Production stage
FROM node:14-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
COPY --from=build /app/yarn.lock ./
RUN yarn install --production --frozen-lockfile
CMD ["node", "dist/main.js"]