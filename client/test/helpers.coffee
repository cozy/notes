async = require("async")
Client = require("../../common/test/client").Client

client = new Client("http://localhost:8001/")

exports.createDefaultNotes = (index, callback) ->
    client.post "tree/", { path: "/all", name: "Recipe #{index}" }, ->
        client.post "tree/", { path: "/all", name: "Todo #{index}"}, ->
            client.post "tree/", { path: "/all/recipe-#{index}", name: "Dessert #{index}" }, ->
                callback()

exports.init = (callback) ->
    Note.destroyAll ->
        Tree.destroyAll ->
            exports.createDefaultNotes 1, ->
                exports.createDefaultNotes 2, ->
                    exports.createDefaultNotes 3, ->
                        exports.createDefaultNotes 4, ->
                            exports.createDefaultNotes 5, ->
                                exports.createDefaultNotes 6, ->
                                    exports.createDefaultNotes 7, ->
                                        exports.createDefaultNotes 8, ->
                                            exports.createDefaultNotes 9, ->
                                                exports.createDefaultNotes 10, ->
                                                    exports.createDefaultNotes 11, ->
                                                        callback()

exports.waits = (done, time) ->
    func = -> done()
    setTimeout(func, time)

