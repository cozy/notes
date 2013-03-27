module.exports = (compound) ->

    app = compound.app
    app.configure 'development', ->

        errorHandler = require('express').errorHandler
            dumpExceptions: true
            showStack: true

        app.enable 'log actions'
        app.enable 'env info'
        app.disable 'view cache'
        app.disable 'model cache'
        app.disable 'eval cache'
        app.use errorHandler
