#!/bin/bash 
url_prefix="old/"
cd /data/git/whatsapp
node override_script.js $url_prefix$1 $url_prefix$2 >> log.txt 2>&1
sleep 5s
git add -A
git commit -m"js更新"
git push