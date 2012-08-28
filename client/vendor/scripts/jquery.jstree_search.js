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
