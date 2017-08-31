cat $1 | awk ' BEGIN { } /Log sequence number/ {st=$4 } /Log flushed up to/ { ed=$5; print (st-ed) } '
