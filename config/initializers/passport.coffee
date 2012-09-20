##
# Authentication configuration
#
passport = require 'passport'
requests = require "../../common/requests"

User.defineRequest "all", requests.all, requests.checkError
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
