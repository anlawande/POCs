var cheerio = require("cheerio");
var fs = require("fs");
var optimizr = require("../optimizr.js").optimizr;
var task = optimizr.newTask();

task.name("HTML stylesheets location");
task.debug("Checking if HTML files contain stylesheets outside of head tags");
task.explanation("Having stylesheets outside head tags prevents progressive rendering and may cause flash of unstyled content");
task.suggestion("Place stylesheets in the head tag. Also avoid using @import directives");
task.taskFn(function () {

    var files = optimizr.expand("./tests/*.html", {
        filter: function (val) {
            return val.indexOf("node_modules") === -1;
        }
    });


    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var htmlFile = fs.readFileSync(file, { encoding: 'utf8' });
        var $ = cheerio.load(htmlFile);
        var stylesOutsideHead = false;
        var headStyles = $("head").find("link");
        var styles = $("html").find("link");
        if (headStyles.length < styles.length)
            stylesOutsideHead = true;

        if (stylesOutsideHead) {
            this.task.addResult({
                "file" : file,
                "code": "error",
                "msg": "Stylesheets present outside head tag delays rendering"
            });
            this.task.failure();
        }
        else
            this.task.success();
    }
});

exports.task = task;