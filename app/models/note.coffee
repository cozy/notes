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
        wait = data.length
        data.forEach (obj) ->
            obj.destroy done
        if data.length == 0
            callback(null)

