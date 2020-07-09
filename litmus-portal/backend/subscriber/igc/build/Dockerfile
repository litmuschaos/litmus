FROM node:10

# Add Maintainer Info
LABEL maintainer="LitmusChaos"

# All these steps will be cached
RUN mkdir /igc
WORKDIR /igc

# COPY package.json and package-lock.json files to the workspace
COPY package.json .
COPY package-lock.json .

# Get dependancies
RUN npm install

# COPY the source code as the last step
COPY . .

# Expose to port 8080
EXPOSE 8080

# npm start
CMD [ "npm", "start" ]
