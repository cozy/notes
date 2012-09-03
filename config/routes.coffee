exports.routes = (map) ->
    
    map.get  '/'          , 'notes#index'

    map.get  '/notes'     , 'notes#all'
    map.post '/notes'     , 'notes#create'
    map.post '/notes/path', 'notes#allForPath'
    map.get  '/notes/:id' , 'notes#show'
    map.put  '/notes/:id' , 'notes#update'
    map.del  '/notes/:id' , 'notes#destroy'

    map.get  '/tree'      , 'tree#tree'
