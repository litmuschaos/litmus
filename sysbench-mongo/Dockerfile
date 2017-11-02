FROM ubuntu:16.04

RUN apt-get clean \
  && rm -rf /var/lib/apt/lists/* \
  && apt-get update -y || true \
  && apt-get install -y -f \
  make \
  automake \
  libmysqlclient-dev \ 
  libtool \
  libsasl2-dev \
  libssl-dev \
  libmongoc-dev \
  libbson-dev 

RUN cp /usr/include/libbson-1.0/* /usr/include/ \
  && cp /usr/include/libmongoc-1.0/* /usr/include/

ADD sysbench/ /sysbench
WORKDIR /sysbench
RUN ./autogen.sh && ./configure && make
 
