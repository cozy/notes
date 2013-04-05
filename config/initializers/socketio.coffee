module.exports = (compound) ->

    sio = require 'socket.io'
    compound.io = sio.listen compound.server

    compound.io.set 'log level', 2
    compound.io.set 'transports', ['websocket']

    redis = require 'redis'
    client = redis.createClient()
    client.on 'pmessage', (pat, ch, msg) ->
        compound.logger.write "redis #{ch} #{msg}"
        compound.io.sockets.emit ch, msg

    client.psubscribe 'note.*'
    client.psubscribe 'task.*'