/*
    Mocha tests
*/
var assert = require("assert");
var Trie = require("./trie.js").Trie;
var trie;

describe('Adding to tries', function(){
    before(function(){
        trie = new Trie();
    });
    
    describe('Adding values', function(){
        
        it('should add words', function(){
            trie.add("Hello");
            trie.add("Help");
            trie.add("json");
        });
        
        it('should add multiple entries', function(){
            trie.add("json");
        });
        
        it('should add items', function(){
            trie.add("custom", 2);
            trie.add("number", 20);
            trie.add("myobj", {"cust" : 40});
        });
    });
    
    describe('Retrieving values', function(){
        
        it('should retrieve 1 value', function() {
            assert.equal(1, trie.lookup("Hell").length);
        });
        
        it('should retrieve 2 values', function() {
            assert.equal(2, trie.lookup("Hel").length);
        });
        
        it('should retrieve 0 values', function() {
            assert.equal(0, trie.lookup("Helsl").length);
        });
        
        it('should retrieve multiple entries', function(){
            assert.equal(2, trie.lookup("json").length);
        });
        
        it('should retrieve item entries', function(){
            assert.equal(20, trie.lookup("number")[0]);
            assert.equal(40, trie.lookup("myobj")[0]["cust"]);
        });
        
        it('should retrieve top n entries', function(){
            assert.equal(5, trie.top(5).length);
            assert.equal(2, trie.top(2).length);
            assert.equal(trie.count, trie.top(trie.count).length);
            assert.equal(trie.count, trie.top(trie.count+2).length);
        });
    });
});