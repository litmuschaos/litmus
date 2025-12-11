FROM registry.access.redhat.com/ubi8/ubi-minimal:8.10

# apply latest patches
RUN microdnf update --nodocs \
&& microdnf module enable nginx:1.20 \
&& microdnf install --nodocs nginx \
&& microdnf install --nodocs python3 \
&& pip3 install --no-cache-dir pyyaml \
&& microdnf clean all
    
COPY dist /opt/chaos
COPY nginx/nginx.conf /etc/nginx/
COPY ./entrypoint.sh /opt

WORKDIR /opt/chaos

# Update the permission of group to 0(root) to make it Openshift friendly
# as Openshift runs container with an arbitrary uid that in the root group
RUN chown 65534:0 -R /opt/chaos && \
    chown 65534:0 -R /var/log/nginx && \
    chown 65534:0 -R /etc/nginx

USER 65534

EXPOSE 8185

ENTRYPOINT ["sh", "/opt/entrypoint.sh"]
