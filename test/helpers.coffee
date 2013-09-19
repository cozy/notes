
# Remove all notes and tree from DB.
module.exports.cleanDB = (callback) ->
    Note = require '../server/models/note'
    Task = require '../server/models/task'
    Alarm = require '../server/models/alarm'
    Contact = require '../server/models/contact'
    Client = require('request-json').JsonClient

    Note.requestDestroy 'all', (err) ->
        Task.requestDestroy 'all', (err) ->
            Contact.requestDestroy 'all', (err) ->
                Alarm.requestDestroy 'all', (err) ->

                    if err
                        console.log err
                        return callback err

                    indexer = new Client("http://localhost:9102/")
                    indexer.del "clear-all/", (err, response) ->
                        console.log err if err
                        callback err
                    , false #do not parse

module.exports.createThreeContacts = (done) ->
    Contact = require '../server/models/contact'
    require('async').eachSeries [1..3], (idx, callback) ->
        contact =
            fn: "Mister Contact #{idx}"

        Contact.create contact, callback

    , done