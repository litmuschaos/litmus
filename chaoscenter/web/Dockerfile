FROM registry.access.redhat.com/ubi8/ubi-minimal:8.7
RUN microdnf module enable nginx:1.20
RUN microdnf install nginx
    
COPY dist /opt/chaos
COPY nginx/nginx.conf /etc/nginx/
COPY ./entrypoint.sh /opt

WORKDIR /opt/chaos

RUN chown 65534:65534 -R /opt/chaos
RUN chown 65534:65534 -R /var/log/nginx
RUN chown 65534:65534 -R /etc/nginx

USER 65534

EXPOSE 8184

ENTRYPOINT ["sh", "/opt/entrypoint.sh"]
