# --- STAGE 1: The Build Environment ---
FROM node:20-bullseye-slim AS builder
WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

# --- STAGE 2: The Production Image ---
FROM node:20-bullseye-slim
WORKDIR /app

# Install runtime dependencies and create user
RUN apt-get update && apt-get install -y curl openssl && \
    useradd -m devops_user && \
    rm -rf /var/lib/apt/lists/*

# Fix: Set ownership DURING the copy process
# This eliminates the need for the slow 'RUN chown -R' line
COPY --chown=devops_user:devops_user --from=builder /app/dist ./dist
COPY --chown=devops_user:devops_user --from=builder /app/node_modules ./node_modules
COPY --chown=devops_user:devops_user --from=builder /app/package.json ./package.json
COPY --chown=devops_user:devops_user --from=builder /app/prisma ./prisma

# Switch user before running the app
USER devops_user

EXPOSE ${USER_SERVICE_PORT}
# Note: Since you copied node_modules, make sure prisma engines are included
CMD ["node", "dist/main.js"]