exports.routes = function (map) {
    map.resources('notes');
    map.get('/', 'notes#index');
};
