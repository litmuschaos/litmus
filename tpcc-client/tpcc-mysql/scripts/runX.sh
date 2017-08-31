#!/bin/sh
set -u
set -x
set -e

#export LD_LIBRARY_PATH=/usr/local/mysql/lib/mysql/
export LD_LIBRARY_PATH=/usr/local/Percona-Server/lib/mysql/
MYSQLDIR=/usr/local/mysql-5.5.15-linux2.6-x86_64

ulimit -c unlimited

#DR="/mnt/fio320"
BD=/data/bench/back/tpc/tpc
#DR=/data/db/bench
DR="/data/bench/test"
#DR="/mnt/tachion/tpc1000w"
CONFIG="/etc/my.van.cnf"
#CONFIG="/etc/my.y.558.cnf"

WT=10
RT=10800

ROWS=80000000

#log2="/tachion/system/"
#log2="/data/bench/"
log2="$DR/"

# restore from backup
function restore {

#sysctl -w dev.flashcache.cache_all=0

mkdir -p $DR

rm -fr $DR/*
rm -f $log2/ib*

echo $log2
#for nm in ibdata1 ib_logfile0 ib_logfile1
#for nm in ibdata1 
#do
#rm -f $log2/$nm
#pagecache-management.sh cp $BD/$nm $log2
#done


cp -r $BD/mysql $DR
cp -r $BD/tpcc $DR
cp -r $BD/ibdata1 $log2

sync
echo 3 > /proc/sys/vm/drop_caches

chown mysql.mysql -R $DR
chown mysql.mysql -R $log2
chmod -R 755 $DR

#sysctl -w dev.flashcache.cache_all=1

}


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

for trxv in 2
do
for logsz in 1950M
do
#for par in  1 2 4 6 8 10 12 14 16 18 20 22 24 26 28 30 43
#for par in  13 26 39 52 65 78
for par in `seq 5 10 55`
#for par in 13 52 78 144
#for par in 1 2 4 8 16 32 64
do

runid="par$par.log$logsz.trx$trxv."

restore


$MYSQLDIR/bin/mysqld --defaults-file=$CONFIG --datadir=$DR --innodb_data_home_dir=$log2 --innodb_log_group_home_dir=$log2 --innodb_thread_concurrency=0 --innodb-buffer-pool-size=${par}GB --innodb-log-file-size=$logsz --innodb_flush_log_at_trx_commit=$trxv --log-error=$OUTDIR/mysql.error.log &

MYSQLPID=$!

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

iostat -mxt 10 $(($RT/10+1)) >> $OUTDIR/iostat.${runid}res &
PID=$!
vmstat 10  $(($RT/10+1)) >> $OUTDIR/vmstat.${runid}res &
PIDV=$!
$MYSQLDIR/bin/mysqladmin ext -i10  >> $OUTDIR/mysqladminext.${runid}res &
PIDMYSQLSTAT=$!
./innodb_stat.sh $RT  >> $OUTDIR/innodb.${runid}res &
PIDINN=$!


cp $CONFIG $OUTDIR
cp $0 $OUTDIR
mysqladmin variables >>  $OUTDIR/mysql_variables.res
sysctl -a >> $OUTDIR/sysctl.res
./tpcc_start localhost tpcc root "" 1000 32 10 $RT | tee -a $OUTDIR/tpcc.${runid}.out

set +e
kill -9 $PIDINN
kill -9 $PIDMYSQLSTAT
kill -9 `pidof mysqld`
set -e




done

done
done
