
# Remove all notes and tree from DB.
module.exports.cleanDB = (callback) ->
    Note = require('../server/models/note')
    Client = require('request-json').JsonClient

    Note.destroyAll (err) ->

        if err
            console.log err
            return callback err

        indexer = new Client("http://localhost:9102/")
        indexer.del "clear-all/", (err, response) ->
            console.log err if err
            callback err
        , false #do not parse