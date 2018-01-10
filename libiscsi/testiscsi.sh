#!/bin/bash

#######################
##   FUCNTION DEF    ##       
#######################

function show_help(){
    cat << EOF
Usage: $(basename "$0") --ctrl-svc-ip <ipaddress> 
       $(basename "$0") --help

-h|--help                Display this help and exit  
--ctrl-svc-ip 		 IP Address of the iSCSI target portal
EOF
}

function header(){
    file=$1
    testSuite=$2
    printf "###############################################\n" >> $file
    printf "\n" >> $file
    printf "SUITE : $testSuite\n" >> $file
    printf "\n" >> $file
}

function runtest(){
    # Passed args
    tp=$1;lun=$2;tfile=$3;lpath=$4
 
    # Prepare log location
    mkdir -p $lpath

    # Discover iscsi target
    iqn=`iscsi-ls iscsi://$tp | cut -d " " -f 1 | sed s/'Target:'//g`

    # Execute each libiscsi test suite one-by-one 
    while read -r line || [[ -n "$line" ]];
    do
      iscsi-test-cu --test=$line iscsi://$tp/$iqn/$lun --dataloss \
--allow-sanitize 2>&1 | tee -a $lpath/$line.log
    done < $tfile
}

function logparse(){
    # Passed args
    lpath=$1;out=$2

    # Counter for passed/failed tests
    t_p_count=0
    t_f_count=0

    for i in `ls $lpath | grep .log`
    do
      {
        suite=`echo $i | sed s/'.log'//g`
        header $out $suite;

        p_c=`cat $lpath/$i | grep Test | grep -i passed | wc -l`
        t_p_count=`expr $t_p_count + $p_c`
        cat $lpath/$i | grep Test | grep -i passed | \
awk '{printf("%-5s %20s %10s\n", $1, $2, "PASSED")}' >> $out

        f_c=`cat $lpath/$i | grep Test | grep -i failed | wc -l`
        t_f_count=`expr $t_f_count + $f_c`
        cat $lpath/$i | grep Test | grep -i failed | \
awk '{printf("%-5s %20s %10s\n", $1, $2, "FAILED")}' >> $out
      }
    done
    
    printf "\nNo of tests passed:%s  No of tests failed:%s\n" $t_p_count $t_f_count
}

#######################
##   TEST VARIABLES  ##
#######################

# libiscsi params
testfile=run-tests.out
lunid=0

# Logging params
hostpath=/mnt/logs
lg_pfx="libiscsi"
lg_sfx=`echo $(mktemp) | cut -d '.' -f 2`
logdir="$hostpath/$lg_pfx-$lg_sfx"
resultfile="$logdir/SUMMARY.log"

#######################
## VERIFY ARGUMENTS  ##
#######################

if (($# == 0)); then
    show_help
    exit 2
fi

########################
##   RUN TEST STEPS   ##
########################

while [[ $# -gt 0 ]]
do
    case $1 in 
         -h|--help) # Call a "show_help" function, then exit
                    show_help
                    exit
                    ;;   

         --ctrl-svc-ip) # Ensure the portal is specified 
                        # Check for other params
                        if [ -n "$2" ]; then
                            portal=$2
                            runtest $portal $lunid $testfile $logdir;
                            logparse $logdir $resultfile;
                            exit
                        else 
                            echo "No target portal specified, check usage"
                            show_help
                            exit 2 
                        fi
                        ;; 
         
         *) 		# Undesired arguments                        
                        echo "Incorrect argument provided, please check usage"
                        show_help
                        exit 2
                        ;;
    esac	
done 


