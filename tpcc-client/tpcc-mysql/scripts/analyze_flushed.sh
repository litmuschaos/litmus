cat $1 | awk ' BEGIN { df=0 ; dl=0; } /Innodb_buffer_pool_pages_flushed[\s]/ { df=$4 }  /Innodb_buffer_pool_pages_LRU_flushed/ {  dl=$4; print df,dl }  '
