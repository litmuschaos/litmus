# BUILD STAGE
FROM golang:1.24 AS builder

LABEL maintainer="LitmusChaos"

ARG TARGETOS=linux
ARG TARGETARCH

COPY . /gql-server
WORKDIR /gql-server

ENV GOOS=${TARGETOS} \
    GOARCH=${TARGETARCH}

RUN go env
RUN CGO_ENABLED=0 go build -o /output/server -v

# DEPLOY STAGE
# Use Red Hat UBI minimal image as base
FROM registry.access.redhat.com/ubi9/ubi-minimal:9.6

LABEL maintainer="LitmusChaos"

ENV APP_DIR="/litmus"

COPY --from=builder /output/server $APP_DIR/
COPY ./manifests/. $APP_DIR/manifests

RUN chown -R 65534:0 $APP_DIR/manifests && chmod -R 755 $APP_DIR/manifests
RUN chown 65534:0 $APP_DIR/server && chmod 755 $APP_DIR/server

WORKDIR $APP_DIR
USER 65534

CMD ["./server"]

EXPOSE 8080
