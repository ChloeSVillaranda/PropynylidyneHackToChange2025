# Use Node.js 20 Alpine
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

EXPOSE 4000

CMD ["npm", "run", "start"]
