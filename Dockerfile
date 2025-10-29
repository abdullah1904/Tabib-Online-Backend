# ===============================
# 1️⃣ Build Stage
# ===============================
FROM node:22-alpine AS builder

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (dev + prod)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the project
RUN pnpm run build

# ===============================
# 2️⃣ Runtime Stage
# ===============================
FROM node:22-alpine

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built files
COPY --from=builder /app/dist ./dist

# ===============================
# Environment configuration
# ===============================

# Default port
ENV PORT=3004

# You can still override any of these at runtime with -e VAR=value
ENV NODE_ENV=production

# Expose the app port
EXPOSE 3004

# Start the app
CMD ["node", "dist/index.js"]
