# BUILD STAGE
FROM golang:1.14 AS builder

LABEL maintainer="LitmusChaos"

ARG TARGETOS=linux
ARG TARGETARCH

ADD . /gql-server
WORKDIR /gql-server

ENV GOOS=${TARGETOS} \
    GOARCH=${TARGETARCH}
    
RUN go env
RUN CGO_ENABLED=0 go build -o /output/server -v

# DEPLOY STAGE
FROM registry.access.redhat.com/ubi8/ubi-minimal:8.4

LABEL maintainer="LitmusChaos"

COPY --from=builder /output/server /
COPY --from=builder /gql-server/manifests/. /manifests

ENV USER_UID=1001

ENTRYPOINT ["./server"]

USER ${USER_UID}

EXPOSE 8080
