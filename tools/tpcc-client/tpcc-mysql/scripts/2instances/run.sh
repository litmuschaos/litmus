#!/bin/sh
set -u
set -x
set -e

export LD_LIBRARY_PATH=/usr/local/mysql/lib/mysql/

BD="/mnt/fio320/back/tpcc500w"
DR1="/mnt/tachion/tpcc500wi1"
DR2="/mnt/tachion/tpcc500wi2"

BD="/mnt/tachion/back/tpcc500w"
DR1="/mnt/fio320/tpcc500wi1"
DR2="/mnt/fio320/tpcc500wi2"

WT=10
RT=10800


# restore from backup

function restore_backup {
rm -fr $DR1
rm -fr $DR2

cp -r $BD $DR1
cp -r $BD $DR2

sync
echo 3 > /proc/sys/vm/drop_caches

chown mysql.mysql -R $DR1
chown mysql.mysql -R $DR2

}

function waitm {

while [ true ]
do

mysql -e "set global innodb_max_dirty_pages_pct=0" mysql -S /tmp/mysql$1.sock

wt=`mysql -e "SHOW ENGINE INNODB STATUS\G"  -S /tmp/mysql$1.sock | grep "Modified db pages" | sort -u | awk '{print $4}'`
if [[ "$wt" -lt 100 ]] ;
then
mysql -e "set global innodb_max_dirty_pages_pct=90" mysql -S /tmp/mysql$1.sock
break
fi

echo "mysql pages $wt"
sleep 10
done

}

function wait_for_mysql {

set +e

while true;
do
mysql -Bse "SELECT 1" mysql -S /tmp/mysql$1.sock

if [ "$?" -eq 0 ]
then
  break
fi

sleep 30

echo -n "."
done
set -e

}

function setup_dirs {

# Determine run number for selecting an output directory
RUN_NUMBER=-1

if [ -f ".run_number" ]; then
  read RUN_NUMBER < .run_number
fi

if [ $RUN_NUMBER -eq -1 ]; then
        RUN_NUMBER=0
fi

OUTDIR=res$RUN_NUMBER
mkdir -p $OUTDIR

RUN_NUMBER=`expr $RUN_NUMBER + 1`
echo $RUN_NUMBER > .run_number

cp /etc/my.cnf $OUTDIR

}

restore_backup
setup_dirs

#for par in  1 2 4 6 8 10 12 14 16 18 20 22 24 26 28 30 43
for par in  6500MB 13GB 26GB 39GB 52GB 65GB 78GB
do

/usr/local/mysql/libexec/mysqld --defaults-file=/etc/my.cnf --datadir=$DR1 --port=3306 --socket=/tmp/mysql1.sock --innodb_thread_concurrency=0 --innodb-buffer-pool-size=${par} --log-error=error1.log &
/usr/local/mysql/libexec/mysqld --defaults-file=/etc/my.cnf --datadir=$DR2 --port=3307 --socket=/tmp/mysql2.sock --innodb_thread_concurrency=0 --innodb-buffer-pool-size=${par} --log-error=error2.log &

wait_for_mysql 1
wait_for_mysql 2


iostat -dmx 5 2000 >> $OUTDIR/iostat.${par}res &
PID=$!
vmstat 5 2000 >> $OUTDIR/vmstat.${par}res &
PIDV=$!
./tpcc_start 127.0.0.1:3306 tpcc500w root "" 500 12 10 3600 | tee -a $OUTDIR/tpcc3306.bp${par}.out &
./tpcc_start 127.0.0.1:3307 tpcc500w root "" 500 12 10 3600 | tee -a $OUTDIR/tpcc3307.bp${par}.out &

sleep 3700

waitm 1

kill -9 $PID
kill -9 $PIDV


mysqladmin  shutdown -S /tmp/mysql1.sock
mysqladmin  shutdown -S /tmp/mysql2.sock

done
