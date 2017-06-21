#!/usr/bin/python3

"""
Module for parallel reading writing to file
"""

# import time
from threading import Thread

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
            file.close()

class Writer(Thread):
    """
    Writer class
    """
    def __init__(self, file_name):
        Thread.__init__(self)
        self.file_name = file_name

    def run(self):
        # print(self.file_name)
        file = open(self.file_name, 'w')
        for i in range(1, 2000000):
            print("Writing ", i)
            file.write(str(i))
            # time.sleep(1)
        file.close()

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

run()
