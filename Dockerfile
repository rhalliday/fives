FROM node:15.0.1-alpine AS client_build

ENV NODE_ENV=production
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY ["client/package.json", "client/package-lock.json*", "./"]

RUN npm install --production

COPY ./client ./

RUN npm run build

FROM node:15.0.1-alpine AS server_build

ENV NODE_ENV=production

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY ["server/package.json", "server/package-lock.json*", "./"]

RUN npm install --production

COPY ./server ./

RUN npm run build

FROM node:15.0.1-alpine

ENV NODE_ENV=production

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY --from=server_build /app/node_modules ./node_modules
COPY --from=server_build /app/dist ./dist
COPY --from=client_build /app/build ./client

#Add a non root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

#Run Container as nonroot
USER appuser

EXPOSE 8080

CMD [ "node", "dist/server.js" ]