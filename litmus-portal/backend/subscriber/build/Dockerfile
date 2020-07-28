FROM golang:1.14.4-alpine

# Add Maintainer Info
LABEL maintainer="LitmusChaos"

# All these steps will be cached
RUN mkdir /subscriber
WORKDIR /subscriber

# <- COPY go.mod and go.sum files to the workspace
COPY go.mod .
COPY go.sum .

# Get dependancies - will also be cached if we won't change mod/sum
RUN go mod download

# COPY the source code as the last step
COPY . .

# Go build
RUN go build -o subscriber .
ENTRYPOINT ["./subscriber"]
