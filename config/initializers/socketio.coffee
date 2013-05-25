module.exports = (compound) ->

    cozyRealTime = require 'cozy-realtime-adapter'

    cozyRealTime compound, ['note.*', 'task.*', 'alarm.*']
