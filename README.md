# Overview

[![Build Status](https://travis-ci.org/openebs/test-storage.svg?branch=master)](https://travis-ci.org/openebs/test-storage)
[![Docker Pulls](https://img.shields.io/docker/pulls/openebs/tests-vdbench.svg)](https://hub.docker.com/r/openebs/tests-vdbench/)

Containers for running performance benchmarking tests on Persistent Storage Volumes. 

# Contributing 

## Setting up development environement

### Pre-requisites

- Linux Host ( say Ubuntu )
- Virtual Box 
- Vagrant
- Git
- Create a developement folder ( say $dev-folder, in my case it is /home/kmova/github.com/openebs )

### Launch Development VM

In your linux host
```
cd $dev-folder
sudo git clone https://github.com/openebs/test-storage.git
cd $dev-folder/test-storage
vagrant up
vagrant ssh
```

### Develop and Test your changes. 

```
cd $dev-folder/test-storage
vagrant ssh
cd /vagrant/fio
```


