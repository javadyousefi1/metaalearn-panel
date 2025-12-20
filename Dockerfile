# Stage 1: Build the React application
FROM node:20-alpine AS builder

# Set npm registry to a faster mirror for Iran (do this first!)
RUN npm config set registry https://registry.npmmirror.com

# Install pnpm directly from npm (more reliable than corepack in restricted networks)
RUN npm install -g pnpm@9.15.0

# Configure pnpm to use the same registry mirror
RUN pnpm config set registry https://registry.npmmirror.com

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy all source files (including .env for build-time variables)
COPY . .

# Build the application
RUN pnpm run build

# Stage 2: Serve the built application
FROM node:20-alpine

# Install serve globally to serve static files
RUN npm install -g serve

# Set working directory
WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Expose port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Serve the application on port 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
