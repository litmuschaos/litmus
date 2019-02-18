#!/bin/sh
ssh -i openshift.ppk centos@ec2-3-80-4-203.compute-1.amazonaws.com 'sudo su -c "ssh-keygen -t rsa -N \"\" -f ~/.ssh/id_rsa"'
sudo su -c "yum -y install wget git net-tools bind-utils yum-utils iptables-services bridge-utils bash-completion kexec-tools sos psacct"
sudo su -c "yum -y update"
sudo su -c "yum -y install docker-1.13.1"
sudo su -c "yum -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm"
sudo su -c "sed -i -e "s/^enabled=1/enabled=0/" /etc/yum.repos.d/epel.repo"
sudo su -c "yum -y --enablerepo=epel install ansible pyOpenSSL"
sudo su -c "cat <<EOF > /etc/sysconfig/docker-storage-setup

DEVS=/dev/xvdf

VG=docker-vg

EOF"
sudo su -c "docker-storage-setup"
sudo sed -i '/OPTIONS=.*/c\OPTIONS="--selinux-enabled --insecure-registry 172.30.0.0/16"' /etc/sysconfig/docker
sudo su -c "eval 'ssh-agent'"

master() {

    sudo su -c "yum -y --enablerepo=epel install python-pip"
    sudo su -c "sudo -H pip install ansible==2.6.5"
    sudo su -c "git clone https://github.com/openshift/openshift-ansible.git"
    sudo su -c "cd ; cd /home/centos/openshift-ansible ; git checkout release-3.10"
    sudo su -c "yum install -y expect"

}

if [ "$1" == "master" ];then
  master 
fi


