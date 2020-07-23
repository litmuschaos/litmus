#Build Stage
FROM golang:1.14 AS builder

LABEL maintainer="LitmusChaos"

ADD . /self-deployer
WORKDIR /self-deployer
RUN CGO_ENABLED=0 go build -o /output/deployer -v

#Deploy Stage
FROM alpine:latest

LABEL maintainer="LitmusChaos"

#Install required packages
RUN apk update && apk add curl bash
RUN apk add --no-cache libc6-compat

#Copy binaries from build stage
COPY --from=builder /output/deployer /
COPY --from=builder /self-deployer/template/self-deployer.yml /template/self-deployer.yml
CMD ["./deployer"]

EXPOSE 8080