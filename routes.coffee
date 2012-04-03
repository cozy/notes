routes = (map) ->
    map.get('/', 'notes#index')
    map.get('/all', 'notes#all')

