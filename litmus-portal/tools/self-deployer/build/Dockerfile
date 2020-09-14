#Build Stage
FROM golang:1.14 AS builder

LABEL maintainer="LitmusChaos"

ADD . /self-deployer
WORKDIR /self-deployer
RUN CGO_ENABLED=0 go build -o /output/deployer -v

#Deploy Stage
FROM alpine:latest

LABEL maintainer="LitmusChaos"

#Install kubectl

ARG KUBE_VERSION="1.18.5"
ARG ARCH="amd64"
RUN apk add --update ca-certificates && \
    apk add --update -t deps curl && \
    curl -L https://storage.googleapis.com/kubernetes-release/release/v$KUBE_VERSION/bin/linux/$ARCH/kubectl -o /usr/local/bin/kubectl && \
    chmod +x /usr/local/bin/kubectl && \
    apk del --purge deps && \
    rm /var/cache/apk/*

#Copy binaries from build stage
COPY --from=builder /output/deployer /
CMD ["./deployer"]