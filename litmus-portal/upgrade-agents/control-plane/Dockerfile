# BUILD STAGE
FROM golang:1.16 AS builder

LABEL maintainer="LitmusChaos"

ARG TARGETOS=linux
ARG TARGETARCH

ADD . /upgrade-agent
WORKDIR /upgrade-agent

ENV GOOS=${TARGETOS} \
    GOARCH=${TARGETARCH}

RUN go env
RUN CGO_ENABLED=0 go build -o /output/upgrade-agent -v

## DEPLOY STAGE
FROM alpine:latest

LABEL maintainer="LitmusChaos"

COPY --from=builder /output/upgrade-agent /

RUN addgroup -S litmus && adduser -S -G litmus 1001
USER 1001

CMD ["./upgrade-agent"]
