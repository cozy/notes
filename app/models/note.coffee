async = require("async")
helpers = require('../../client/app/helpers')

# DestroyNote corresponding to given condition
# TODO optimise deletion : each deletion requires on request.
Note.destroySome = (condition, callback) ->

    # Replace this with async lib call.
    wait = 0
    error = null
    done = (err) ->
        error = error || err
        if --wait == 0
            callback(error)

    Note.all condition, (err, data) ->
        if err then return callback(err)
        if data.length == 0 then return callback(null)

        wait = data.length
        data.forEach (obj) ->
            obj.destroy done

# Delete all notes.
Note.destroyAll = (callback) ->
    Note.destroySome {}, callback

# Return notes which live under given path.
Note.allForPath = (path, callback) ->
    regExp = helpers.getPathRegExp path
    Note.all { where: { path: { regex: regExp } } }, callback


