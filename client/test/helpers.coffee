async = require("async")
Client = require("../../common/test/client").Client

client = new Client("http://localhost:8001/")

exports.createDefaultNotes = (callback) ->
    client.post "tree/", { path: "/all", name: "Recipe" }, ->
        client.post "tree/", { path: "/all", name: "Todo"}, ->
            client.post "tree/", { path: "/all/recipe", name: "Dessert" }, ->
                callback()

exports.init = (callback) ->
    Note.destroyAll ->
        Tree.destroyAll ->
            exports.createDefaultNotes ->
                callback()

exports.waits = (done, time) ->
    func = -> done()
    setTimeout(func, time)

