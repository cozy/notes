async = require("async")
DataTree = require('../../lib/data-tree').DataTree


Tree.addNode = (note, parent_id, cbk)->

    _addNode = ->
        Tree.dataTree.addNode(note,parent_id)
        Tree.tree.updateAttributes struct: Tree.dataTree.toJson(), (err) ->
            if err
                console.log err
                cbk(err)
            else
                cbk(null)

    if !(Tree.tree)
        Tree.getOrCreate (err,tree)->
            if err
                cbk(err)
            else
                _addNode()
    else
        _addNode()



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
# returns callback(err,tree)
Tree.getOrCreate = (callback) ->
    Tree.all where: type:"Note", (err, trees) ->
        if err
            send error: 'An error occured', 500
        else if trees.length == 0
            newDataTree =  new DataTree()
            Tree.create { struct: newDataTree.toJson(), type: "Note" }, (err,tree)->
                Tree.dataTree = newDataTree
                Tree.tree     = tree
                callback(null,tree)
        else
            Tree.tree = trees[0]
            Tree.dataTree = new DataTree(trees[0].struct)
            callback(null, trees[0])

