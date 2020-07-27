# BUILD STAGE
FROM golang:1.14 AS builder

LABEL maintainer="LitmusChaos"

ADD . /gql-server
WORKDIR /gql-server
RUN CGO_ENABLED=0 go build -o /output/server -v


# DEPLOY STAGE
FROM alpine:latest

LABEL maintainer="LitmusChaos"

COPY --from=builder /output/server /
COPY --from=builder /gql-server/manifests/. /manifests
CMD ["./server"]

EXPOSE 8080