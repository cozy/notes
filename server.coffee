americano       = require 'americano'
RealtimeAdapter = require 'cozy-realtime-adapter'

americano.start
    name: 'Notes'
    port: process.env.PORT or 9201

, (app, server) ->

    RealtimeAdapter server: server, ['note.*', 'task.*', 'alarm.*']