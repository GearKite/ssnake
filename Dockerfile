FROM node:21-alpine

RUN mkdir -p /home/node/app

WORKDIR /home/node/app

COPY server ./server
COPY client ./client
COPY scripts ./scripts

RUN cd server && npm install
RUN cd client && npm install

RUN sh ./scripts/build.sh

WORKDIR /home/node/app/server

EXPOSE 3000

CMD ["node", "dist"]