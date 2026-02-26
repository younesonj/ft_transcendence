# Everything happens in one stage
FROM node:20-bullseye-slim

WORKDIR /app

# Install everything (including dev tools)
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

# The image is now stuck with:
# - The 'node_modules' folder (with all dev-dependencies)
# - Your source code (.ts files)
# - The TypeScript compiler and build tools
# - The npm cache

EXPOSE 3004
CMD ["node", "dist/main.js"]
