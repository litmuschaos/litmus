#!/usr/bin/expect
spawn htpasswd -c /etc/origin/htpasswd admin 
expect "New password:"  
send -- "admin\r"
#send -- "\r" 
expect "Re-type new password:" 
send -- "admin\r"
send -- "\r"
spawn oc login -u admin 
expect "Password:"
send -- "admin\r"
interact