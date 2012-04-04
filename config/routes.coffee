exports.routes = (map) ->
    map.get '/', 'notes#index'
    map.get '/all', 'notes#all'
    map.post '/all', 'notes#create'
    map.get '/all/:id', 'notes#show'
    map.put '/all/:id', 'notes#update'
    map.del '/all/:id', 'notes#destroy'

    map.get '/test/', 'tree#test'
