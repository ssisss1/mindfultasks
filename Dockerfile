# --- build stage -----------------------------------------------------------
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- runtime stage --------------------------------------------------------
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
# Database is remote (Turso): set DATABASE_URL + DATABASE_AUTH_TOKEN at runtime.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/server-dist ./server-dist
EXPOSE 8787
CMD ["node", "server-dist/index.js"]
