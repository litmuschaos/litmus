# BUILD STAGE
FROM golang:1.20 AS builder

LABEL maintainer="LitmusChaos"

ARG TARGETOS=linux
ARG TARGETARCH

COPY . /gql-server
WORKDIR /gql-server

ENV GOOS=${TARGETOS} \
    GOARCH=${TARGETARCH}
    
RUN go env
RUN CGO_ENABLED=0 go build -o /output/server -v

## DEPLOY STAGE
# Image source: https://github.com/litmuschaos/test-tools/blob/master/custom/hardened-alpine/infra/Dockerfile
# The base image is non-root (have litmus user) with default litmus directory.
FROM litmuschaos/infra-alpine

LABEL maintainer="LitmusChaos"

COPY --from=builder /output/server /litmus
# Copy manifests and change the group to 0(root) to make it Openshift friendly
# as Openshift runs container with an arbitrary uid that in the root group
COPY --chown=litmus:0 --chmod=750 ./manifests/. /litmus/manifests
CMD ["./server"]

EXPOSE 8080
