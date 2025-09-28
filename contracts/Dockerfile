FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Compile contracts
RUN npm run compile

# Expose port
EXPOSE 8545

# Start hardhat node
CMD ["npx", "hardhat", "node", "--hostname", "0.0.0.0"]
