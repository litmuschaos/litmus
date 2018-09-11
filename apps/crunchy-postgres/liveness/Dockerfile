FROM python:3

ADD liveness.py /

RUN pip install psycopg2
RUN python -m pip install psycopg2-binary

CMD [ "python", "./liveness.py" ]
