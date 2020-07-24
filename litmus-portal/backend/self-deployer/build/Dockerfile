#Build Stage
FROM golang:1.14 AS builder

LABEL maintainer="LitmusChaos"

ADD . /self-deployer
WORKDIR /self-deployer
RUN CGO_ENABLED=0 go build -o /output/deployer -v

#Deploy Stage
FROM alpine:latest

LABEL maintainer="LitmusChaos"

#Copy binaries from build stage
COPY --from=builder /output/deployer /
CMD ["./deployer"]

EXPOSE 8080