# --- STAGE 1: The Build Environment (The Kitchen) ---
FROM node:20-bullseye-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- STAGE 2: The Production Image (The Dining Room) ---
FROM node:20-bullseye-slim
WORKDIR /app

# Security: Run as a non-privileged user
RUN apt-get update && apt-get install -y curl
RUN useradd -m devops_user
USER devops_user

# We ONLY copy the specific artifacts we need from the builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# The final image HAS NO:
# - npm cache
# - source code (.ts files)
# - compilers or build tools

EXPOSE 3001
CMD ["node", "dist/main.js"]