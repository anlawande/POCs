var LEAFIND = "$";

function Trie() {
    this.trie = {};
}

Trie.prototype.add = function(word) {
    var lword = word.toLowerCase();
    var current = this.trie;
    for(var a = 0; a < lword.length ; a++) {
        if(current[lword[a]] === undefined)
            current[lword[a]] = {};
        current = current[lword[a]];
    }
    current[LEAFIND] = word;
}

Trie.prototype.lookup = function(word) {
    var results = [];
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
                results.push(node[a]);
            else
                getAllLeaves(node[a], results);
        }
    }
}

Trie.prototype.wipe = function() {
    delete this.trie;
    this.trie = {};
}

Trie.prototype.dumpJsonStr = function() {
    return JSON.stringify(this.trie);
}

exports.Trie = Trie;