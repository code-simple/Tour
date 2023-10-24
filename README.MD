### NODE JS Examples to learn

- File Structure
- Middlewares
- Routing
- Controllers / Handlers
- Mongoose

### EC2 Setup
3 Important tasks.

- NGINX , SSL, DNS re-routing

Steps [Visit](https://github.com/code-simple/nodejs-on-ec2#node-hello-world)

### DOCKER INFO

After installing DOCKER GUI for windows10 and setting up environment
add the two files to project root

- Dockerfile
- .dockerignore

In Dockerfile add below code , Modify as needed e.g port

```
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
```

In .dockerignore add this cod

```
node_modules
npm-debug.log
build
.vscode
```

Commands:

```
cd .. "Get out of app directory"

To Build Image:  docker build .\Tour\ -t tour:latest
To Run Image on Container: docker run --name tour -p 3000:3000/tcp -d tour
To Check Logs (Continuous) : docker logs -f tour
To get Interactive Shell: docker exec -it tour /bin/bash

Here in shell you can execute git pull and get latest updates of code.

You can push docker to Docker Repository (First make Reposity at docker HUB) :
docker tag tour forcod/tour
docker push forcod/tour
```
