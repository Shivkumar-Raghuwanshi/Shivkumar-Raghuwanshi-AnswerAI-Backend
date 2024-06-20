# Use the latest Node.js LTS version
FROM node:lts

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json 
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy local code to the container image.
COPY . .

# Generate the Prisma client
RUN npx prisma generate

# Compile TypeScript to JavaScript.
RUN npm run build

# Expose the port on which the application will run
EXPOSE 3000

# Run the web service on container startup.
CMD ["npm", "start"]