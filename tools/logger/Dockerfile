FROM ubuntu
LABEL maintainer="OpenEBS"
RUN apt-get update || true
RUN apt-get install -y curl libgetopt++-dev 
ENV KUBE_LATEST_VERSION="v1.8.2"
RUN curl -L https://storage.googleapis.com/kubernetes-release/release/${KUBE_LATEST_VERSION}/bin/linux/amd64/kubectl -o /usr/local/bin/kubectl \
 && chmod +x /usr/local/bin/kubectl 
COPY stern /usr/local/bin
COPY logger.sh nodelogger.yaml /

