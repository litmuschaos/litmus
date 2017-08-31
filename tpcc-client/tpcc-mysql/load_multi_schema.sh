export LD_LIBRARY_PATH=/data/opt/bin/mysql-5.7.11-linux-glibc2.5-x86_64/lib/
DBNAME=$1
WH=$2
NSCHEMA=$3
HOST=127.0.0.1
STEP=5

schema=0

while [ $schema -lt $NSCHEMA ]
do
 DBFULLNAME=${DBNAME}_${schema}
 echo "Creating schema $DBFULLNAME"
 mysqladmin -h $HOST -f drop $DBFULLNAME
 mysqladmin -h $HOST create $DBFULLNAME
 mysql -h $HOST $DBFULLNAME  < create_table.sql 
 mysql -h $HOST $DBFULLNAME  < add_fkey_idx.sql
 mkdir -p out

./tpcc_load -h $HOST -d $DBFULLNAME -u root -p "" -w $WH -l 1 -m 1 -n $WH >> out/1_$DBFULLNAME.out &

x=1

while [ $x -le $WH ]
do
 echo $x $(( $x + $STEP - 1 ))
./tpcc_load -h $HOST -d $DBFULLNAME -u root -p "" -w $WH -l 2 -m $x -n $(( $x + $STEP - 1 ))  >> out/2_$DBFULLNAME.$x.out &
./tpcc_load -h $HOST -d $DBFULLNAME -u root -p "" -w $WH -l 3 -m $x -n $(( $x + $STEP - 1 ))  >> out/3_$DBFULLNAME.$x.out &
./tpcc_load -h $HOST -d $DBFULLNAME -u root -p "" -w $WH -l 4 -m $x -n $(( $x + $STEP - 1 ))  >> out/4_$DBFULLNAME.$x.out &
 x=$(( $x + $STEP ))
done

for job in `jobs -p`
do
echo $job
    wait $job
done

schema=$(( $schema + 1 ))

done
