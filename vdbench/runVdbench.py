######################################################################################## 
#Script to parse the YAML file and to set the
# paramters in the paramFile for the vdbench test suite
# The destination directories like output for vdbench, graphs, csv, param are 
# taken from the YAML file itself to make it more generic

########################################################################################

import yaml
import subprocess
import sys
import datetime
import time
import matplotlib
import pandas as pd
import csv

matplotlib.use('Agg') # Set the back end of the matplotlib here

# Scan the command line input

inputpath=sys.argv[1]

inputFile=open(inputpath,'r')
dataMap=yaml.load(inputFile)

# Set the output directories for param and vdbench output files

outputDir="output2_"

def timeStamp(outputDir):
	ts = time.time()
	st = datetime.datetime.fromtimestamp(ts).strftime('%Y-%m-%d_%H:%M:%S')	
	outputDir=outputDir+st
	return outputDir

def createDirectories(outputDir,outputPlots,outputCSV):
	#print(outputDir)
	subprocess.call("mkdir %s" %(outputDir),shell=True)
	subprocess.call("mkdir %s" %(outputPlots),shell=True)
	subprocess.call("touch %s" %(outputCSV),shell=True)    
	return

def createParam(outputDir):
	paramFile=outputDir+"/paramFile"
	outputFile=open(paramFile,'w+')

# Parse the storage, workload and run definitions

	storageDefinition= "fsd="+dataMap['SDName']+","+"anchor="+dataMap['Anchor']+","+"depth="+dataMap['Depth']+","+"files="+dataMap['Files']+","+"size="+dataMap['Size']+","+"width="+dataMap['Width']+"\n"

	workDefinition= "fwd="+dataMap['WDName']+","+"fsd="+dataMap['SDForWD']+","+"rdpct="+dataMap['ReadPercentage']+","+"xfersize="+dataMap['TransferSize']+","+"fileio="+dataMap['FileIO']+","+"threads="+dataMap['Threads']+","+"fileselect="+dataMap['FileSelect']+"\n"


	runDefinition= "rd="+dataMap['RDName']+","+"fwd="+dataMap['WDForRD']+","+"elapsed="+dataMap['Duration']+","+"interval="+dataMap['Interval']+","+"fwdrate="+dataMap['Fwdrate']+","+"format="+dataMap['Format']+"\n"

# write into the paramFile

	outputFile.write(storageDefinition)	
	outputFile.write(workDefinition)
	outputFile.write(runDefinition)

	outputFile.close()
	inputFile.close()
	return paramFile

# Run the vdbench test suite

def runtest(paramFile, outputDir):
	testOutput=outputDir+"/testOutput"
	subprocess.call("./vdbench -f %s -o %s/" %(paramFile,testOutput),shell=True)

	return testOutput

# Function to parse the flatfile to csv

def parseFlat(testOutput, outputCSV):

	flatFile=testOutput+"/flatfile.html"
	subprocess.call("./vdbench parse -i %s -c run interval reqrate rate resp MB/sec Read_rate Read_resp Write_rate Write_resp MB_read MB_write Xfersize Mkdir_rate Mkdir_resp Rmdir_rate Rmdir_resp Create_rate Create_resp Open_rate Open_resp Close_rate Close_resp Delete_rate Delete_resp Getattr_rate Getattr_resp Setattr_rate Setattr_resp Copy_rate Copy_resp Move_rate Move_resp compratio dedupratio cpu_used cpu_user cpu_kernel cpu_wait cpu_idle -f -o %s"%(flatFile,outputCSV),shell=True)

	return


# Run the plotting script
def callPlot():
	
	return

def main():
	
	#callPlot()
	outputDirectory=timeStamp(outputDir)
	param=outputDirectory+"/param"
        outputPlots=outputDirectory+"/plots"
        outputCSV=outputDirectory+"/parsedFlatfile.csv"

	createDirectories(outputDirectory,outputPlots,outputCSV)
	paramFile=createParam(outputDirectory)
	testOutput=runtest(paramFile,outputDirectory)
	parseFlat(testOutput,outputCSV)
	return 
	

main()

