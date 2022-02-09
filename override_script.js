const fs = require('fs');
const path = require('path');


const override = (param) => {
    const {source, target, key, fileName} = param;

    // 读取文件
    console.log(`开始读取文件->${source}`)
    fs.readFile(source, 'utf8', function (err, data) {
        if (err) throw err;

        console.log("\n\n\n-------------------------------------------------------------------------------------------------------------------------")
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
                                                if(exec){
                                                    result.push("async ".concat(`${exec[1]}${exec[2]}${exec[3].slice(0, 3)},tic){`).concat(`try{if(_wext.tic&&!tic){t=await _wext.tic(${exec[2]})}}catch(err){return}`).concat(match[j].slice(19)).concat(`;_wext.stmtc=${match[1].slice(49)}sendTextMsgToChat`))
                                                }else{
                                                    exec = /(function\()(.*)(\).*)(let|const)(\s*\w*)(.*)/.exec(match[j]);
                                                    result.push("async ".concat(`${exec[1]}${exec[2]},tic${exec[3]+exec[4]+exec[5]+exec[6]};`).concat(`try{if(_wext.tic&&!tic){t=await _wext.tic(${exec[2]},${exec[5]})}}catch(err){return}`))
                                                    split[i+1]=`${split[i+1]};_wext.stmtc=${match[1].slice(49)}sendTextMsgToChat`
                                                }
                                                    
                                            } else
                                                result.push(match[j])
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
                                                result.push(match[j].concat(`_wext.orce((0,O.unproxy)(${/(.*)(switch\()(.{6})/.exec(split[i - 1])[3].charAt(0)}));`))
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
                        case 42: {
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
                        case 59: {
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
                        case 64: {
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
            }

        }
        file.end()
        console.log("[override] ", `{ ${target} } override success`, new Date().toLocaleString())
    });
}


const handle = (param) => {
    const flag=fs.existsSync(param);
    const source = flag?param: path.join(__dirname, param);
    
    const fileName = param.substring(param.lastIndexOf("/")+1);
    const exec = /([^.]+)\.?([^.]*)\.js/.exec(fileName)
    const targetDir = path.join(__dirname, "override");
    const target = path.join(targetDir, fileName)
    console.log("匹配到文件名称", fileName)

    const ready = {source, target, fileName, key: exec[1].replace("/", "")}
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
    override(ready)
}
const files = process.argv.slice(2);
console.log("匹配到需要执行的参数：")
console.table(files)
files.forEach(s => {
    handle(s)
})

exports.handle=handle;


