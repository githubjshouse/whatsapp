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
    return new Promise((resolve, reject) => {
        // 确保dest路径存在
        const file = fs.createWriteStream(dest);
        https.get(uri, (res) => {
            if (res.statusCode !== 200) {
                reject(response.statusCode);
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

downloadFileAsync("https://web.whatsapp.com/bootstrap_main.bae38defaa40d6391be1.js", path.join(__dirname,"old/aaa.js")).then(res=>{


        console.log(123)
        }).catch(console.error)