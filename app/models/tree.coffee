async = require("async")
DataTree = require('../../common/data-tree').DataTree
requests = require "../../common/requests"

## Requests



Tree.all = (params, callback) ->
    Tree.request "all", params, callback

###
# Add a node corresponding to the note in the dataTree.
# Save the tree
# Call at the end : cbk(error) after the tree is saved.
# Rq : the id of the created note is in the note itself
###
Tree.addNode = (note, parent_id, cbk)->
    Tree.dataTree.addNode(note,parent_id)
    Tree.tree.updateAttributes struct: Tree.dataTree.toJson(), (err) ->
        if err
            cbk(err)
        else
            cbk(null)


###
# Moves or rename a node.
# Update the title in the dataTree.
# update the path of the note and propagates to its children.
# Save the tree
# Call at the end : cbk(error) after the tree is saved.
###
Tree.moveOrRenameNode = (noteId, newTitle, newParentId, cbk) ->

    # params : noteDataItem = {id:"note id", path: "[note path, an array]"}
    _updateNotePath = (noteDataItem, cbk) ->
        noteDataItem.path = JSON.stringify(noteDataItem.path)
        note = new Note noteDataItem
        note.updateAttributes(noteDataItem, cbk)

    # update the dataTree
    dataTree = Tree.dataTree
    if newTitle
        dataTree.updateTitle(noteId, newTitle) # synchronous operation
    if newParentId
        dataTree.moveNode(noteId, newParentId) # synchronous method

    # get all the children and their paths in an array to update them
    notes4pathUpdate = dataTree.getPaths(noteId)

    # synchronisation of the update of all the notes
    async.forEach notes4pathUpdate, _updateNotePath, ->
        # then we can save the tree
        Tree.tree.updateAttributes struct: dataTree.toJson(), (err) ->
            if err
                cbk(err)
            else
                newPath = dataTree.getPath(noteId)
                cbk(null)

###
# Remove all tree from database.
# USE FOR INIT DATABASE ONLY
###
Tree.destroyAll = (callback) ->
    Tree.requestDestroy "all", callback


###
# Normally only one tree should be stored for this app. This function return
# that tree if it exists. If is does note exist a new empty tree is created
# and returned.
# returns callback(err,tree)
###
Tree.getOrCreate = (callback) ->
    Tree.all key:"Note", (err, trees) ->
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

###
# retuns the path of the note in the cbk(err, path)
###
Tree.getPath = (note_id, cbk)->
    path = Tree.dataTree.getPath(note_id)
    return path
