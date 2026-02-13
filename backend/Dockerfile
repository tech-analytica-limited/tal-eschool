# Multi-stage build for NestJS backend

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install OpenSSL and dependencies for Prisma
RUN apt-get update -y && \
    apt-get install -y openssl libssl3 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Install OpenSSL and dependencies for Prisma
RUN apt-get update -y && \
    apt-get install -y openssl libssl3 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Regenerate Prisma client in production environment
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 37862

# Set environment to production
ENV NODE_ENV=production

# Run migrations and start the application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
