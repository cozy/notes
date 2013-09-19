americano       = require 'americano'
RealtimeAdapter = require 'cozy-realtime-adapter'

americano.start
    name: 'Notes'
    port: process.env.PORT or 9250

, (app, server) ->

    # @TODO change this once americano PR#10 has been merged
    app.param 'noteid', require('./server/controllers/notes').fetch
    app.param 'contactid', require('./server/controllers/contacts').fetch
    app.param 'alarmid', require('./server/controllers/alarms').fetch
    app.param 'taskid', require('./server/controllers/tasks').fetch

    RealtimeAdapter server: server, ['note.*', 'task.*', 'alarm.*']