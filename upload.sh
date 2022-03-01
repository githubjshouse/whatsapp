#!/bin/bash 
cd /data/git/js
node override_script.js $1 $2 $3 $4 $5>> log.txt 2>&1
