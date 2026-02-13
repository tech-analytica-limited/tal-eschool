# Multi-stage build for Next.js frontend

# Stage 1: Dependencies
FROM node:20-alpine AS deps


WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set environment variable for build
ENV NEXT_PUBLIC_API_URL=http://31.97.190.200:37862/api
ENV NEXT_TELEMETRY_DISABLED=1
# Skip TypeScript checks during build (they're already checked in development)
ENV SKIP_TYPE_CHECK=true

# Build the application
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=http://31.97.190.200:37862/api

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Copy Next.js build files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 37861

# Start the application
CMD ["node", "server.js"]
