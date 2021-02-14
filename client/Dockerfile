FROM node:15.0.1-alpine AS builder

ENV NODE_ENV=production
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY . ./

RUN npm build

FROM node:15.0.1-alpine
ENV NODE_ENV=production

RUN npm install --global serve

#Add a non root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

#Run Container as nonroot
USER appuser

WORKDIR /app

COPY --from=builder /app/build .

EXPOSE 3000

CMD ["serve", "-p", "3000", "-s", "."]