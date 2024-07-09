# BUILD STAGE
FROM golang:1.22 AS builder

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
# Use Red Hat UBI minimal image as base
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
    
# Copy the built server binary to /litmus
COPY --from=builder /output/server $APP_DIR/
# Copy manifests and set the owner and permissions
COPY --chown=$APP_USER:0 --chmod=755 ./manifests/. $APP_DIR/manifests

WORKDIR $APP_DIR
USER $APP_USER

CMD ["./server"]

EXPOSE 8080