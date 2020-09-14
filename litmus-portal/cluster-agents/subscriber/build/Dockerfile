# BUILD STAGE
FROM golang:1.14 AS builder

LABEL maintainer="LitmusChaos"

ADD . /subscriber
WORKDIR /subscriber
RUN CGO_ENABLED=0 go build -o /output/subscriber -v


# DEPLOY STAGE
FROM alpine:3.12.0

LABEL maintainer="LitmusChaos"

COPY --from=builder /output/subscriber /
CMD ["./subscriber"]
