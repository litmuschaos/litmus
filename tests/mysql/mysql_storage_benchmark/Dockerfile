FROM ubuntu
LABEL maintainer="OpenEBS"
RUN apt-get update || true && \
    apt-get install -y python-minimal python-pip \
    curl openssh-client

RUN pip install ansible

ENV KUBE_LATEST_VERSION="v1.8.2"
RUN curl -L https://storage.googleapis.com/kubernetes-release/release/${KUBE_LATEST_VERSION}/bin/linux/amd64/kubectl -o /usr/local/bin/kubectl && \
    chmod +x /usr/local/bin/kubectl

RUN mkdir /etc/ansible/ /ansible

RUN echo "[local]" >> /etc/ansible/hosts && \
    echo "127.0.0.1" >> /etc/ansible/hosts

RUN mkdir -p /ansible/playbooks

WORKDIR /ansible/playbooks

COPY mysql.yaml test.yaml test_vars.yaml test_cleanup.yaml /ansible/playbooks/
