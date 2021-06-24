# BUILD STAGE
FROM golang:1.14 AS builder

LABEL maintainer="LitmusChaos"

ARG TARGETOS=linux
ARG TARGETARCH

ADD . /event-tracker
WORKDIR /event-tracker

ENV GOOS=${TARGETOS} \
    GOARCH=${TARGETARCH}

RUN go env
RUN CGO_ENABLED=0 go build -o /output/event-tracker -v

# DEPLOY STAGE
FROM registry.access.redhat.com/ubi8/ubi-minimal:8.4

LABEL maintainer="LitmusChaos"

COPY --from=builder /output/event-tracker /

ENV USER_UID=1001

ENTRYPOINT ["./event-tracker"]

USER ${USER_UID}