# Script to parse the YAML file and to set the 
# paramters in the paramFile for the vdbench test suite

## Inputs like location of parameter file, output directory, plots, csv are hardcoded right now.
## It is going to be generic shortly

import yaml
import subprocess

paramFile="paramFile"
outputDir="newdir"

# Speicfy the destination of paramFile and output directories

def createParam():
	inputFile=open("input.yml",'r')
	dataMap=yaml.load(inputFile)

	outputFile=open('paramFile','w+')

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
	return


# Run the vdbench test suite
def runtest():
	#subprocess.call(["ls", "-l"])
	subprocess.call("./vdbench -f %s -o %s" %(paramFile,outputDir),shell=True)
	return

# Run the plotting script
def callPlot():
	subprocess.call("python plot.py",shell=True)
	return

def main():
	createParam()
	runtest()
	callPlot()
	return 
	

main()

