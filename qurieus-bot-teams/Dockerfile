# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
RUN apk add --no-cache openssl
# Install dependencies using Yarn
RUN yarn config set network-timeout 600000 -g
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build TypeScript (if needed)
RUN yarn build || echo "No build script found, skipping build"

# Expose port (adjust if your bot uses a different port)
EXPOSE 3978

# Start the application
CMD ["yarn", "start"] 