const fs = require('fs');
const path = require('path');
const https = require("https");

/**
*
* @param uri 下载文件路径
* @param dest
* @returns {Promise<string>}
*/
const downloadFileAsync = (uri, dest) => {
var options = {
    url: uri,  
    encoding: "utf8" ,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36',
        referer: 'https://bbs.125.la/'
    }
};
	
    return new Promise((resolve, reject) => {
        // 确保dest路径存在
        const file = fs.createWriteStream(dest);
        https.get(uri, (res) => {
            if (res.statusCode !== 200) {
                reject(res.statusCode);
                return;
            }
            res.on('end', () => {
                console.log('download end');
            });
            // 进度、超时等
            file.on('finish', () => {
                console.log('finish write file')
                file.close(resolve);
            }).on('error', (err) => {
                fs.unlink(dest);
                reject(err.message);
            })

            res.pipe(file);
        });
    });
}
const target = "/data/git/js/serviceworker.js"
let url = "https://web.whatsapp.com/serviceworker.js";

downloadFileAsync(url, target).then(() => {
console.log("download   success")


}).catch(console.log)