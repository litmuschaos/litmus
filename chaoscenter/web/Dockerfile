FROM registry.access.redhat.com/ubi10/nginx-126:latest

COPY dist /opt/chaos
COPY nginx/nginx.conf /etc/nginx/
COPY ./entrypoint.sh /opt

WORKDIR /opt/chaos

RUN chown 65534:0 -R /opt/chaos && \
    chown 65534:0 -R /var/log/nginx && \
    chown 65534:0 -R /etc/nginx

USER 65534

EXPOSE 8185

ENTRYPOINT ["sh", "/opt/entrypoint.sh"]