# BUILD STAGE
FROM golang:1.24 AS builder

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
# Use RedHat UBI minimal image as base
FROM registry.access.redhat.com/ubi9/ubi-minimal:9.6

LABEL maintainer="LitmusChaos"

ENV APP_DIR="/litmus"

COPY --from=builder /output/event-tracker $APP_DIR/
RUN chown 65534:0 $APP_DIR/event-tracker && chmod 755 $APP_DIR/event-tracker

WORKDIR $APP_DIR
USER 65534

CMD ["./event-tracker"]

EXPOSE 8080