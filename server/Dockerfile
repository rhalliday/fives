FROM node:15.0.1-alpine
ENV NODE_ENV=production

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . ./

#Add a non root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

#Run Container as nonroot
USER appuser

EXPOSE 8080

CMD [ "node", "server.js" ]