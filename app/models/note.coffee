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

# Destroy notes which live under given path.
Note.destroyForPath = (path, callback) ->
    regExp = helpers.getPathRegExp path
    Note.destroySome { where: { path: { regex: regExp } } }, callback

# Change path for every note which are children of given path to the 
# new given one.
# It is the result of moving notes inside tree.
Note.updatePath = (path, newPath, newName, callback) ->
    Note.allForPath path, (err, notes) ->
        return callback(err) if err
        return callback(new Error("No note for this path")) \
            if notes.length == 0

        wait = notes.length
        done = (err) ->
            error = error || err
            if --wait == 0
                callback(error)

        nodeIndex = path.split("/").length - 2

        for note in notes
            note.path = newPath + note.path.substring(path.length)
            humanNames = note.humanPath.split(",")
            humanNames[nodeIndex] = newName
            note.humanPath = humanNames
            note.save done


Note.movePath = (path, dest, humanDest, callback) ->
    Note.allForPath path, (err, notes) ->
        return callback(err) if err
        return callback(new Error("No note for this path")) \
            if notes.length == 0

        wait = notes.length
        done = (err) ->
            error = error || err
            if --wait == 0
                callback(error)

        parentPath = path.split("/")
        parentPath.pop()
        pathLength = parentPath.join("/").length
        nodeIndex = parentPath.length - 1

        for note in notes
            note.path = dest + note.path.substring(pathLength)
            humanNames = note.humanPath.split(",")
            humanNames.shift(nodeIndex)
            humanNames = humanDest.concat humanNames
            note.humanPath = humanNames
            note.save done

