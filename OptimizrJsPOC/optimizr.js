var cheerio = require("cheerio");
var glob = require("glob");
var fs = require("fs");

var optimizrHTMLTemplate = "./OptimizrReportTemplate.html";
var optimizrReport = "./Report.html"

function optimizr() {
    this.tasks = [];
}

function taskObj(){
}

taskObj.prototype.name = function(val){
    this.name = val;
}
taskObj.prototype.debug = function(val){
    this.debug = val;
}
taskObj.prototype.description = function(val){
    this.description = val;
}
taskObj.prototype.explanation = function(val){
    this.explanation = val;
}
taskObj.prototype.suggestion = function(val){
    this.suggestion = val;
}
taskObj.prototype.taskFn = function(val){
    this.taskFn = val;
    this.taskFnSet = true;
}

optimizr.prototype.newTask = function(){
    return new taskObj();
};

optimizr.prototype.registerTask = function (task) {
    this.tasks.push(task);
};

optimizr.prototype.run = function () {
    // Run tasks
    for (var i = 0; i < this.tasks.length; i++) {

        var task = this.tasks[i];

        if(!task.taskFnSet) {
            console.log("Task " + task.name + " doesn't have a task function. Please add one by calling task.taskFn(yourtaskFn)");
        }
        
        task.taskResultObj = new taskResultObj();
        
        var taskParam = {
            "task":  task.taskResultObj
        };

        if(typeof task.debug !== "function")
            console.log(task.debug);
            
        task.taskFn.apply(taskParam);
    }

    // Collect results
    for (var i = 0; i < this.tasks.length; i++) {

        var task = this.tasks[i];

        if (task.taskResultObj.status === "Failed") {
            console.log("Task " + task.name + " failed");
            
            var $ = cheerio.load(fs.readFileSync(optimizrHTMLTemplate), {encoding : 'etf-8'});
            
            var cardTemplate = $(".card");
            var newCard = cardTemplate.clone();
            newCard.css('display', 'block');
            
            newCard.find(".cardTitle").html(task.name);
            
            var tbody = newCard.find(".resultsTable tbody");
            var results = task.taskResultObj.results;
            
            for(var j = 0; j < results.length; j++) {
                tbody.append("<tr><td>" + results[j].file + "</td><td>" + results[j].msg + "</td></tr>");
            }
            
            var explanation = (typeof task.explanation === "function") ? "No explanation provided" : task.explanation;
            var suggestion = (typeof task.suggestion === "function") ? "No suggestion provided" : task.suggestion;
            newCard.find(".explanation").html(explanation);
            newCard.find(".suggestion").html(suggestion);
            
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

function taskResultObj() {
    this.results = [];
    this.status = "Off";
}

taskResultObj.prototype.addResult = function (resultObj) {
    this.results.push(resultObj);
};

taskResultObj.prototype.success = function () {
    this.status = "Succeeded";
};

taskResultObj.prototype.failure = function () {
    this.status = "Failed";
};

optimizr = new optimizr();

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

optimizr.registerTask(task);

optimizr.run();