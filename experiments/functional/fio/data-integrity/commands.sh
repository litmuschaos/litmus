cd datadir
error_check()
{
	if [ $? != 0 ]
	then
		echo "error caught"
		exit 1
	fi
}

perform_data_write()
{
        value=space_left
	i=0
	while [ $i -le $value ]
	do
		ls -all
		error_check
		touch file$i
		error_check
		dd if=/dev/urandom of=file$i bs=4k count=5000
		error_check
		sync
		read_data
		i=$(( i + 1 ))
		error_check
	done
}
read_data()
{
	touch testfile
	error_check
	echo "OpenEBS Released newer version"
	error_check
	cat testfile
	error_check
	rm testfile
}
perform_data_write
