class RealTimer

    events: ['note.create', 'note.update','note.delete',
        'task.update', 'task.delete']

    url: window.location.origin

    params:
        resource: "#{window.location.pathname.substring(1)}socket.io"

    watched: {}

    constructor: ->
        socket = io.connect @url, @params

        for event in @events
            socket.on event, @callbackFactory(event)

    callbackFactory: (event) -> (id) =>
        [doctype, operation] = event.split '.'
        @callback(doctype, operation, id)

    callback: (doctype, operation, id) ->
        console.log doctype, operation, id
        if doctype is 'note'
            # should update tree
        else if doctype is 'task' and @watched[id]?
            method = if operation is 'update' then 'fetch' else 'destroy'
            @watched[id][method]()

    watch: (model) ->
        @watched[model.id] = model
        model.on 'destroy', => @stopWatching(model)

    stopWatching: (model) ->
        if @watched[model.id] is model
            delete @watched[model.id]


module.exports = new RealTimer()