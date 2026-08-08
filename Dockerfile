FROM node:22-slim

WORKDIR /app

# ModelScope Docker Studio requirements:
# - Service must listen on 0.0.0.0
# - Default port must be 7860 (8080 is occupied by the platform)
ENV NODE_ENV=production
ENV PORT=7860

# Install build dependencies for native modules (better-sqlite3)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create data directory for SQLite
RUN mkdir -p data

# Expose ModelScope required port
EXPOSE 7860

# Start the application
CMD ["npm", "start"]
