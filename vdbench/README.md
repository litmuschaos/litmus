# Storage Testing using vdbench

The module aims at automating storage tests using the vdbench tool. It is built with the intent of 
making the process easier and generic. 

## About vdbench

**Vdbench** is a disk I/O workload generator to be used for testing and benchmarking of existing
and future storage products. The objective of Vdbench is to generate a wide variety of controlled storage I/O workloads,
allowing control over workload parameters such as I/O rate, LUN or file sizes, transfer sizes,
thread count, volume count, volume skew, read/write ratios, read and write cache hit
percentages, and random or sequential workloads.

To learn more about vdbench : click [here](https://github.com/openebs/test-storage/blob/master/vdbench/vdbench.pdf)

## How to use the module

* Edit the YAML file to set the input paramters to *vdbench* suite
* Run the python script using this
```
python parseYAML.py
```
* Check the output of the test in the *newdir* folder
* To get a sample plot of basic paramters, execute
```
python plot.py
```
* The plots will be in the *graphs* folder

