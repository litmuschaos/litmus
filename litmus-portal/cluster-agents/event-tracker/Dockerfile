# BUILD STAGE
FROM golang:1.16 AS builder

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
FROM alpine:3.12.0

LABEL maintainer="LitmusChaos"

COPY --from=builder /output/event-tracker /

RUN addgroup -S litmus && adduser -S -G litmus 1001
USER 1001

CMD ["./event-tracker"]
