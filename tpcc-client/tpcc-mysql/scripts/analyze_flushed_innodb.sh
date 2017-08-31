cat $1 | awk ' BEGIN { df=0 ; dl=0; } /Innodb_buffer_pool_pages_flushed/ { df=$4 ; print df }  '
