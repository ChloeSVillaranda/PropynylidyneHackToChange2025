# Use Node.js 20 Alpine
FROM node:20-alpine

WORKDIR /app

# Install dependencies without running postinstall/build (source not copied yet)
COPY package*.json ./
RUN npm install --ignore-scripts

# Copy source and configuration then build
COPY . .
RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start"]