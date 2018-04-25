TIMESLOT=1

if [ -n "$2" ]
then
TIMESLOT=$2
echo "Defined $2"
fi


for i in 1 2 4 8 16 32 64
do
cat tpcc.par$i.log4G.trx2..out | grep -v HY000 | grep -v payment | grep -v neword | awk -v timeslot=$TIMESLOT -v thr=$i ' BEGIN { FS="[,():]"; s=0; cntr=0; aggr=0 } /MEASURING START/ { s=1} /STOPPING THREADS/ {s=0} /0/ { if (s==1) { cntr++; aggr+=$2; } if ( cntr==timeslot ) { printf ("%d %d %d %3f innodb\n",thr,$1,aggr,$5) ; cntr=0; aggr=0  }  } '
done

