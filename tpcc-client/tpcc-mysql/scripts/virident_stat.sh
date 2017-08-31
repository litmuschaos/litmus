echo 0 >  /proc/driver/virident/vgcdrivea0/bdev

while [ true ]
do

cat /proc/driver/virident/vgcdrivea0/bdev 
cat /proc/driver/virident/vgcdrivea0/gc
sleep 10

done

