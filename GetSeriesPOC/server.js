var express = require('express');
var fs = require("fs");
var app = express();
var request = require("request");
var EventEmitter = require("events").EventEmitter;
var emitter = new EventEmitter();
var port = 3000;

app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));

var sessionMap = {};

app.get("/DoQuery", function(req, res){
    
    var sessionEvent, arrResults;
    var sessionId = req.session.id;
    
    if(req.session.querying === undefined) {
        //TODO Consolidate all into querying object so it can be dumped all at once
        req.session.querying = true;
        sessionMap[sessionId] = {
            "arrResults" : [],
            "numResults" : 0
        };
        req.session.sessionEvent = new EventEmitter();
        sessionEvent = req.session.sessionEvent;
        //arrResults = req.session.arrResults;
        
        sessionEvent.on("requestCompleted", function(resultObj){
            //TODO Populate result
            //TODO Check for last
            sessionMap[sessionId].arrResults.push(resultObj);                        //Lock point
            sessionEvent.emit("sessionnotify");
        });
        
        requester(function(result, length){
            sessionMap[sessionId].numResults++;
            sessionEvent.emit("requestCompleted", {
                "result" : result,
                "last" : sessionMap[sessionId].numResults === length
            });
        });
    }
    else {
        sessionEvent = req.session.sessionEvent;
        //arrResults = req.session.arrResults;
    }
    
    if(sessionMap[sessionId].arrResults.length > 0) {
        //TODO Provide centralized solution for locking
        var result = sessionMap[sessionId].arrResults.shift();                    //Lock point
        if(result.last) {
            delete req.session.querying;
            delete sessionMap[sessionId];
        }
        res.send(result);
    }
    else {
        //Per request/session - one handler
        sessionEvent.once("sessionnotify", function(){
            var result = sessionMap[sessionId].arrResults.shift();                //Lock point
            if(result.last)
                delete req.session.querying;
            res.send(result);
        });
    }
    
});

app.get("/", function(req, res){
    res.setHeader("Content-Type", "text/html");
    res.send(fs.readFileSync("./index.html"));
});

app.get("/jquery-1.10.2.min.js", function(req, res){
    res.setHeader("Content-Type", "text/javascript");
    res.send(fs.readFileSync("./jquery-1.10.2.min.js"));
});

app.listen(port, function(){
    console.log("Listening on port " + port);
});

function requester(callback) {
    
    var arr = ["http://google.com&q=maps&start=0", "http://google.com&q=maps&start=10", "http://google.com&q=maps&start=20"];
    
    for(var i = 0; i < arr.length; i++) {
        request(arr[i], function(err, resp, body) {
            var result = "Hello" + Math.floor(Math.random()*100);
            console.log(result);
            callback(result, arr.length);
        });
    }
    
    return arr.length;
}