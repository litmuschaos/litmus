cat $1 | awk ' BEGIN { } /Checkpoint age        / {st=$3 ;  print (st)/1024/1024 } '
