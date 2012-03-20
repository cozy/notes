exports.routes = function (map) {
    map.resources('notes');
    map.get('/', 'notes#index');


    // Generic routes. Add all your routes below this line
    // feel free to remove generic routes
};
