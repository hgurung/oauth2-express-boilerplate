FROM node:14

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied

COPY . .
#COPY oauth2-express-boilerplate/ .

#COPY package*.json ./

RUN npm install

RUN npm install -g sequelize-cli

EXPOSE 8080

CMD [ "node", "index.js" ]

