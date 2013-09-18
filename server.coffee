americano       = require 'americano'
RealtimeAdapter = require 'cozy-realtime-adapter'

americano.start
    name: 'Notes'
    port: process.env.PORT or 9250

, (app, server) ->

    # @TODO change this once americano PR#10 has been merged
    app.param 'id', require('./server/controllers/notes').find

    RealtimeAdapter server: server, ['note.*', 'task.*', 'alarm.*']