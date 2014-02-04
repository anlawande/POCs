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
        
        it('should add items', function(){
            trie.add("Hello");
            trie.add("Help");
            trie.add("json");
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
    });
});