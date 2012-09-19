##
# Authentication configuration
#
passport = require 'passport'

passport.serializeUser = (user, done) ->
    done null, user.email
  
passport.deserializeUser = (email, done) ->
    User.all (err, users) ->
        if users.length > 0
            done err, users[0]
        else
            done err, null
