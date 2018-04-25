#FROM ubuntu
FROM debian
MAINTAINER OpenEBS
RUN apt-get update || true 
RUN apt-get install -y libiscsi-bin
COPY testiscsi.sh run-tests.out /
 
