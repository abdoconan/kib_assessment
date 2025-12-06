# ---------------- BUILD STAGE ----------------
FROM node:22-slim AS builder

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

# Copy package files only first (cache layer)
COPY package.json pnpm-lock.yaml* ./

# Install deps (production + dev)
RUN pnpm install --frozen-lockfile

# Copy the rest of the project
COPY . .

# Build project (generates dist/)
RUN pnpm build


# ---------------- PRODUCTION STAGE ----------------
FROM node:22-slim AS production

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /usr/src/app

# Copy ONLY package files
COPY package.json pnpm-lock.yaml* ./

# Install ONLY production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built project from builder
COPY --from=builder /usr/src/app/dist ./dist

# Copy anything Nest needs at runtime (optional)
# COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

# Expose port (Nest default is 3000, not 8080)
EXPOSE 8080

# Use NestJS production start script
CMD ["node", "dist/src/main.js"]
