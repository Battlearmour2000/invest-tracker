# Use Node image
FROM node:18

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy project files
COPY . .

# Expose port
EXPOSE 3000

# Default command (overridden by docker-compose)
CMD ["npm", "start"]
