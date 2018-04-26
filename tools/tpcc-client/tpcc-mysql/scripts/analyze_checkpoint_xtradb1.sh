#cat $1 | awk ' BEGIN { } /Log sequence number/ {st=$4 ; print (st)/1024/1024 } '
cat $1 | awk ' BEGIN { } /Last checkpoint at/ {st=$4 ; print (st)/1024/1024 } '
