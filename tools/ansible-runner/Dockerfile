FROM ubuntu

LABEL maintainer="OpenEBS"

#Installing necessary ubuntu packages
RUN rm -rf /var/lib/apt/lists/* && \
    apt-get clean && \
    apt-get update --fix-missing || true && \
    apt-get install -y python-minimal python-pip \
    curl openssh-client

#Installing ansible
RUN pip install ansible

#Installing Kubectl
ENV KUBE_LATEST_VERSION="v1.12.0"
RUN curl -L https://storage.googleapis.com/kubernetes-release/release/${KUBE_LATEST_VERSION}/bin/linux/amd64/kubectl -o /usr/local/bin/kubectl && \
    chmod +x /usr/local/bin/kubectl

#Adding hosts entries and making ansible folders
RUN mkdir /etc/ansible/ /ansible && \
    echo "[local]" >> /etc/ansible/hosts && \
    echo "127.0.0.1" >> /etc/ansible/hosts

#Copying Necessary Files
COPY providers/openebs/installers/ ./

COPY ./apps/ ./

COPY ./chaoslib ./chaoslib/

COPY ./executor/ansible/plugins/callback/actionable.py /usr/local/lib/python2.7/dist-packages/ansible/plugins/callback/ 

COPY ./hack/litmus-result.j2 ./
