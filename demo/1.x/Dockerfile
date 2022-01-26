# select base image from https://hub.docker.com/_/docker
FROM docker:19

# Add Maintainer Info
LABEL maintainer="LitmusDev"

# Set common env variable
ARG HOME_DIR="/litmus_demo"
ENV HOME_DIR=${HOME_DIR}


WORKDIR ${HOME_DIR}

RUN apk add --update --no-cache build-base python3-dev python3  jpeg-dev zlib-dev libffi-dev libressl-dev bash git gettext curl  \
 && curl -O https://bootstrap.pypa.io/get-pip.py \
 && python3 get-pip.py \
 && pip install cryptography==3.3.1 \
 && pip install --upgrade six docker-compose

# install kubectl
COPY --from=lachlanevenson/k8s-kubectl:latest /usr/local/bin/kubectl /usr/local/bin/kubectl

# install helm
COPY --from=alpine/helm:latest /usr/bin/helm /usr/bin/helm

# install kind
RUN curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.9.0/kind-linux-amd64 \
&& chmod +x ./kind && mv ./kind /usr/local/bin/kind

# install gcloud
RUN curl -sSL https://sdk.cloud.google.com | bash
ENV PATH $PATH:/root/google-cloud-sdk/bin

# install eksctl
COPY --from=weaveworks/eksctl:latest /usr/local/bin/eksctl /usr/local/bin/eksctl

# install python dependencies
copy requirements.txt /tmp/requirements.txt
RUN pip3 install -r /tmp/requirements.txt

COPY . ./

ENTRYPOINT ["python3", "manage.py"]
CMD ["-h"]