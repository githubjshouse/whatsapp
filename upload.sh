#!/bin/bash 
node override_script.js $1 $2 >> log.txt 2>&1
sleep 5s
#cd /data/git/ae
#git add -A
#git commit -m"js更新"
#git push