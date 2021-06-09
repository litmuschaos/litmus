# BUILD STAGE
FROM golang:1.14 AS builder

ARG TARGETOS=linux
ARG TARGETARCH

ADD . /auth-server
WORKDIR /auth-server

ENV GOOS=${TARGETOS} \
    GOARCH=${TARGETARCH}

RUN go env

RUN CGO_ENABLED=0 go build -o /output/server -v ./api/

# DEPLOY STAGE
FROM alpine:latest

LABEL maintainer="LitmusChaos"

COPY --from=builder /output/server /

RUN addgroup -S litmus && adduser -S -G litmus 1001
USER 1001

CMD ["./server"]

EXPOSE 3000