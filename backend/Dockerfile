# ── Development Setup ──────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code (will be overridden by volume mount in dev)
COPY . .

# Expose port
EXPOSE 4000

# Run in development mode with hot reload
CMD ["npm", "run", "dev"]