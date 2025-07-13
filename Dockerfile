FROM oven/bun:1-alpine

RUN apk add --no-cache bash curl nodejs npm

ADD package.json /tmp/package.json
ADD bun.lock /tmp/bun.lock
RUN cd /tmp && bun install
RUN mkdir -p /app && cp -a /tmp/node_modules /app/

WORKDIR /app
ADD . ./
RUN bun run build

RUN tar -cf build.tar build
