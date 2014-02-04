/**
    Custom trie implementation - Supports multiple entries and anything as leaves
    
    -- add -- (key{text}, item{anything}[optional])  //If item not present, key itself will be leaf
    --lookup -- (partial{text})
    -- dumpJsonStr -- ()
    -- wipe -- ()
    
    Author : Aniket Lawande
**/
var LEAFIND = "$";

function Trie() {
    this.trie = {};
}

Trie.prototype.add = function(word, item) {
    if (word === undefined || word === null || word === "")
        return;
    var lword = word.toLowerCase();
    var current = this.trie;
    for(var a = 0; a < lword.length ; a++) {
        if(current[lword[a]] === undefined)
            current[lword[a]] = {};
        current = current[lword[a]];
    }
    current[LEAFIND] = current[LEAFIND] || [];
    var toPush = item || word;
    current[LEAFIND].push(toPush);
}

Trie.prototype.lookup = function(word) {
    var results = [];
    if(word === undefined || word === null || word === "")
        return results;
    
    var lword = word.toLowerCase();
    var current = this.trie;
    for(var a = 0; a < lword.length; a++) {
        if(current[lword[a]] === undefined)
            return results;
        current = current[lword[a]];
    }
    
    getAllLeaves(current, results);
    
    return results;
}

function getAllLeaves(node, results) {
    for(var a in node) {
        if(node.hasOwnProperty(a)) {
            if(a === LEAFIND)
                flattenAndPush(node[a], results);
            else
                getAllLeaves(node[a], results);
        }
    }
}

function flattenAndPush(arr, results) {
    var arrlength = arr.length;
    for(var i = 0; i < arrlength; i++)
        results.push(arr[i]);
}

Trie.prototype.wipe = function() {
    delete this.trie;
    this.trie = {};
}

Trie.prototype.dumpJsonStr = function() {
    return JSON.stringify(this.trie);
}

exports.Trie = Trie;