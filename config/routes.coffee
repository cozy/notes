exports.routes = (map) ->
    
    # routes for notes interactions
    map.get  '/notes'     , 'notes#all'
    map.post '/notes'     , 'notes#create'
    map.post '/notes/search', 'notes#search'
    map.post '/notes/:id/files', 'notes#addFile'
    map.get  '/notes/:id/files/:name', 'notes#getFile'
    map.del  '/notes/:id/files/:name', 'notes#delFile'
    map.get  '/notes/:id' , 'notes#show'
    map.put  '/notes/:id' , 'notes#update'
    
    map.del  '/notes/:id' , 'notes#destroy'


    # routes for tree interactions
    map.get  '/tree'      , 'tree#tree'

    # routes for tests array storage in mongo - 
    # remove only when the corresponding test ... fails
    # cf test/array-storage_test.coffee
    map.post '/test/arraystorage' , 'testArrayObj#create'
    map.get  '/test/arraystorage/:id' , 'testArrayObj#show'
