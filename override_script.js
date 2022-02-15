const fs = require('fs');
const path = require('path');
const https = require("https");
const { exec } = require('child_process');

/**
 * 执行cmd命令
 * @param cmd
 * @returns {Promise<unknown>}
 */
function execCommand(cmd) {
    return new Promise((resolve, reject) => {
        const result = exec(cmd);
        result.stdout.on('data', resolve);
        result.stderr.on('data', reject);
        result.on('close', (code) => {
            console.log("命令进程结束", { code, cmd });
        });
    })
}

process.on('exit', (code) => {
    console.log('node进程结束: ', { code });
});
/**
 * 执行当前git仓库的提交
 * @param fileName
 */
const gitPush = (fileName) => {
    execCommand('git rev-parse --is-inside-work-tree')
        .then(res => {
            if (res.trim() === "true") {
                console.log("当前目录为git仓库，执行git提交并推送...")
                execCommand(`git add --all && git commit -m 'update:js更新 ${new Date().toLocaleString()}"' && git push`).then(res => {
                    console.log(res)
                }).catch(console.error)
            }
        })
        .catch(e => {
            const code = parseInt(Math.random() * 50);
            console.log(`当前目录非git仓库`)
        })
}


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
/**
 * 执行js写入的主方法
 * @param param
 */
