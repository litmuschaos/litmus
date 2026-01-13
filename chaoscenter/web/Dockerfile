
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . . 
RUN npm run build  


FROM registry.access.redhat.com/ubi10/ubi-minimal:10.1
RUN microdnf update -y --nodocs && \
    microdnf install -y --nodocs nginx python3 python3-pip && \
    microdnf clean all


COPY --from=builder /app/dist /opt/chaos
COPY nginx/nginx.conf /etc/nginx/
COPY ./entrypoint.sh /opt

