/*
* This function is a plugin for jstree search method. It allows the search method
* to make a multiple word search in jstree. The search string has to separate each
* word by an underscore.
* input:
*   a: represent the a balise in each node from jstree (contains node title)
*   i: no idea (I only saw two values: 0 and 1)
*   m: an array which the last term is the search string
* output: return true if "a" contains one word from the search string 
*/


(function ($) {

    $.expr[':'].jstree_contains_multi = function(a,i,m){
        
        var word, words = [];
        //var searchFor = m[3].toLowerCase().replace(/^\s+/g,'').replace(/\s+$/g,'');
        var searchFor = m[3].toLowerCase().replace(/^_+/g,'').replace(/_+$/g,'');
        //if(searchFor.indexOf(' ') >= 0) {
        //    words = searchFor.split(' ');
        if(searchFor.indexOf('_') >= 0) {
            words = searchFor.split('_');
        }
        else {
            words = [searchFor];
        }
        for (var i=0; i < words.length; i++) {
            word = words[i];
            if((a.textContent || a.innerText || "").toLowerCase().indexOf(word) >= 0) {
                return true;
           }
        }
        return false;

    };

    $.expr[':'].jstree_contains = function(a,i,m){

        return (a.textContent || a.innerText || "").toLowerCase().indexOf(m[3].toLowerCase())>=0;

    };
})(jQuery);
