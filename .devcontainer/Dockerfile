# Use an official Node.js runtime as a parent image
FROM node:18-bullseye

# Set the working directory in the container
WORKDIR /workspace

# Install git, and other dependencies
RUN apt-get update && apt-get install -y git curl jq unzip sudo libgbm-dev

# Create a non-root user and switch to it
RUN useradd -ms /bin/bash node
RUN usermod -aG sudo node
USER node

# Install global npm packages if needed (e.g., nodemon, pm2)
# RUN npm install -g nodemon

# Copy the rest of the application code to the working directory
COPY --chown=node:node . .

# Expose any ports your application might use
# EXPOSE 3000

# Default command to run when the container starts
CMD [ "tail", "-f", "/dev/null" ]
