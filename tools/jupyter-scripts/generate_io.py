#!/usr/bin/env python3

"""
Module for parallel reading writing to file
"""

# import time
import io
from threading import Thread
from requests import get

class Reader(Thread):
    """
    Reader class
    """
    def __init__(self, file_name):
        Thread.__init__(self)
        self.file_name = file_name

    def run(self):
        # print(self.file_name)
        with open(self.file_name) as file:
            for line in file.readlines():
                print("Read " + line)
                # time.sleep(1)

class Writer(Thread):
    """
    Writer class
    """
    def __init__(self, file_name):
        Thread.__init__(self)
        self.file_name = file_name

    def run(self):
        # print(self.file_name)
        with open(self.file_name, 'w') as file:
            for i in range(1, 2000000):
                print("Writing ", i)
                file.write(str(i))

def run():
    """
    Run method
    ---
    You can take different files too.

    Reader("file.txt").start()
    Writer("another-file.txt").start()
    """
    Reader("file.txt").start()
    Writer("file.txt").start()


def download(url, file_name):
    """
    function to download file over http
    url : URL of file to be downloaded
    file_name : File name
    """
    with io.FileIO(file_name, "w") as file:
        # get request
        response = get(url)
        # write to file
        file.write(response.content)

run()
