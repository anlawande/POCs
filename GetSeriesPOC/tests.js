/*
    Mocha tests
*/
var assert = require("assert");
var server = require("./server.js");
var request = require("request");

describe('Get Series', function(){
    describe('Verify series', function(){
        
        var results = [];
        
        it('Getting series', function(done){
            
            var querying = false;
            // Cookies need to be enabled for the series to work
            request = request.defaults({jar: true});
            
            function doAjax(cancelInterval) {
                request("http://localhost:3000/doQuery", function(err, resp, body){
                    var response = JSON.parse(body);
                    results.push(response);
                    if(response.last) {
                        cancelInterval();
                        done();
                    }
                    querying = false;
                });
            }
            
            var poller = setInterval(function(){
                if(!querying) {
                    querying = true;
                    doAjax(function(){
                        clearInterval(poller);
                    });
                }
            }, 400);
        });
        
        it('Series result must be 4', function(){
            assert.equal(4, results.length);
        });
    });
});