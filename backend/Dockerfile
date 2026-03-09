FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install deps first for layer caching
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm ci --omit=dev

# Copy source
COPY backend/ ./backend/
COPY app/ ./app/
COPY landing/ ./landing/

# Create data + uploads dirs
RUN mkdir -p backend/data backend/uploads/projects

EXPOSE 3001

WORKDIR /app/backend

CMD ["node", "server.js"]
