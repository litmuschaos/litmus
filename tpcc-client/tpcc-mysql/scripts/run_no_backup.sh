#!/bin/sh
set -u
set -x
set -e

#export LD_LIBRARY_PATH=/usr/local/mysql/lib/mysql/
export LD_LIBRARY_PATH=/usr/local/Percona-Server/lib/mysql/

ulimit -c unlimited

#DR="/mnt/fio320"
BD=/mnt/tachion/tpc1000w
#DR=/data/db/bench
DR="/mnt/fio320/tpc1000w"

WT=10
RT=10800

ROWS=80000000

#log2="/data/log/"
log2="$DR/"

# restore from backup


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

#for par in  1 2 4 6 8 10 12 14 16 18 20 22 24 26 28 30 43
for par in   13 26 39 52 65 78
#for par in  24
do
export OS_FILE_LOG_BLOCK_SIZE=4096
/usr/local/mysql/libexec/mysqld --defaults-file=/etc/my.cnf --datadir=$DR  --innodb_log_group_home_dir=$log2 --innodb_thread_concurrency=0 --innodb-buffer-pool-size=${par}GB &


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




iostat -dx 5 2000 >> $OUTDIR/iostat.${par}res &
PID=$!
vmstat 5 2000 >> $OUTDIR/vmstat.${par}res &
PIDV=$!
./tpcc_start localhost tpcc1000 root "" 1000 24 10 3600 | tee -a $OUTDIR/tpcc.${par}.out
kill -9 $PID
kill -9 $PIDV

waitm


mysqladmin  shutdown
rm -fr /mnt/fio320/tpc1000w ; cp -r /mnt/tachion/back/tpc1000w /mnt/fio320/
sync

done
