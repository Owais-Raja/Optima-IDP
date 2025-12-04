# ==============================================================================
# Backend Dockerfile
# ==============================================================================
# This Dockerfile creates a production-ready Node.js container for the backend.
#
# STAGES:
# - Base: Node.js 18 Alpine (lightweight Linux)
# - Dependencies: Install npm packages
# - Runtime: Copy app and start server
#
# WHY ALPINE?
# - Alpine is a minimal Linux distro (~5MB vs ~900MB for full Ubuntu)
# - Perfect for Docker - smaller images = faster deployments
# - Includes Node.js and all necessary tools
# ==============================================================================

# Use official Node.js 18 with Alpine Linux (lightweight)
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# ==============================================================================
# OPTIMIZATION: Layer Caching
# ==============================================================================
# Copy package files FIRST before copying app code.
# This allows Docker to cache the npm install layer.
# If package.json doesn't change, Docker reuses cached dependencies.
# ==============================================================================
COPY package*.json ./

# Install dependencies
# --production flag skips devDependencies (like nodemon)
# Remove this flag if you need dev dependencies
RUN npm install

# Copy all application code
COPY . .

# Expose port 5000 for the API server
EXPOSE 5000

# ==============================================================================
# STARTUP COMMAND
# ==============================================================================
# Use npm start (not nodemon) for production
# nodemon is for development - it watches for file changes
# In Docker, files don't change, so we use node directly
# ==============================================================================
CMD ["npm", "start"]
