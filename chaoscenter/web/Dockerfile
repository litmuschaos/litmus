FROM registry.access.redhat.com/ubi9/ubi-minimal:9.7

# apply latest patches
RUN microdnf update -y --nodocs \
&& microdnf install -y --nodocs nginx \
&& microdnf install -y --nodocs python3 python3-pip \
&& pip3 install --no-cache-dir pyyaml \
&& microdnf clean all
    
COPY dist /opt/chaos
COPY nginx/nginx.conf /etc/nginx/
COPY ./entrypoint.sh /opt

WORKDIR /opt/chaos

# Update the permission of group to 0(root) to make it Openshift friendly
# as Openshift runs container with an arbitrary uid that in the root group
RUN touch /run/nginx.pid && \
    chown -R 65534:0 /opt/chaos /var/log/nginx /etc/nginx /var/lib/nginx /run/nginx.pid && \
    chmod -R 755 /opt/chaos /var/log/nginx /etc/nginx /var/lib/nginx /run/nginx.pid

USER 65534

EXPOSE 8185

ENTRYPOINT ["sh", "/opt/entrypoint.sh"]
