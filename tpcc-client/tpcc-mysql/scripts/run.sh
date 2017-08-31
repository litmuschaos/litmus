#!/bin/sh
set -u
set -x
set -e

export LD_LIBRARY_PATH=/usr/local/mysql/lib/mysql/

DR="/mnt/fio320/bench"
BD="/data/back/fio320/bench"

WT=10
RT=10800

ROWS=80000000

#log2="/data/log/"
log2="$DR/"

# restore from backup

rm -fr $DR/*

echo $log2
#for nm in ibdata1 ib_logfile0 ib_logfile1
for nm in ibdata1 
do
rm -f $log2/$nm
pagecache-management.sh cp $BD/$nm $log2
done


cp -r $BD/mysql $DR
pagecache-management.sh cp -r $BD/tpcc $DR

sync
echo 3 > /proc/sys/vm/drop_caches

chown mysql.mysql -R $DR
chown mysql.mysql -R $log2


function waitm {

while [ true ]
do

mysql -e "set global innodb_max_dirty_pages_pct=0" mysql

wt=`mysql -e "SHOW ENGINE INNODB STATUS\G" | grep "Modified db pages" | sort -u | awk '{print $4}'`
if [[ "$wt" -lt 100 ]] ;
then
mysql -e "set global innodb_max_dirty_pages_pct=90" mysql
break
fi

echo "mysql pages $wt"
sleep 10
done

}

#for par in  1 2 4 6 8 10 12 14 16 18 20 22 24 26 28 30 43
for par in  16
do

/usr/local/mysql/libexec/mysqld --defaults-file=/etc/my.cnf --datadir=$DR  --innodb_data_home_dir=$log2 --innodb_log_group_home_dir=$log2 --innodb_thread_concurrency=0 &
set +e

while true;
do
mysql -Bse "SELECT 1" mysql

if [ "$?" -eq 0 ]
then
  break
fi

sleep 30

echo -n "."
done
set -e


./tpcc_start localhost tpcc root "" 1000 $par 10 7200 | tee -a tpcc.threads${par}.out


waitm


mysqladmin  shutdown

done
