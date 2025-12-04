# ==============================================================================
# Recommender (Python Worker) Dockerfile
# ==============================================================================
# This Dockerfile creates a Python container for the ML recommendation worker.
#
# STAGES:
# - Base: Python 3.10 slim (smaller than full Python image)
# - System Dependencies: Install build tools for numpy/scipy
# - Python Dependencies: Install pip packages
# - Runtime: Start worker process
#
# WHY SLIM INSTEAD OF ALPINE?
# - Python on Alpine requires compiling everything from source (slow!)
# - Slim Debian-based images have pre-built wheels = faster builds
# - Slim is ~40MB vs Alpine ~5MB, but builds 10x faster
# ==============================================================================

# Use official Python 3.10 slim variant
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# ==============================================================================
# SYSTEM DEPENDENCIES
# ==============================================================================
# Install build-essential for compiling Python packages that use C extensions
# (numpy, scipy, scikit-learn all need this)
#
# We use --no-install-recommends to keep image size small
# We clean up apt cache after to reduce image size
# ==============================================================================
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# ==============================================================================
# PYTHON DEPENDENCIES
# ==============================================================================
# Copy requirements first for layer caching (same reason as backend)
# If requirements.txt doesn't change, Docker reuses this layer
# ==============================================================================
COPY requirements.txt .

# Install Python packages
# --no-cache-dir prevents pip from caching packages, saving space
RUN pip install --no-cache-dir -r requirements.txt

# Copy all application code
COPY . .

# ==============================================================================
# WORKER DOESN'T NEED TO EXPOSE A PORT
# ==============================================================================
# Unlike the backend (which serves HTTP), this is a queue worker
# It connects TO other services (Redis, MongoDB) but doesn't accept connections
# So no EXPOSE directive needed
# ==============================================================================

# ==============================================================================
# STARTUP COMMAND
# ==============================================================================
# Run the worker directly with Python
# This process will block and listen to the Redis queue indefinitely
# ==============================================================================
CMD ["python", "worker.py"]
