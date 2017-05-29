# Storage Testing using vdbench

The module aims at automating storage tests using the vdbench tool. It is built with the intent of 
making the process easier and generic. 

## About vdbench

**Vdbench** is a disk I/O workload generator to be used for testing and benchmarking of existing
and future storage products. The objective of Vdbench is to generate a wide variety of controlled storage I/O workloads,
allowing control over workload parameters such as I/O rate, LUN or file sizes, transfer size,
thread count, volume count, volume skew, read/write ratios, read and write cache hit
percentages, and random or sequential workloads.

To learn more about vdbench : click [here](https://github.com/openebs/test-storage/blob/master/vdbench/vdbench.pdf)

## Editing the YAML file

* Set the input paramters for the vdbench test suite 
- **Storage definition** (SD): Name, Lun, Size, Anchor, Depth, etc
- **Worload Definition** (WD): Name, IORate, ReadPercentage, TransferSize, etc
- **Run definition** (RD): Name, Duration, Interval, etc

## How to use the module

* Edit the YAML file to set the input paramters to *vdbench* suite
* Run the python script using the command
```
python runVdbench.py <input-path-to-YAML-file>
```
#### The output files will in the *output_{timestamp}* folder. This folder consists of the following files:
- *paramFile* : The input paramters for vdbench
- *parsedFlatfile.CSV*: The CSV formatted version of flatfile.html 

#### The folder consists of the following sub-directories:
- *testOutput* : The output files of the vdbench test suite in HTML format
- *plots*: Sample plots generated 

## About the Code

Libraries used:

* **yaml**: For read/write of YAML files
* **pandas**: For accessing,reading, parsing CSV files and creating data frames
* **matplotlib**: Plotting graphs and data visualization


