FROM golang:1.14.4-alpine

# Add Maintainer Info
LABEL maintainer="LitmusChaos"

# All these steps will be cached
RUN mkdir /auth-server
WORKDIR /auth-server

# COPY the source code as the last step
COPY . .

# Get dependancies - will also be cached if we won't change mod/sum
RUN go mod download

# Expose to port 3000
EXPOSE 3000

# Go build
RUN go build -o server ./src/
ENTRYPOINT ["./server"]

