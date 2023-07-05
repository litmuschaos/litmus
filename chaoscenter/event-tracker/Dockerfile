# BUILD STAGE
FROM golang:1.20 AS builder

LABEL maintainer="LitmusChaos"

ARG TARGETOS=linux
ARG TARGETARCH

ADD . /event-tracker
WORKDIR /event-tracker

ENV GOOS=${TARGETOS} \
    GOARCH=${TARGETARCH}

RUN go env
RUN CGO_ENABLED=0 go build -o /output/event-tracker -v

# Packaging stage
# Image source: https://github.com/litmuschaos/test-tools/blob/master/custom/hardened-alpine/infra/Dockerfile
# The base image is non-root (have litmus user) with default litmus directory.
FROM litmuschaos/infra-alpine

LABEL maintainer="LitmusChaos"

COPY --from=builder /output/event-tracker /litmus

CMD ["./event-tracker"]