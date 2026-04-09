# BUILD STAGE
FROM golang:1.25.8 AS builder

LABEL maintainer="LitmusChaos"

ARG TARGETOS=linux
ARG TARGETARCH

COPY . /subscriber
WORKDIR /subscriber

RUN GOOS=${TARGETOS} GOARCH=${TARGETARCH} CGO_ENABLED=0 go build -o /output/subscriber -v

# Packaging stage
# Use RedHat UBI minimal image as base
FROM registry.access.redhat.com/ubi9/ubi-minimal:9.6

LABEL maintainer="LitmusChaos"

ENV APP_DIR="/litmus"

# Ensure base packages are patched
RUN microdnf -y update && microdnf clean all

COPY --from=builder /output/subscriber $APP_DIR/
RUN chown 65534:0 $APP_DIR/subscriber && chmod 755 $APP_DIR/subscriber

WORKDIR $APP_DIR
USER 65534

CMD ["./subscriber"]