const override = (param) => {
    const { source, target, key, fileName } = param;
    console.log("\n\n\n-------------------------------------------------------------------------------------------------------------------------")
    // 读取文件
    console.log(`开始读取文件->${source}`)
    fs.readFile(source, 'utf8', function (err, data) {
        if (err) throw err;
        console.log(`文件{ ${source} }读取成功`)
        console.table(param)
        console.log(`正在创建输出流到->${target}`)
        const file = fs.createWriteStream(target);
        switch (key) {
            case "bootstrap_main": {
                data.split("\n").forEach((str, index) => {
                    console.log("当前读取到行", index + 1)
                    if (str.startsWith('/*') && index == 0) {
                        return file.write(`console.log("[override] ${fileName}",new Date().toLocaleString());${str}`);
                    }
                    switch (index) {
                        case 1: {
                            const split = str.split(";");
                            split.forEach((s, i) => {
                                if (s.indexOf("sendTextMsgToChat=") > -1) {
                                    const match = /(.*)(sendTextMsgToChat=)(.*)$/.exec(s);
                                    if (match && match.length) {
                                        const result = [];
                                        for (let j = 1; j < match.length; j++) {
                                            if (j === 3) {
                                                let exec = /(function\()([a-zA-Z,]{5})(=\{\}\)\{)(.*)$/.exec(match[j]);
                                                if (exec) {
                                                    result.push("async ".concat(`${exec[1]}${exec[2]}${exec[3].slice(0, 3)},tic){`).concat(`try{if(_wext.tic&&!tic){t=await _wext.tic(${exec[2]})}}catch(err){return}`).concat(match[j].slice(19)))
                                                } else {
                                                    exec = /(function\()(.*)(\).*)(let|const)(\s*\w*)(.*)/.exec(match[j]);
                                                    result.push("async ".concat(`${exec[1]}${exec[2]},tic${exec[3] + exec[4] + exec[5] + exec[6]};`).concat(`try{if(_wext.tic&&!tic){t=await _wext.tic(${exec[2]},${exec[5]})}}catch(err){return}`))
                                                }
                                            } else {
                                                result.push(match[j])
                                                if (j === 2) {
                                                    result.push("_wext.stmtc=")
                                                }
                                            }
                                        }
                                        split[i] = result.join("")
                                    }
                                } else if (s.indexOf("=this.parseContact") > -1) {
                                    const variable = s.slice(5, 12).replace("const ", "");
                                    if (variable.length === 1) {
                                        split[i] = s.concat(`;_wext.opc(${variable})`)
                                    }
                                } else if (s.indexOf("handleActionMsg:") > -1) {
                                    const exec = /(=this.parseMsg\()(.*)[,]/.exec(split[i + 1])
                                    split[i + 1] += `;_wext.opm(${exec[2]})`
                                }
                            })
                            file.write("\n".concat(split.join(";")));


                            break
                        }
                        case 12: {
                            const split = str.split(";");
                            split.forEach((s, i) => {
                                if (s.indexOf("default.MSG_TYPE.BUTTONS_RESPONSE:return") > -1) {
                                    const match = /(.*)(default.MSG_TYPE.BUTTONS_RESPONSE:)(.*)/.exec(s)
                                    if (match && match.length) {
                                        const result = [];
                                        for (let j = 1; j < match.length; j++) {
                                            if (j === 2) {
                                                result.push(match[j].concat(`_wext.orce(${/(.*msg:)(.*)(,contact.*)/.exec(s)[2]});`))
                                            } else
                                                result.push(match[j])
                                        }
                                        split[i] = result.join("")
                                    }
                                }
                            })
                            file.write("\n".concat(split.join(";")));
                            break
                        }

                        default:
                            file.write("\n" + str)
                    }
                })
                file.write(`window.classNameMap={"text":"_1Gy50","chatList":"_3uIPm","tipsContainer":"_3z9_h","tipsTitle":"_2z7gr","btnSend":"_4sWnG","sendButtonContainer":"_1Ae7k","messagePane":"_33LGR","avatarImage":"_8hzr9","app":"_1XkO3"};sessionStorage.setItem('classNameMap', '{"text":"_1Gy50","chatList":"_3uIPm","tipsContainer":"_3z9_h","tipsTitle":"_2z7gr","btnSend":"_4sWnG","sendButtonContainer":"_1Ae7k","messagePane":"_33LGR","avatarImage":"_8hzr9","app":"_1XkO3"}')`)
                break
            }
            case "bootstrap_qr": {
                data.split("\n").forEach((str, index) => {
                    console.log("当前读取到行", index + 1)
                    if (str.startsWith('/*') && index == 0) {
                        return file.write(`console.log("[override] ${fileName}",new Date().toLocaleString());${str}`);
                    }
                    switch (index) {
                        case 1: {
                            const split = str.split(";");
                            split.forEach((s, i) => {
                                if (s.indexOf("createOrMerge") > -1) {
                                    const match = /(.*)(createOrMerge\(.+\))(,)(.*)/.exec(s)
                                    if (match && match.length) {
                                        const result = [];
                                        for (let j = 1; j < match.length; j++) {
                                            if (j === 2) {
                                                result.push(match[j])
                                                result.push(`,_wext.obam(${match[j + 2].charAt(0)})`)
                                            } else
                                                result.push(match[j])
                                        }
                                        split[i] = result.join("")
                                    }
                                }
                            })
                            file.write("\n".concat(split.join(";")));
                            break
                        }
                        case 42:
                        case 44: {
                            const split = str.split(";");
                            split.forEach((s, i) => {
                                if (s.indexOf("n.pushname") > -1) {
                                    const match = /(.*)(,)(.\.gadd)(.*)/.exec(s)
                                    const result = [];
                                    for (let j = 1; j < match.length; j++) {
                                        if (j === 3) {
                                            result.push(`_wext.obam(${match[j].charAt(0)}),`)
                                        }
                                        result.push(match[j])
                                    }
                                    split[i] = result.join("")
                                }
                            })
                            file.write("\n".concat(split.join(";")));
                            break
                        }
                        case 59:
                        case 61: {
                            const split = str.split(";");
                            split.forEach((s, i) => {
                                if (s.indexOf("this.msgs.msgLoadState.contextLoaded") > -1) {
                                    const match = /(.*)(,)(this.addChild)(.*)/.exec(s)
                                    const result = [];
                                    for (let j = 1; j < match.length; j++) {
                                        if (j === 3) {
                                            const p = /(.*\()(.*)/.exec(match[j + 1])[2];
                                            result.push(`_wext.obac(${p.replace(")", "")};`)
                                        }
                                        result.push(match[j])
                                    }
                                    split[i] = result.join("")
                                } else if (s.indexOf("change:expiration") > -1 && s.indexOf("this.updateMuteExpiration") > -1) {
                                    const arr = s.split(",")
                                    const p = /(.*\()(.*)/.exec(arr[8])[2];
                                    arr[8] = `${arr[8]},_wext.oaac(${/(.*\()(.*)/.exec(arr[8])[2].replace(")", "")}`
                                    split[i] = arr.join(",")
                                } else if (s.indexOf("onNewMsg") > -1 && s.indexOf("productMsgs") > -1) {
                                    const match = /(.*\()(.*)(\)\{)(.*)/.exec(s)
                                    const result = [];
                                    for (let j = 1; j < match.length; j++) {
                                        if (j === 4) {
                                            result.push(`_wext.onm&&_wext.onm(${match[j - 2]});`)
                                        }
                                        result.push(match[j])
                                    }
                                    split[i] = result.join("")
                                } else if (s.indexOf('"change:phone"') > -1) {
                                    const match = /(.*)(!function)(.*)/.exec(s)
                                    const result = [];
                                    for (let j = 1; j < match.length; j++) {
                                        if (j === 2) {
                                            result.push(`_wext.ocp(this.phone);`)
                                        }
                                        result.push(match[j])
                                    }
                                    split[i] = result.join("")
                                } else if (s.indexOf("onChatActiveChange") > -1 && s.indexOf("getUserSubtitleText") > -1) {
                                    const match = /(.*)(onChatActiveChange)(.*)(if)(.*)/.exec(s)
                                    const result = [];
                                    for (let j = 1; j < match.length; j++) {
                                        if (j === 4) {
                                            result.push(`_wext.ocac(this);`)
                                        }
                                        result.push(match[j])
                                    }
                                    split[i] = result.join("")
                                } else if (s.indexOf("goodbye") > -1) {
                                    const match = /(.*)(,)(.*)(partingSend)(.*)/.exec(s)
                                    const result = [];
                                    for (let j = 1; j < match.length; j++) {
                                        if (j === 3) {
                                            result.push(`_wext.og(),`)
                                        }
                                        result.push(match[j])
                                    }
                                    split[i] = result.join("")
                                }

                            })
                            file.write("\n".concat(split.join(";")));
                            break
                        }
                        case 64:
                        case 66: {
                            const split = str.split(";");
                            split.forEach((s, i) => {
                                if (s.indexOf("this.socket.send") > -1 && s.indexOf("onmessage") > -1) {
                                    const match = /(.*)(this.socket.send\()(.*)/.exec(s)
                                    const result = [];
                                    for (let j = 1; j < match.length; j++) {
                                        if (j === 2) {
                                            result.push(`_wext.os(${/\(([a-zA-Z]*)\)/.exec(s)[1]});`)
                                        }
                                        result.push(match[j])
                                    }
                                    split[i] = result.join("")
                                } else if (s.indexOf("msgParser") > -1 && s.indexOf("msgParser=") === -1) {
                                    split[i] = s.concat(`;_wext.om(${/.*const(.*)=/.exec(s)[1]})`)
                                }
                            })
                            file.write("\n".concat(split.join(";")));
                            break
                        }

                        default:
                            file.write("\n" + str)
                    }
                })
                file.write(`console.log("[version] 2.2202.12");`)
                break
            }
            case "lang-vi": {
                const split = data.split("JSON.parse");
                const vi = fs.readFileSync(path.join(__dirname, "vi-preload"), { encoding: 'utf8' })
                file.write(`console.log("[override] ${fileName}",new Date().toLocaleString());\n`);
                file.write(split[0]);
                file.write("JSON.parse");
                file.write(vi);
                break
            }
            case "zalo_main": {
                data.split("\n").forEach((str, index) => {
                    console.log("当前读取到行", index + 1)
                    if (index == 0) {
                        file.write(`console.log("[override] ${fileName}",new Date().toLocaleString());`);
                    }
                    str = str.replace("Tiáº¿ng Viá»‡t", "中文(简体)")
                    if (str.indexOf("vn:") > -1) {
                        const split = str.split("vn:")
                        file.write(`\n${split[0]}`)
                        file.write("vn:window._i18n_main||")
                        file.write(`${split[1]}`)
                    } else {
                        file.write("\n" + str)
                    }
                })
                break
            }
            default:
                file.write(data)
        }
        file.end()
        console.log("[override] ", `{ ${target} } override success`, new Date().toLocaleString())
        gitPush(fileName)

    });
}
const getFileName = (path) => {
    return path.substring(path.lastIndexOf("/") + 1)
}
/**
 * 根据平台参数初始化父级目录
 * @param {} platform
 */
const initParentDir = (platform, next) => {
    return new Promise((resolve, reject) => {
        try {
            const t1 = path.join(__dirname, next), t2 = path.join(t1, platform);
            if (fs.existsSync(t1)) {
                if (!fs.existsSync(t2)) {
                    fs.mkdirSync(t2)
                }
            } else {
                fs.mkdirSync(t1);
                fs.mkdirSync(t2);
            }
            resolve(t2)
        } catch (e) {
            reject(e)
        }
    });

}

const handle = (platform, param) => {
    if (param.startsWith("http")) return console.log("参数错误", { param })

    const flag = fs.existsSync(param);
    const source = flag ? param : path.join(__dirname, param);

    const fileName = getFileName(param);
    const exec = /([^.]+)\.?([^.]*)\.js/.exec(fileName)

    initParentDir(platform, "override").then(targetDir => {
        const target = path.join(targetDir, fileName)
        console.log("匹配到文件名称", fileName)

        let key = exec[1].replace("/", "");
        if (platform.toLowerCase() === "zalo" && fileName.startsWith("main-")) {
            key = "zalo_main"
        }
        if (fs.existsSync(targetDir)) {
            if (fs.existsSync(target)) {
                console.log(`目标文件:{ ${target} } 已存在，正在执行删除`,)
                fs.unlinkSync(target);
                console.log(`目标文件:{ ${target} }删除成功`);
            }
        } else {
            console.log(`目标文件夹:{ ${targetDir}不存在，正在创建`);
            fs.mkdirSync(targetDir);
            console.log(`目标文件夹:{ ${targetDir} }创建成功`);
        }
        override({ source, target, fileName, key })
    })

}

const initZaloRender = (platform, source) => {
    if (!source) return;
    initParentDir(platform, "old").then(targetDir => {
        const target = path.join(targetDir, getFileName(source));

        function readyCall() {
            fs.readFile(target, 'utf8', function (err, data) {
                ((s) => {
                    for (let e = 0; e < 50; e++) {

                        const a = eval(s)
                        if (a.indexOf("lang-vi") > -1) {
                            const u = data.substring(data.indexOf("https"));
                            const p = u.substring(0, u.indexOf("\""))
                            const t = path.join(targetDir, getFileName(a + ".js"));
                            if (fs.existsSync(t))
                                handle(platform, t)
                            else {
                                downloadFileAsync(path.join(p, "lazy", a + ".js"), t)
                                    .then(() => {
                                        handle(platform, t)
                                    })
                            }
                        }
                    }
                })(data.substring(data.indexOf("lazy/\"") + 7, data.indexOf("+\".js")))
            })
        }
        if (fs.existsSync(target))
            readyCall()
        else
            downloadFileAsync(source, target).then(readyCall)
    })

}

const args = process.argv;
if (args && args.length) {
    const params = process.argv.slice(2);
    if (params.length) {
        const [platform, ...files] = params;
        if (!files || !files.length) return;
        console.log("匹配到需要执行的参数：")
        console.table(files)
        const o = platform.split("-");
        switch (o[0].toLowerCase()) {
            case "whatsapp": {
                files.forEach(s => {
                    handle(o[0], s)
                })
                break
            }
            case "zalo": {
                files.forEach(s => {
                    if (getFileName(s).startsWith("render"))
                        initZaloRender(o[0], s)
                    else
                        handle(o[0], s)
                })
                break
            }
            default:
                console("平台参数未识别");
        }
    }
}
exports.initZaloRender = initZaloRender

exports.initWhatsApp = function (...files) {
    files.forEach(s => {
        handle("whatsapp", s)
    })
}