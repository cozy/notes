
# Remove all notes and tree from DB.
module.exports.cleanDB = (callback) ->
    Note = require '../server/models/note'
    Task = require '../server/models/task'
    Alarm = require '../server/models/alarm'
    Contact = require '../server/models/contact'
    Client = require('request-json').JsonClient

    Note.requestDestroy 'all', (err) ->
        return callback err if err
        Task.requestDestroy 'all', (err) ->
            return callback err if err
            Contact.requestDestroy 'all', (err) ->
                return callback err if err
                Alarm.requestDestroy 'all', (err) ->
                    return callback err if err

                    indexer = new Client("http://localhost:9102/")
                    indexer.del "clear-all/", (err, response) ->
                        console.log err if err
                        callback null, err?.code is 'ECONNREFUSED'

                    , false #do not parse

module.exports.fakeIndexer = ->
    http = require 'http'
    server = http.createServer (req, res) ->
        firstcall = true
        body = ""
        req.on 'data', (chunk) ->
            body += chunk
        req.on 'end', ->
            unless server.expectedId
                res.writeHead 200, 'Content-Type': 'application/json'
                res.end JSON.stringify 'OK'
                return

            if firstcall
                firstcall = false
                res.writeHead 200, 'Content-Type': 'application/json'
                res.end JSON.stringify ids:[server.expectedId]
            else
                res.writeHead 200, 'Content-Type': 'application/json'
                res.end JSON.stringify ids:[]
    return server

module.exports.createThreeContacts = (done) ->
    Contact = require '../server/models/contact'
    require('async').eachSeries [1..3], (idx, callback) ->
        contact =
            fn: "Mister Contact #{idx}"

        Contact.create contact, callback

    , done


module.exports.cleanModelCache = (done) ->
    americano = require('americano-cozy')
    delete americano.db.models.Note
    delete americano.db.definitions.Note
    delete americano.db.adapter._models.Note
    done()


module.exports.createOldNote = (done) ->

    # Create oldSchool model's definition
    americano = require('americano-cozy')

    # replace jugglingdb model def with old
    Note = americano.getModel 'Note',
        title                   : type: String , index: true
        content                 : type: String , default: ''
        parent_id               : String
        path                    : String
        tags                    : String
        humanPath               : String
        version                 : String

    old =
        title     : "test"
        content   : "ctest"
        tags      : "[]"
        parent_id : "tree-node-all"
        path      : JSON.stringify ["test"]
        humanPath : []
        version   : "1"

    # create one instance
    Note.create old, (err, note) =>
        return done err if err
        @oldnoteid = note.id

        old =
            title     : "toast"
            content   : "ctoast"
            tags      : []
            parent_id : @oldnoteid
            path      : JSON.stringify ["test", "toast"]
            humanPath : "[]"
            version   : "1"

        Note.create old, (err, note2) =>
            return done err if err
            @oldnoteid2 = note2.id
            done()