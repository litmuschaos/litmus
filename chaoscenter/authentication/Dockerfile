# BUILD STAGE
FROM golang:1.22 AS builder

ARG TARGETOS=linux
ARG TARGETARCH

ADD . /auth-server
WORKDIR /auth-server

ENV GOOS=${TARGETOS} \
    GOARCH=${TARGETARCH}

RUN go env

RUN CGO_ENABLED=0 go build -o /output/server -v ./api/

# Packaging stage
# Image source: https://github.com/litmuschaos/test-tools/blob/master/custom/hardened-alpine/infra/Dockerfile
# The base image is non-root (have litmus user) with default litmus directory.
FROM registry.access.redhat.com/ubi9/ubi-minimal:9.4

LABEL maintainer="LitmusChaos"

ENV APP_USER=litmus
ENV APP_DIR="/litmus"
ENV DATA_DIR "$APP_DIR/data"
ENV CONF_DIR "$APP_DIR/conf"

RUN microdnf install shadow-utils \
    && groupadd -g 2000 $APP_USER \
    && useradd -u 2000 -g 2000 -d $APP_DIR -s /sbin/nologin $APP_USER \
    && mkdir -p "$DATA_DIR" "$CONF_DIR" \
    && chown -R "$APP_USER:0" "$DATA_DIR" "$CONF_DIR" \
    && chmod -R 700 "$DATA_DIR" "$CONF_DIR"

COPY --from=builder /output/server $APP_DIR/

WORKDIR $APP_DIR
USER $APP_USER

CMD ["./server"]

EXPOSE 3000