# ---- Server image: Node.js + Express ----
FROM node:20-alpine

WORKDIR /app

# Install production dependencies first (better layer caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy application source
COPY . .

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "src/server.js"]
