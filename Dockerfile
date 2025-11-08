# Stage 1: Build the React application
FROM node:20-alpine AS builder

# Enable corepack and prepare pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

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
