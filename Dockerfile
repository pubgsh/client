FROM mhart/alpine-node:8.11.1

RUN npm config set unsafe-perm true
RUN npm install --global yarn
RUN npm config set unsafe-perm false

RUN apk add --no-cache python git make gcc g++ bash curl

ADD package.json /tmp/package.json
ADD yarn.lock /tmp/yarn.lock
RUN cd /tmp && yarn install
RUN mkdir -p /app && cp -a /tmp/node_modules /app/

RUN apk del python git make gcc g++

WORKDIR /app
ADD . ./
RUN yarn run build

RUN tar -cf build.tar build
