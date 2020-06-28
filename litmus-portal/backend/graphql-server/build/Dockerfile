FROM golang:1.14.4-alpine

# Add Maintainer Info
LABEL maintainer="LitmusChaos"

# All these steps will be cached
RUN mkdir /graphql-server
WORKDIR /graphql-server

# <- COPY go.mod and go.sum files to the workspace
COPY go.mod .
COPY go.sum .

# Get dependancies - will also be cached if we won't change mod/sum
RUN go mod download

# COPY the source code as the last step
COPY . .

# Expose to port 8080
EXPOSE 8080

# Go build
RUN go build -o server .
ENTRYPOINT ["./server"]
