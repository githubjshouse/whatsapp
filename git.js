var process = require('child_process');

var c1 = 'git add -A', c2 = `git commit -m "update:测试git脚本  js更新"`, c3 = 'git push'
process.exec(c1, function (error, stdout, stderr) {
    console.log(c1, {error, stderr, stdout});
    if (!error && !stderr)
        process.exec(c2, function (error, stdout, stderr) {
            if (!error && !stderr)
                process.exec(c3, function (error, stdout, stderr) {
                    console.log(c3, {error, stderr});
                })
            console.log(c2, {error, stderr});
        })

});
