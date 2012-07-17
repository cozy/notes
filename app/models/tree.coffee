async = require("async")
DataTree = require('../../lib/tree').Tree

# Destroy all tree corresponding at given condition.
Tree.destroySome = (condition, callback) ->
    
    # Replace this with async lib call.
    wait = 0
    error = null
    done = (err) ->
        error = error || err
        if --wait == 0
            callback(error)

    Tree.all condition, (err, data) ->
        if err then return callback(err)
        if data.length == 0 then return callback(null)

        wait = data.length
        data.forEach (obj) ->
            obj.destroy done


# Remove all tree from database.
Tree.destroyAll = (callback) ->
    Tree.destroySome {}, callback

# Normally only one tree should be stored for this app. This function return
# that tree if it exists. If is does note exist a new empty tree is created
# and returned.
Tree.getOrCreate = (callback) ->
    Tree.all where: type:"Note", (err, trees) ->
        if err
            console.log err
            send error: 'An error occured', 500
        else if trees.length == 0
            Tree.create { struct: new DataTree().toJson(), type: "Note" }, callback
        else
            callback null, trees[0]

