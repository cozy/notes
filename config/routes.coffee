exports.routes = (map) ->
    map.get '/', 'notes#index'
    map.get '/notes/:path', 'notes#all'
    map.post '/all', 'notes#create'
    map.get '/all/:id', 'notes#show'
    map.put '/all/:id', 'notes#update'
    map.del '/all/:id', 'notes#destroy'

    map.get '/tree', 'tree#tree'
    map.post '/tree', 'tree#create'
    map.put '/tree', 'tree#update'
    map.del '/tree', 'tree#destroy'
