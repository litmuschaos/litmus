sysctl -w dev.flashcache.zero_stats=1

while [ true ]
do

dmsetup status flashcache 
sleep 10

done

