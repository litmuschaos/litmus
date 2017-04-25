import subprocess
import matplotlib
import csv
import pandas as pd

matplotlib.use('Agg')

from matplotlib import pyplot as plt
def parseflat():
	subprocess.call("./vdbench parse -i output/flatfile.html -c run interval reqrate rate resp MB/sec Read_rate Read_resp Write_rate Write_resp MB_read MB_write Xfersize Mkdir_rate Mkdir_resp Rmdir_rate Rmdir_resp Create_rate Create_resp Open_rate Open_resp Close_rate Close_resp Delete_rate Delete_resp Getattr_rate Getattr_resp Setattr_rate Setattr_resp  Copy_rate  Copy_resp  Move_rate  Move_resp  compratio dedupratio   cpu_used   cpu_user cpu_kernel   cpu_wait   cpu_idle -f -o out.csv",shell=True)
	return


def plot():
	return

def readCSV():
	#with open('out.csv', 'rb') as data:
	#	reader=csv.reader(data)
	#	for row in reader:
	#		print row
	
	data = pd.read_csv('out.csv')
	#print data['run']
	plt.plot(data['rate'])
	plt.savefig('temp2.png')
	
	return

def main():
	parseflat()
	plot()
	readCSV()
	return


main()

