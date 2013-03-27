express = require 'express'
module.exports = (compound) ->
    app = compound.app
    app.enable 'coffee'

    app.use express.static  "#{app.root}/client/public", maxAge: 86400000
    app.use express.bodyParser(keepExtensions: true)
    app.use express.methodOverride()
    app.use app.router
