FROM python:3

ADD server.py /

RUN pip install pystrich
RUN python -m pip install pymongo

CMD [ "python", "./server.py" ]