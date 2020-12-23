# BUILD STAGE
FROM golang:1.14 AS builder

ADD . /auth-server
WORKDIR /auth-server
RUN CGO_ENABLED=0 go build -o /output/server -v ./src/


# DEPLOY STAGE
FROM alpine:latest

LABEL maintainer="LitmusChaos"

COPY --from=builder /output/server /

RUN addgroup -S litmus && adduser -S -G litmus 1001 
USER 1001

CMD ["./server"]

EXPOSE 3000

