# BUILD STAGE
FROM golang:1.14 AS builder

ADD . /gql-server
WORKDIR /gql-server
RUN CGO_ENABLED=0 go build -o /output/server -v


# DEPLOY STAGE
FROM alpine:latest

LABEL maintainer="LitmusChaos"

RUN apk update && apk add curl bash
RUN apk add --no-cache libc6-compat

COPY --from=builder /output/server /
COPY --from=builder /gql-server/template/. /template
CMD ["./server"]

EXPOSE 8080