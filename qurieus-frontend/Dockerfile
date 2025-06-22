# Stage 1: Install dependencies and build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Copy the Prisma schema to generate the client
COPY prisma ./prisma/

# Generate the Prisma client
RUN yarn prisma generate

# Build the Next.js application for production
RUN yarn build

# Stage 2: Create the production image
FROM node:18-alpine

WORKDIR /app

# Set the environment to production
ENV NODE_ENV=production

# Copy only the necessary artifacts from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/node_modules ./node_modules

# The Next.js app will run on port 8000 as configured in your ecosystem.config.js
EXPOSE 8000

# The command to start the application
CMD ["yarn", "start"] 