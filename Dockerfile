FROM node:17

# Working dir
WORKDIR /usr/src/app

# Copy files from Build
COPY package*.json ./

# Install Globals


# Install Files
RUN npm install 

# Copy SRC
COPY . .


# Open Port
EXPOSE 3000

# Docker Command to Start Service
CMD [ "npm", "run","dev" ]