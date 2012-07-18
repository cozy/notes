async = require("async")
Client = require("../../common/test/client").Client

client = new Client("http://localhost:8888/")

createNoteFunction = (title, path, content) ->
    (callback) ->
        note =
            title: title
            content: content
            path: path

        client.post "notes/", note, callback

exports.createDefaultNotes = (callback) ->
    async.series [
        createNoteFunction "Recipe", "/all/recipe", "01"
        createNoteFunction "Dessert", "/all/recipe/dessert", "02"
        createNoteFunction "Todo", "/all/todo", "03"
    ], ->
        callback()


exports.init = (callback) ->
    Note.destroyAll ->
        Tree.destroyAll ->
            exports.createDefaultNotes ->
                callback()

exports.waits = (done, time) ->
    func = -> done()
    setTimeout(func, time)

