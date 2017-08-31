cat $1 | grep LSN_ratio_expected | awk ' BEGIN {s=0} { print s,$4; s++ } ' > /tmp/1.rr
cat $1 | grep -P "LSN_ratio[\s]" | awk ' BEGIN {s=0} { print s,$4; s++ } ' > /tmp/2.rr
cat $1 | grep Innodb_log_write_sleeps | awk ' BEGIN {s=0;i=0} { print i,$4-s; s=$4;i++ } ' > /tmp/3.rr
cat $1 | grep -P "Innodb_log_write_sleep_prob" | awk ' BEGIN {s=0} { print s,$4; s++ } ' > /tmp/4.rr
cat $1 | grep -P "Innodb_break_ratio" | awk ' BEGIN {s=0} { print s,$4; s++ } ' > /tmp/5.rr
cat $1 | grep -P "Innodb_break_value" | awk ' BEGIN {s=0} { print s,$4; s++ } ' > /tmp/6.rr
cat $1 | grep -P "Innodb_tacts_to_flush_dirty" | awk ' BEGIN {s=0} { print s,$4; s++ } ' > /tmp/7.rr
cat $1 | grep -P "Innodb_tacts_to_fill_target" | awk ' BEGIN {s=0} { print s,$4; s++ } ' > /tmp/8.rr
cat $1 | grep -P "Innodb_EMA_lsn_grow" | awk ' BEGIN {s=0} { print s,$4; s++ } ' > /tmp/9.rr
cat $1 | grep -P "Innodb_EMA_ckpt_lsn_grow" | awk ' BEGIN {s=0} { print s,$4; s++ } ' > /tmp/10.rr
cat $1 | grep -P "Innodb_buffer_pool_pages_flushed[\s]" |  awk ' BEGIN {s=0;i=0} { print i,$4-s; s=$4;i++ } ' > /tmp/11.rr
cat $1 | grep -P "Innodb_buffer_pool_pages_flushed_neighbors[\s]" |  awk ' BEGIN {s=0;i=0} { print i,$4-s; s=$4;i++ } ' > /tmp/12.rr
cat $2 | awk ' BEGIN {i=0;sp=0 } /Last checkpoint at/  { st=$4 ; print i, (st)/1024/1024,(st-sp)/1024/1024; i++; sp=st } ' > /tmp/13.rr

join /tmp/1.rr /tmp/2.rr > /tmp/a2.rr
join /tmp/a2.rr /tmp/3.rr > /tmp/a3.rr
join /tmp/a3.rr /tmp/4.rr > /tmp/a4.rr
join /tmp/a4.rr /tmp/5.rr > /tmp/a5.rr
join /tmp/a5.rr /tmp/6.rr > /tmp/a6.rr
join /tmp/a6.rr /tmp/7.rr > /tmp/a7.rr
join /tmp/a7.rr /tmp/8.rr > /tmp/a8.rr
join /tmp/a8.rr /tmp/9.rr > /tmp/a9.rr
join /tmp/a9.rr /tmp/10.rr > /tmp/a10.rr
join /tmp/a10.rr /tmp/11.rr > /tmp/a11.rr
join /tmp/a11.rr /tmp/12.rr > /tmp/a12.rr
join /tmp/a12.rr /tmp/13.rr > /tmp/a13.rr
echo "time LSN_ratio_expected LSN_ratio sleeps sleep_prob break_ratio break_value tacts_to_flush_dirty tacts_to_fill_target EMA_lsn EMA_ckpt_lsn  flushed flushed_neighbors checkpoint checkpoint_delta"
cat /tmp/a13.rr
