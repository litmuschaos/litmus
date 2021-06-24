# BUILD STAGE
FROM golang:1.14 AS builder

ARG TARGETOS=linux
ARG TARGETARCH

ADD . /auth-server
WORKDIR /auth-server

ENV GOOS=${TARGETOS} \
    GOARCH=${TARGETARCH}

RUN go env

RUN CGO_ENABLED=0 go build -o /output/server -v ./api/

# DEPLOY STAGE
FROM registry.access.redhat.com/ubi8/ubi-minimal:8.4

LABEL maintainer="LitmusChaos"

COPY --from=builder /output/server /

ENV USER_UID=1001

ENTRYPOINT ["./server"]

USER ${USER_UID}

EXPOSE 3000
