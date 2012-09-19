express = require 'express'
RedisStore = require('connect-redis')(express)

try
    require "../../cozy-home/settings"
catch error
    global.secret_cookie_key = "secret"
    global.secret_session_key = "secret"

app.configure ->
    cwd = process.cwd()
    
    app.set 'views', cwd + '/app/views'
    app.set 'view engine', 'jade'
    app.set 'view options', complexNames: true
    app.enable 'coffee'

    app.use express.static(cwd + '/client/public', maxAge: 86400000)
    app.use express.bodyParser()
    app.use express.cookieParser 'secret'
    app.use express.session secret: 'secret', store: new RedisStore(db:'cozy')
    app.use express.methodOverride()
    app.use passport.initialize()
    app.use passport.session()
    app.use app.router

