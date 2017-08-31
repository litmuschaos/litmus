#!/bin/sh
set -u
set -x
set -e

#export LD_LIBRARY_PATH=/usr/local/mysql/lib/mysql/
export LD_LIBRARY_PATH=/usr/local/Percona-Server/lib/mysql/
MYSQLDIR=/usr/local/Percona-Server-5.5.15-rel21.0-158.Linux.x86_64/
#MYSQLDIR=/usr/local/mysql-5.6.3-m6-linux2.6-x86_64

ulimit -c unlimited

#DR="/mnt/fio320"
DR="/data/fio/d"
#IDR="/data/bench/fio/d"
IDR="/data/fio/d"
LR="/data/fio/d"
#LR="/data/bench/fio/d"
CONFIG="/etc/my.559.cnf"

SERVER="R815"
NINST=1
MAXW=2400
WH=$(($MAXW/$NINST))
BP=$((120/$NINST))
BD=/data/bench/back/tpcc$WH

RT=7200


log2="$DR/"

# restore from backup
function restore {

for i in `seq 1 $NINST`
do
ssh $SERVER "mkdir -p $DR$i"
ssh $SERVER "rm -fr $DR$i/*"

ssh $SERVER "mkdir -p $LR$i"
ssh $SERVER "rm -fr $LR$i/*"

ssh $SERVER "mkdir -p $IDR$i"
ssh $SERVER "rm -fr $IDR$i/*"

ssh $SERVER "cp -r $BD/* $DR$i"

ssh $SERVER "cp -r $BD/ibdata1 $IDR$i"
ssh $SERVER "cp /tmp/ib_lru_dump $DR$i"
ssh $SERVER "sync; echo 3 > /proc/sys/vm/drop_caches"

ssh $SERVER "chown mysql.mysql -R $DR$i; chmod -R 755 $DR$i"
ssh $SERVER "chown mysql.mysql -R $LR$i; chmod -R 755 $LR$i"
done

}

function formatc {

set +e
ssh $SERVER "umount /data/fio"
ssh $SERVER "mdadm --stop /dev/md127"
ssh $SERVER "fio-detach /dev/fct0"
ssh $SERVER "fio-detach /dev/fct1"
ssh $SERVER "yes | fio-format -b 4096 /dev/fct0"
ssh $SERVER "yes | fio-format -b 4096 /dev/fct1"
ssh $SERVER "fio-attach /dev/fct0"
ssh $SERVER "fio-attach /dev/fct1"
ssh $SERVER "mdadm --create  --verbose /dev/md127 --level=0 --raid-devices=2 --chunk=128 /dev/fioa /dev/fiob"
ssh $SERVER "mkfs.xfs -s size=4096 /dev/md127"
ssh $SERVER "mount /dev/md127 /data/fio -o nobarrier"
set -e

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

function stratmysqld {


for i in `seq 1 $NINST`
do
PORT=$((3305+$i))
ssh $SERVER "numactl --cpunodebind=$(( ($i-1) * 8 / $NINST ))-$((($i-1)*8/$NINST+8/$NINST-1)) --interleave=all $MYSQLDIR/bin/mysqld --defaults-file=$CONFIG --datadir=$DR$i --innodb_thread_concurrency=0 --innodb-buffer-pool-size=${BP}G --innodb-log-file-size=$logsz --innodb_flush_log_at_trx_commit=$trxv --log-error=$DR$i/mysql.error.log --socket=/tmp/mysql$PORT --port=$PORT --innodb_data_home_dir=$IDR$i --innodb_log_group_home_dir=$LR$i --basedir=$MYSQLDIR &"

set +e

while true;
do
mysql -Bse "SELECT 1" mysql -h $SERVER -P $PORT

if [ "$?" -eq 0 ]
then
  break
fi

sleep 30

echo -n "."
done
set -e

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

formatc

for trxv in 2
do
for logsz in 4G
do
#for par in 12 24 36 48 60 72 
#for par in 12 18 24 30 36  
#for par in 4 6 8 10 12  
#for par in $((36/$NINST)) $((48/$NINST))
for par in $((48/$NINST))
do

runid="par$par.log$logsz.trx$trxv"

restore

stratmysqld

sleep 30

ssh -f $SERVER "iostat -dmx 10 $(($RT/10+1)) " >> $OUTDIR/iostat.$runid.res 
ssh -f $SERVER "dstat -t -v --nocolor 10 $(($RT/10+1))" > $OUTDIR/dstat_plain.$runid.res 

cp $0 $OUTDIR

for i in `seq 1 $NINST`
do
PORT=$((3305+$i))
mysqladmin variables -h $SERVER -P$PORT >>  $OUTDIR/mysql_variables.$PORT.res
./innodb_stat.sh $RT $SERVER $PORT >> $OUTDIR/innodb.${runid}.$i.res &
./tpcc_start $SERVER:$PORT tpcc$WH root "" $WH $par 10 $RT | tee -a $OUTDIR/tpcc.${runid}.$i.out &
done

sleep $(($RT+30))

set +e
ssh $SERVER "killall -s SIGKILL mysqld"
set -e

sleep 60
ssh $SERVER "cp ${DR}1/ib_lru_dump /tmp"



done

done
done
