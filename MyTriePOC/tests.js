/*
    Mocha tests
*/
var assert = require("assert");
var Trie = require("./trie.js").Trie;
var trie;

describe('Trie tests:', function(){
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

        it('should add in a chain', function(){
            trie
            .add("MyFirstTrie")
            .add("MySecondTrie");
        });

        it('should allow duplicates at same level (specified or default)', function() {
            trie.add("myobj", {"cust" : 40}, true);
            assert.equal(trie.lookup("myobj").length, 2);
            assert.equal(trie.lookup("myobj")[0]["cust"], trie.lookup("myobj")[1]["cust"]);
            trie.add("myobj", {"cust" : 40});
            assert.equal(trie.lookup("myobj").length, 3);
        });

        it('should not allow duplicate values(on the same level) if specified', function() {
            var count = trie.count;
            assert.equal(trie.add("number", 20, false).count, count);
        });

        it('should allow duplicate values(on different levels) even if specified', function() {
            var count = trie.count;
            assert.equal(trie.add("numberB", 20, false).count, count + 1);
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
            assert.equal(5, trie.top({max : 5}).length);
            assert.equal(2, trie.top({max : 2}).length);
            assert.equal(trie.count, trie.top({max : trie.count}).length);
            assert.equal(trie.count, trie.top({max : trie.count+2}).length);
        });

        it('should retrieve duplicates', function() {
            trie.add("number", 20);
            assert.equal(trie.lookup('number').length, 3);
            assert.equal(trie.lookup('numb').length, 3);
        });

        it('should not retrieve duplicates at the same level', function() {
            assert.equal(trie.lookup('number', false).length, 1);
            assert.equal(trie.lookup('numb', false).length, 1);
            assert.equal(trie.lookup('number', false)[0], 20);
        });

        it('should not duplicates at different levels', function() {
            assert.equal(trie.lookup('number', false).length, 1);
            assert.equal(trie.lookup('numberB', false).length, 1);
            assert.equal(trie.lookup('numberB', false)[0], 20);
        });

        it('should test opts arguments properly', function() {
            assert.equal(trie.top().length, trie.count);
            trie.max = 5;
            assert.equal(trie.top().length, 5);
            assert.equal(trie.lookup('numb', true, {max : 1}).length, 1);
        });
    });

    describe('Intersection tests', function() {
        
        before(function() {
            trie.add("abc", {'some' : 'fields', 'toShow' : 'identity'});
            trie.add("abcd", {'some' : 'fields', 'toShow' : 'identity2'});
            trie.add("def", {'some' : 'fields', 'toShow' : 'identity'});
            trie.add("defg", {'some' : 'fields', 'toShow' : 'identity3'});
        });
        
        it('should accept previous result and refine it', function() {
            var results = trie.lookup("abc", false);
            assert.equal(results.length, 2);
            assert.equal(results[0].toShow, 'identity');
            debugger;
            results = trie.lookup("def", false, {prevResults : results});
            assert.equal(results.length, 1);
            assert.equal(results[0].toShow, 'identity');
        });
        
        it('should accept previous result and refine it(with non-objects)', function() {
            var results = trie.lookup("numb", true);
            assert.equal(results.length, 3);
            debugger;
            results = trie.lookup("numberB", false, {prevResults : results});
            assert.equal(results.length, 1);
        });
    });

    describe('Removing values', function(){
        it('should wipe the trie properly', function(){
            trie.wipe();
            assert.equal(0, trie.count);
            assert.equal(0, trie.lookup("json"));
        });
    });
});