FROM ubuntu:16.04

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        fio \
    && apt-get clean


COPY fio_runner.sh /
COPY templates /templates/

CMD ["/fio_runner.sh"]
