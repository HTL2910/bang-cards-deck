FROM node:24-alpine AS build
ARG TARGET=event-deck
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build --workspace "@bang/${TARGET}"
RUN npm prune --omit=dev

FROM node:24-alpine
ARG TARGET=event-deck
WORKDIR /app
COPY package.json package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/${TARGET}/build ./build
EXPOSE 3000
CMD ["node", "node_modules/@react-router/serve/bin.cjs", "./build/server/index.js"]
