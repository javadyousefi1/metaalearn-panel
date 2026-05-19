# Stage 1: Build the React application
FROM node:20-alpine AS builder

# Install pnpm with mirror registry
RUN npm install -g pnpm@9.15.0 --registry https://mirror-npm.runflare.com
RUN pnpm config set registry https://mirror-npm.runflare.com

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

# Install serve globally with mirror registry
RUN npm install -g serve --registry https://mirror-npm.runflare.com

# Set working directory
WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Expose port 3000
EXPOSE 3000

# Serve the application on port 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
