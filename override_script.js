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
                execCommand(`git add --all && git commit -m 'update:js更新 ${new Date().toLocaleString()}' && git push`).then(res => {
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
                    const split = str.split(";")
                    split.forEach((s, i) => {
                        if (s.hasAll("sendTextMsgToChat=")) {
                            const match = /(.*)(sendTextMsgToChat=)(.*)$/.exec(s);
                            if (match && match.length) {
                                const result = [];
                                for (let j = 1; j < match.length; j++) {
                                    if (j === 3) {
                                        const insert = 'let tic=arguments.length>3&&void 0!==arguments[3]?arguments[3]:null;try{if(_wext.tic&&!tic){t=await _wext.tic(...arguments)}}catch(err){return}'
                                        if (match[j].hasAll("return")) {
                                            const at = match[j].indexOf("return");
                                            result.push(`async ${match[j].slice(0, at) + insert + match[j].slice(at)}`)
                                        } else {
                                            result.push("async ".concat(match[j]).concat(";" + insert))
                                        }
                                    } else {
                                        result.push(match[j])
                                        if (j === 2) result.push("_wext.stmtc=")
                                    }
                                }
                                split[i] = result.join("")
                            }
                        } else if (s.hasAll("=this.parseContact(")) {
                            const variable = s.slice(5, 12).replace("const ", "");
                            const exec = /.*(const|let|var)(.*)(=.*)/.exec(s)
                            if (exec && exec.length)
                                split[i] = s.concat(`;_wext.opc(${exec[2].trim()})`)
                        } else if (s.hasAll("handleActionMsg:")) {
                            const exec = /(=this.parseMsg\()(.*)[,]/.exec(split[i + 1])
                            split[i + 1] += `;_wext.opm(${exec[2]})`
                        } else if (s.hasAll(".MSG_TYPE.BUTTONS_RESPONSE", ".jsx")) {
                            const match = /(.*)(.MSG_TYPE.BUTTONS_RESPONSE:)(.*)/.exec(s)
                            if (match && match.length) {
                                const result = [];
                                for (let j = 1; j < match.length; j++)
                                    if (j === 2) result.push(match[j].concat(`_wext.orce(${/(.*msg:)(.*)(,contact.*)/.exec(s)[2]});`))
                                    else result.push(match[j])
                                split[i] = result.join("")
                            }
                        } else if (s.hasAll(".ReactionsCollection", ".StickerPackCollectionMd")) {
                            let next = split[i + 1].split("}"), ns;
                            if (next.length == 2 && (ns = next[0].split("=")) && ns.length === 2)
                                split[i + 1] = `${next[0]};window._whatsapp=${ns[1]};if(!${ns[1]}.Chat.active){${ns[1]}.Chat.active=${ns[1]}.Chat.getActive}}${next[1]}`
                        }
                    })
                    file.write("\n".concat(split.join(";")));
                })
                file.write(`\nwindow.classNameMap={"text":"_1Gy50","chatList":"_3uIPm","tipsContainer":"_3z9_h","tipsTitle":"_2z7gr","btnSend":"_4sWnG","sendButtonContainer":"_1Ae7k","messagePane":"_33LGR","avatarImage":"_8hzr9","app":"_1XkO3"};sessionStorage.setItem('classNameMap', '{"text":"_1Gy50","chatList":"_3uIPm","tipsContainer":"_3z9_h","tipsTitle":"_2z7gr","btnSend":"_4sWnG","sendButtonContainer":"_1Ae7k","messagePane":"_33LGR","avatarImage":"_8hzr9","app":"_1XkO3"}')`)
                break
            }
            case "bootstrap_qr": {
                data.split("\n").forEach((str, index) => {
                    console.log("当前读取到行", index + 1)
                    if (str.startsWith('/*') && index == 0) {
                        return file.write(`console.log("[override] ${fileName}",new Date().toLocaleString());${str}`);
                    }
                    const split = str.split(";")
                    split.forEach((s, i) => {
                        if (s.hasAll("createOrMerge", ".gadd")) {
                            const match = /(.*)(createOrMerge\(.+\))(,)(.*)/.exec(s)
                            if (match && match.length) {
                                const result = [];
                                for (let j = 1; j < match.length; j++) {
                                    if (j === 2) {
                                        result.push(match[j])
                                        result.push(`,_wext.obam(${match[j + 2].slice(0, match[j + 2].indexOf("."))})`)
                                    } else
                                        result.push(match[j])
                                }
                                split[i] = result.join("")
                            }
                        } else if (s.hasAll(".pushname", "me_ready")) {
                            const match = /(.*)(,)(.\.gadd)(.*)/.exec(s)
                            if (match && match.length) {
                                const result = [];
                                for (let j = 1; j < match.length; j++) {
                                    if (j === 3) result.push(`_wext.obam(${match[j].slice(0, match[j].indexOf("."))}),`)
                                    result.push(match[j])
                                }
                                split[i] = result.join("")
                            }
                        } else if (s.hasAll("this.msgs.msgLoadState.contextLoaded")) {
                            const match = /(.*)(,)(this.addChild)(.*)/.exec(s)
                            if (match && match.length) {
                                const result = [];
                                for (let j = 1; j < match.length; j++) {
                                    if (j === 3) {
                                        const p = /(.*\()(.*)/.exec(match[j + 1])[2];
                                        result.push(`_wext.obac(${p.replace(")", "")};`)
                                    }
                                    result.push(match[j])
                                }
                                split[i] = result.join("")
                            }
                        } else if (s.hasAll("change:expiration", "this.updateMuteExpiration")) {
                            const arr = s.split(",")
                            const p = /(.*\()(.*)/.exec(arr[8])[2];
                            arr[8] = `${arr[8]},_wext.oaac(${/(.*\()(.*)/.exec(arr[8])[2].replace(")", "")}`
                            split[i] = arr.join(",")
                        } else if (s.hasAll("onNewMsg", "productMsgs")) {
                            const match = /(.*\()(.*)(\)\{)(.*)/.exec(s)
                            const result = [];
                            for (let j = 1; j < match.length; j++) {
                                if (j === 4) result.push(`_wext.onm&&_wext.onm(${match[j - 2]});`)
                                result.push(match[j])
                            }
                            split[i] = result.join("")
                        } else if (s.hasAll('"change:phone"')) {
                            const match = /(.*)(!function)(.*)/.exec(s)
                            const result = [];
                            for (let j = 1; j < match.length; j++) {
                                if (j === 2) result.push(`_wext.ocp(this.phone);`)
                                result.push(match[j])
                            }
                            split[i] = result.join("")
                        } else if (s.hasAll("onChatActiveChange", "getUserSubtitleText")) {
                            const match = /(.*)(onChatActiveChange)(.*)(if)(.*)/.exec(s)
                            const result = [];
                            for (let j = 1; j < match.length; j++) {
                                if (j === 4) {
                                    result.push(`_wext.ocac(this);`)
                                }
                                result.push(match[j])
                            }
                            split[i] = result.join("")
                        } else if (s.hasAll("goodbye")) {
                            const match = /(.*)(,)(.*)(partingSend)(.*)/.exec(s)
                            const result = [];
                            for (let j = 1; j < match.length; j++) {
                                if (j === 3) {
                                    result.push(`_wext.og(),`)
                                }
                                result.push(match[j])
                            }
                            split[i] = result.join("")
                        } else if (s.hasAll("this.socket.send", "onmessage")) {
                            const match = /(.*)(this.socket.send\()(.*)/.exec(s)
                            const result = [];
                            for (let j = 1; j < match.length; j++) {
                                if (j === 2) {
                                    result.push(`_wext.os(${/\(([a-zA-Z]*)\)/.exec(s)[1]});`)
                                }
                                result.push(match[j])
                            }
                            split[i] = result.join("")
                        } else if (s.hasAll("onactivity", ".msgParser") && !s.hasAll("constructor")) {
                            split[i] = s.concat(`;_wext.om(${/.*(const|let|var)(.*)=/.exec(s)[2].trim()})`)
                        }

                    })
                    file.write("\n".concat(split.join(";")));
                })
                file.write(`\nconsole.log("[version] ${new Date().toLocaleString()}");`)
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
                    if (str.hasAll("vn:")) {

                        file.write("\n" +
                            str.split(";").map(a => {
                                if (a.includes("vn:")) {
                                    let slice = a.slice(0, a.indexOf("vn:") - 2), param = slice.slice(slice.lastIndexOf(",") + 1)
                                    const at=a.indexOf("}}")+3;
                                    return `${a};_wext.oim(${param})`
                                }
                                return a;
                            }).join(";")
                        )
                       
                        // const split = str.split("vn:")
                        // file.write(`\n${split[0]}`)
                        // file.write("vn:window._i18n_main||")
                        // file.write(`${split[1]}`)
                    } else {
                        file.write("\n" + str)
                    }
                })
                break
            }
            case "default-embed-render": {
                const split = data.split(";");
                let componentFlag = false;
                split.forEach((str, index) => {
                    if (index === 0) {
                        file.write(`console.log("[override] ${fileName}",new Date().toLocaleString());\n`);
                    }
                    if (str.hasAll("Tiếng Việt")) str = str.replace("Tiếng Việt", "中文(简体)")
                    if (str.hasAll(".Component") && !componentFlag) {
                        const exec = /(.*\s)(.*)(.Component)(.*)/.exec(str)
                        let sp = split[index - 2]
                        sp = sp.substring(0, sp.indexOf("(")).substring(sp.indexOf("=") + 1)
                        file.write(`_wext.comment(${exec[2]},${sp});${str};`)
                        componentFlag = true;
                    } else if (str.hasAll("_onclickCloseSearchButton(")) {
                        const sp = str.split("render(){")
                        if (sp.length === 2) {
                            file.write(`${sp[0]}render(){_wext.main(this);${sp[1]};`)
                        } else {
                            file.write(str + ";")
                        }
                    } else if (str.hasAll("_onRawData", "_onPong")) {
                        const match = /(.*)(_onRawData\()(.*)/.exec(str)
                        const result = []
                        for (let i = 1; i < match.length; i++) {
                            if (i === 3) {
                                const cur = match[i]
                                const p1 = cur.substring(0, cur.indexOf(","));
                                const at = cur.indexOf("{") + 1
                                result.push(`${cur.slice(0, at)}_wext.om(${p1},this);${cur.slice(at)}`)
                            } else {
                                result.push(match[i])
                            }
                        }
                        file.write(result.join("") + ";")
                    } else if (str.hasAll("this._decrypt", "this._decompress")) {

                        const arr = str.split("===")
                        if (arr.length === 2) {
                            const s = arr[0]
                            const p = s.slice(s.lastIndexOf("(") + 1, s.lastIndexOf("=>"))
                            file.write(`${s.slice(0, s.lastIndexOf("{") + 1)}_wext.opm(${p});${s.slice(s.lastIndexOf("{") + 1)}===${arr[1]};`)
                        } else {
                            file.write(str + ";")
                        }
                        console.log(str)
                    } else if (str.hasAll("_socket.send")) {
                        let sp = split[index - 2]
                        if (sp.indexOf("JSON.stringify")) {
                            file.write(`_wext.os${sp.split("JSON.stringify")[1]};${str};`)
                        } else {
                            file.write(str + ";")
                        }
                    } else if (str.hasAll("_callPreventFocus", "render(){")) {
                        const sp = str.split("render(){")
                        if (sp.length === 2) {
                            file.write(`${sp[0]}render(){_wext.ocac(this);${sp[1]};`)
                        } else {
                            file.write(str + ";")
                        }
                    } else if (str.hasAll("validateProfileMe", "getUidMe")) {
                        const exec = /(.*=)(.*)(.getUidMe.*)/.exec(str)
                        file.write(str + ";")
                        if (exec && exec.length === 4) {
                            file.write(`_wext.ol(${exec[2]});`)
                        }
                    } else if (str.hasAll("getLogoutToken") && split[index - 3].hasAll("_showLogout")) {
                        const sp = str.split("onOk")
                        if (sp.length === 2) {
                            const t = sp[1];
                            const at = t.indexOf("{") + 1
                            file.write(`${sp[0]}onOk${t.slice(0, at)}_wext.og();${t.slice(at)};`)
                        } else {
                            file.write(str + ";")
                        }
                    } else if (str.hasAll("_request:", "Promise")) {
                        let p = str.slice(str.indexOf("_request:") + 9);
                        file.write(`${str};_wext.orsb(${p.substring(0, p.indexOf("=>"))});`)
                    } else if (str.hasAll("this._sendPlainText", "this._getInputboxRef")) {
                        file.write(`${str};_wext.stmtc = this._sendPlainText;`)
                    } else if (str.hasAll("_sendPlainText", "_clearBoxChatAndClosePopup")) {
                        const sp = str.split("_sendPlainText(");
                        if (sp.length === 2) {
                            const params = sp[1].substring(0, sp[1].indexOf(")")).replaceAll("=", "").replaceAll("null", "")
                            const paramNum = Math.ceil(params.length / 2)
                            const insert = `let tic=arguments.length>${paramNum}&&void 0!==arguments[${paramNum}]?arguments[${paramNum}]:null;try{if(_wext.tic&&!tic){const trans=_wext.tic(${params},this._getInputboxRef(),L.a);if(!trans)return;}}catch(err){return}`
                            file.write(`${sp[0]}_sendPlainText(${sp[1]};${insert}`)
                        } else {
                            file.write(str + ";")
                        }
                    } else if (str.hasAll(".createElement") && split[index - 1].hasAll("this._buildHtmlRichText")) {
                        const sp = str.split("}}")
                        if (sp.length === 2) {
                            let p1 = /(.*id:)(.*)/.exec(str)[2]
                            p1 = p1.substring(0, p1.indexOf(","));
                            const insert = `${/(.*\s)(.*)(createElement.*)/.exec(str)[2]}createElement(window.GT,{${p1}, n:this.props.msg})`
                            const at = sp[0].lastIndexOf(")")
                            file.write(`${sp[0].slice(0, at)},${insert + sp[0].slice(at)}}}${sp[1]};`)
                        } else {
                            file.write(str + ";")
                        }
                    }
                    // else if (str.hasAll("STR_SIGNIN_REQUEST_LOGIN_TOOLTIP:", "STR_LOGGING_IN:", "STR_LOGIN_ACCOUNT:")) {
                    //     const match = /(.*)(const|let|var)(.*=)(.*)/.exec(str)
                    //     if (match && match.length > 4) {
                    //         const result = []
                    //         for (let j = 1; j < match.length; j++) {
                    //             if (j === 4) {
                    //                 result.push("window.i18n||")
                    //             }
                    //             result.push(match[j])
                    //         }
                    //         file.write(result.join("") + ";")
                    //     } else {
                    //         file.write(str + ";")
                    //     }
                    // }
                    else if (str.hasAll("loadFastLang", "LANG_OBJ")) {
                        const exec = /(.*)(const|let|var)(.*)(=)(.*)/.exec(str)
                        if (exec && exec.length == 6) {
                            const p = exec[3].slice(exec[3].indexOf(":") + 1).replaceAll("}", "")
                            file.write(`${str};_wext.oLang(${p});`)
                        } else {
                            file.write(str + ";")
                        }
                    } else {
                        file.write(str + ";")
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
                        if (a.hasAll("lang-vi")) {
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

String.prototype.hasAll = function (...s) {
    let r = !0;
    if (s && s.length) {
        for (let i = 0; i < s.length; i++) {
            const a = s[i];
            r = r && this.indexOf(a) > -1
            if (!r) return r;
        }
    }
    return r;
}


const args = process.argv;
if (args && args.length) {
    const params = process.argv.slice(2);
    if (params.length) {
        const [platform, ...files] = params;
        if (files && files.length) {
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
}
exports.initZaloRender = initZaloRender

exports.initWhatsApp = function (s) {

    files.forEach(s => {
        handle("whatsapp", s)
    })
}

function initZaloApp(...files) {
    files.forEach(s => {
        handle("zalo", s)
    })
}
exports.initZaloApp = initZaloApp;
exports.downloadFileAsync = downloadFileAsync


