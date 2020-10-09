#!/bin/bash
cd litmus-portal || exit

if [[ $(git diff "$1" "$2"  "$3" | wc -l) = 0 && $4 = "" ]];
then
  echo hello
elif [[ $(git diff "$1" "$2"  "$3" | wc -l) != 0 && $4 != "" ]]
then
  ${4}
fi
