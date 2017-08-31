cat $1 | awk ' BEGIN { } /Log sequence number/ {st=$4 } /Last checkpoint at/ { ed=$4; print (st-ed)/1024/1024 } '
