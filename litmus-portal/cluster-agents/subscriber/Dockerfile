# BUILD STAGE
FROM golang:1.14 AS builder

LABEL maintainer="LitmusChaos"

ARG TARGETOS=linux
ARG TARGETARCH

ADD . /subscriber
WORKDIR /subscriber

ENV GOOS=${TARGETOS} \
    GOARCH=${TARGETARCH}

RUN go env
RUN CGO_ENABLED=0 go build -o /output/subscriber -v

# DEPLOY STAGE
FROM registry.access.redhat.com/ubi8/ubi-minimal:8.4

LABEL maintainer="LitmusChaos"

COPY --from=builder /output/subscriber /

ENV USER_UID=1001

ENTRYPOINT ["./subscriber"]

USER ${USER_UID}