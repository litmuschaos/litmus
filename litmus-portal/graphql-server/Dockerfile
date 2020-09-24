# BUILD STAGE
FROM golang:1.14 AS builder

LABEL maintainer="LitmusChaos"

WORKDIR src/github.com/litmuschaos/litmus/litmus-portal/graphql-server/.
CMD ["CGO_ENABLED=0 | go build"]
COPY ./graphql-server /output/server

## DEPLOY STAGE
FROM alpine:latest

LABEL maintainer="LitmusChaos"

COPY --from=builder ./output/server /
COPY ./manifests/. /manifests
CMD ["./server"]

EXPOSE 8080