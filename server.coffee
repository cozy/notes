americano       = require 'americano'
RealtimeAdapter = require 'cozy-realtime-adapter'
Note            = require './server/models/note'

americano.start
    name: 'Notes'
    port: process.env.PORT or 9201

, (app, server) ->
    RealtimeAdapter server: server, ['note.*', 'task.*', 'alarm.*', 'contact.*']
    Note.patchAllPathes (err) ->
        if err
            console.log "Failled to patch notes"
            console.log err.stack
            process.exit 1