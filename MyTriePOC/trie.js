/**
    Custom trie implementation - Supports multiple entries and anything as leaves

    -- add -- (key{text}, item{anything}[optional])  //If item not present, key itself will be leaf
    --lookup -- (partial{text})
    -- dumpJsonStr -- ()
    -- wipe -- ()

    Author : Aniket Lawande
**/
var LEAFIND = "$";
var crypto = require("crypto");
var stringify_stable = require('json-stable-stringify');

function Trie(opts) {
    opts = opts || {};
    this.trie = {};
    this.count = 0;
    this.max = opts.max;            // if max(for lookup only) specified else undefined treated as no max
    this.trieInternalHash = {
    };
}

Trie.prototype.add = function(word, item, duplicateAllowed) {
    if (word === undefined || word === null || word === "")
        return this;
    
    duplicateAllowed = duplicateAllowed === false ? false : true;
    
    var toPush = item || word;
    var lword = word.toLowerCase();
    
    if(!duplicateAllowed && this.trieInternalHash[uniqueHashType(lword, toPush)] !== undefined)
        return this;
    
    var current = this.trie;
    for(var a = 0; a < lword.length ; a++) {
        if(current[lword[a]] === undefined)
            current[lword[a]] = {};
        current = current[lword[a]];

//        if(!duplicateAllowed) {
//            if(current[LEAFIND] !== undefined) {
//                for(var key = 0; key < current[LEAFIND].length; k++) {
//                    
//                }
//            }
//        }
    }
    current[LEAFIND] = current[LEAFIND] || [];
    
    current[LEAFIND].push(toPush);
    this.count++;
    
    // if duplicate or not duplicate
    this.trieInternalHash[uniqueHashType(lword, toPush)] = "";

    return this;
}

function uniqueHashType(word, item) {
    var hash = crypto.createHash('md5');
    hash.update(word);
    var itemHash;
    
    var itemHash = hash.update(stringify_stable(item)).digest("hex");
    
    return itemHash;
    
//    if(typeof item === "string")
//        itemHash = hash.update(item).digest("hex");
//    else if (Array.isArray(item)) {
//        for()
//    }
//    else {
//        
//    }
}

Trie.prototype.lookup = function(word, duplicatesAllowed, max) {
    var results = [];
    if(word === undefined || word === null || word === "")
        return results;

    max = max || this.max;
    
    var lword = word.toLowerCase();
    var current = this.trie;
    for(var a = 0; a < lword.length; a++) {
        if(current[lword[a]] === undefined)
            return results;
        current = current[lword[a]];
    }

    var tempTrieHash = {
    };
    
    getAllLeaves(current, results, {
        'max' : max,
        'duplicatesAllowed' : duplicatesAllowed,
        'hashCheck' : function(result) {
            var hash = uniqueHashType(lword, result);
            
            if(tempTrieHash[hash] !== undefined)
                return false;
            else {
                tempTrieHash[hash] = '';
                return true;
            }
        }
    });

    return results;
}

Trie.prototype.top = function(max) {
    var results = [];
    max = max || opts.max;

    getAllLeaves(this.trie, results, {'max' : max});

    return results;
}

function getAllLeaves(node, results, opts) {

    var max = opts.max;
    
    if(max !== undefined && results.length >= max)
        return;

    for(var a in node) {
        if(node.hasOwnProperty(a)) {
            if(a === LEAFIND)
                flattenAndPush(node[a], results, opts);
            else
                getAllLeaves(node[a], results, opts);
        }
    }
}

function flattenAndPush(arr, results, opts) {
    
    var max = opts.max;
    var duplicatesAllowed = opts.duplicatesAllowed === false ? false : true;
    var arrlength = arr.length;
    
    for(var i = 0; i < arrlength; i++) {
        if(max !== undefined && results.length >= max)
            return;
        
        if(!duplicatesAllowed && !opts.hashCheck(arr[i]))
            continue;
        
        results.push(arr[i]);
    }
}

Trie.prototype.wipe = function() {
    delete this.trie;
    this.trie = {};
    this.count = 0;

    return this;
}

Trie.prototype.dumpJsonStr = function() {
    return JSON.stringify(this.trie);
}

exports.Trie = Trie;