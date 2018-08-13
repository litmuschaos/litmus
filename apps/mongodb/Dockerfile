FROM ubuntu

LABEL maintainer="OpenEBS"

RUN rm -rf /var/lib/apt/lists/* && apt-get clean && \
    apt-get update --fix-missing || true && \
    apt-get install -y python-minimal python-pip \
    curl openssh-client

RUN pip install ansible

ENV KUBE_LATEST_VERSION="v1.8.2"
RUN curl -L https://storage.googleapis.com/kubernetes-release/release/${KUBE_LATEST_VERSION}/bin/linux/amd64/kubectl -o /usr/local/bin/kubectl && \
    chmod +x /usr/local/bin/kubectl

RUN mkdir /etc/ansible/ /ansible

RUN echo "[local]" >> /etc/ansible/hosts && \
    echo "127.0.0.1" >> /etc/ansible/hosts

ADD mongo-statefulset.yml/ ./mongodb/
ADD mongodb_vars.yml/ ./mongodb/
ADD mongodb-installer.yml/ ./mongodb/

COPY actionable.py /usr/local/lib/python2.7/dist-packages/ansible/plugins/callback/ 

