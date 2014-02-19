var cheerio = require("cheerio");
var fs = require("fs");
var optimizr = require("../optimizr.js").optimizr;
var task = optimizr.newTask();

task.name("HTML scripts location");
task.debug("Checking if HTML files contain scripts before body tags");
task.taskFn(function () {

    var files = optimizr.expand("../**/*.html", {
        filter: function (val) {
            return val.indexOf("node_modules") === -1;
        }
    });


    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        var htmlFile = fs.readFileSync(file, { encoding: 'utf8' });
        //var parsingBody = false;
        var scriptsPresentBeforeBody = false;

        var $ = cheerio.load(htmlFile);
        var bodyScripts = $("body").find("script");
        var scripts = $("html").find("script");
        if (bodyScripts.length < scripts.length)
            scriptsPresentBeforeBody = true;

        if (scriptsPresentBeforeBody) {
            this.task.addResult({
                "file" : file,
                "code": "warn",
                "msg": "HTML file : Scripts present before body tag. This may cause delay of loading of pages"
            });
        }

        this.task.failure();
    }
});

exports.task = task;