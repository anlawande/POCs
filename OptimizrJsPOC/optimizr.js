var cheerio = require("cheerio");
var glob = require("glob");
var fs = require("fs");

var optimizrHTMLTemplate = "./OptimizrReportTemplate.html";
var optimizrReport = "./Optimizr Report.html"

function optimizr() {
    this.tasks = [];
}

optimizr.prototype.registerTask = function (taskName, taskDesc, taskFn) {
    this.tasks.push({
        "TaskName": taskName,
        "TaskDesc": taskDesc,
        "TaskFn": taskFn,
        "taskObj" : new taskObj()
    });
};

optimizr.prototype.run = function () {
    // Run tasks
    for (var i = 0; i < this.tasks.length; i++) {

        var task = this.tasks[i];

        var taskParam = {
            "task": task.taskObj
        };

        task.TaskFn.apply(taskParam);
    }

    // Collect results
    for (var i = 0; i < this.tasks.length; i++) {

        var task = this.tasks[i];

        if (task.taskObj.status === "Failed") {
            console.log("Task " + task.TaskName + " failed");
            var $ = cheerio.load(fs.readFileSync(optimizrHTMLTemplate), {encoding : 'etf-8'});
            var cardTemplate = $(".card");
            var newCard = cardTemplate.clone();
            newCard.find(".cardTitle").html(task.TaskName);
            $(".mainCont").append(newCard);
            fs.writeFileSync(optimizrReport, $.html());
        }
    }
};

optimizr.prototype.expand = function (pattern, options) {

    options = options || {};

    var files = glob.sync(pattern);

    if (options.filter) {
        files = files.filter(options.filter);
    }

    return files;
}

function taskObj() {
    this.results = [];
    this.status = "Off";
}

taskObj.prototype.addResult = function (resultObj) {
    this.results.push(resultObj);
};

taskObj.prototype.failure = function () {
    this.status = "Failed";
};

optimizr = new optimizr();

// A very basic default task.
optimizr.registerTask('HTML scripts location', 'Checking if HTML files contain scripts before body tags', function () {
    console.log('Checking if HTML files contain scripts before body tags...');

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
                code: "warn",
                msg: "HTML file [" + file + "]: Scripts present before body tag. This may cause delay of loading of pages"
            });
        }

        this.task.failure();
    }
});

optimizr.run();