FROM ubuntu:bionic

LABEL maintainer="LitmusChaos"

#Installing necessary ubuntu packages
RUN apt-get clean && \
    apt-get update --fix-missing || true && \
    apt-get install -y --no-install-recommends python-minimal python-pip netcat iproute2 jq sshpass \
    curl openssh-client python-setuptools && rm -rf /var/lib/apt/lists/* 

RUN pip install --upgrade pip

RUN touch /mnt/parameters.yml

#Installing ansible and dependencies for k8s module
RUN pip install ansible==2.7.3 openshift jmespath boto boto3

#Installing gcloud 
RUN curl -sSL https://sdk.cloud.google.com | bash
ENV PATH $PATH:/root/google-cloud-sdk/bin
RUN gcloud --version

#Installing Kubectl
ENV KUBE_LATEST_VERSION="v1.12.0"
RUN curl -L https://storage.googleapis.com/kubernetes-release/release/${KUBE_LATEST_VERSION}/bin/linux/amd64/kubectl -o /usr/local/bin/kubectl && \
    chmod +x /usr/local/bin/kubectl
    
#Adding hosts entries and making ansible folders
RUN mkdir /etc/ansible/ /ansible && \
    echo "[local]" >> /etc/ansible/hosts && \
    echo "127.0.0.1" >> /etc/ansible/hosts && \
    echo "[defaults]" >> /etc/ansible/ansible.cfg && \
    echo "display_skipped_hosts = False" >> /etc/ansible/ansible.cfg 

#Copying Necessary Files
COPY ./chaoslib ./chaoslib/
COPY ./hack/syntax-check ./hack/*.j2 ./
COPY ./utils ./utils/
COPY ./build/plugins/default.py /usr/local/lib/python2.7/dist-packages/ansible/plugins/callback/default.py
COPY ./build/utils/display.py /usr/local/lib/python2.7/dist-packages/ansible/utils/display.py
COPY experiments ./experiments
COPY executor ./executor
