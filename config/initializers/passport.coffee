##
# Authentication configuration
#
passport = require 'passport'
helpers = require "../../lib/helpers"

User.defineRequest "all", helpers.all, helpers.checkError
User.all = (callback) ->
    User.request "all", callback

passport.serializeUser = (user, done) ->
    done null, user.email
  
passport.deserializeUser = (email, done) ->
    User.all (err, users) ->
        if users.length > 0
            done err, users[0]
        else
            done err, null
