# Converts the output of the test suite into csv format
# Parses the flatfile.html found in the specified output directory
# Creates data frames from the csv and plots it 

######################################################################
# matplotlib: library used for plotting graphs
# pandas:     library used for creating data frames and csv operations
######################################################################

import subprocess
import matplotlib
import csv
import pandas as pd

matplotlib.use('Agg')

from matplotlib import pyplot as plt

# Function to parse the flatfile to csv

def parseflat():
	subprocess.call("./vdbench parse -i newdir/flatfile.html -c run interval reqrate rate resp MB/sec Read_rate Read_resp Write_rate Write_resp MB_read MB_write Xfersize Mkdir_rate Mkdir_resp Rmdir_rate Rmdir_resp Create_rate Create_resp Open_rate Open_resp Close_rate Close_resp Delete_rate Delete_resp Getattr_rate Getattr_resp Setattr_rate Setattr_resp Copy_rate Copy_resp Move_rate Move_resp compratio dedupratio cpu_used cpu_user cpu_kernel cpu_wait cpu_idle -f -o out.csv",shell=True)
	return




data = pd.read_csv('out.csv')

# Function to plot some sample graphs

def plot():
	plt.plot(data['rate'])
	plt.title('Rate')
	plt.ylabel('Rate')
	plt.xlabel('Time')
	plt.savefig('graphs/Rate.png')
	
	plt.plot(data['MB_read'])
	plt.title('MB_Read')
	plt.ylabel('MB_Read')
	plt.xlabel('Time')
	plt.savefig('graphs/MB_read.png')

	plt.plot(data['Read_resp'],label="Read_Response_Time")
	plt.plot(data['Read_rate'],label="Reads_Per_Second")
	plt.plot(data['rate'])
	plt.plot(data['MB_read'])
	plt.title('Reads')
	plt.xlabel('Time')
	plt.ylabel('Quantity')
	plt.legend()
	plt.savefig('graphs/Reads.png')

	return

def main():

	parseflat()
	plot()
	return

main()

