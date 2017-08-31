TIMESLOT=1

if [ -n "$2" ]
then
TIMESLOT=$2
echo "Defined $2"
fi

cat $1 | grep -v HY000 | grep -v payment | grep -v neword | awk -v timeslot=$TIMESLOT ' BEGIN { FS="[,():]"; s=0; cntr=0; aggr=0 } /MEASURING START/ { s=1} /STOPPING THREADS/ {s=0} /0/ { if (s==1) { cntr++; aggr+=$2; } if ( cntr==timeslot ) { printf ("%d %3f\n",aggr,$5) ; cntr=0; aggr=0  }  } '

