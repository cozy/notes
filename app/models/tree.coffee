async = require("async")
DataTree = require('../../lib/data-tree').DataTree


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
# Update in the dataTree the title of the node corresponding to the note.
# Save the tree
# update the path of the note and propagates to its children.
# Call at the end : cbk(error) after the tree is saved.
###
Tree.updateTitle = (noteId, newTitle, newParentId, cbk) ->

    # params : noteDataItem = {id:"note id", path: "[note path, an array]"}
    _updateNotePath = (noteDataItem, cbk) ->
        # if body.title
        #     noteDataItem.title = body.title
        # if body.content
        #     noteDataItem.content = body.content

        # console.log "\n_updateNotePath *******************"
        noteDataItem.path = JSON.stringify(noteDataItem.path)
        console.log noteDataItem    
        Note.upsert noteDataItem, (err)->
            cbk()

    # update the dataTree
    dataTree = Tree.dataTree
    if newTitle
        dataTree.updateTitle(noteId, newTitle) # synchronous operation
    if newParentId
        dataTree.moveNode(noteId, newParentId) # synchronous method
    console.log dataTree
    # get all the children and their paths in an array to update them
    notes4pathUpdate = dataTree.getPaths(noteId)
    # console.log "\nnotes4pathUpdate"
    # console.log notes4pathUpdate
    # synchronisation of the update of all the notes
    async.forEach notes4pathUpdate, _updateNotePath, ->
        # then we can save the tree
        Tree.tree.updateAttributes struct: dataTree.toJson(), (err) ->
            # console.log "tree.updateAttributes callback"
            # console.log err
            if err
                cbk(err)
            else
                newPath = dataTree.getPath(noteId)
                cbk(null)


###
# Move in the dataTree the node corresponding to the note.
# Save the tree
# Call at the end : cbk(error) after the tree is saved.
###
# Tree.moveNote = (noteId, newParentId, cbk) ->

#     # params : noteDataItem = {id:"note id", path: "[note path, an array]"}
#     _updateNotePath = (noteDataItem, cbk)->
#         noteDataItem.path = JSON.stringify(noteDataItem.path)
#         Note.upsert noteDataItem, cbk

#     # update the dataTree
#     dataTree = Tree.dataTree
#     dataTree.moveNode(noteId, newParentId) # synchronous method
#     # get all the children and their paths in an array to update them
#     notes4pathUpdate = dataTree.getPaths(noteId)
#     # synchronisation of the update of all the notes
#     async.forEach notes4pathUpdate, _updateNotePath, ->
#         # then we can save the tree
#         Tree.tree.updateAttributes struct: dataTree.toJson(), (err) ->
#             if err
#                 cbk(err)
#             else
#                 newPath = dataTree.getPath(noteId)
#                 cbk(null)


###
# Destroy all tree corresponding at given condition.
###
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


###
# Remove all tree from database.
###
Tree.destroyAll = (callback) ->
    Tree.destroySome {}, callback


###
# Normally only one tree should be stored for this app. This function return
# that tree if it exists. If is does note exist a new empty tree is created
# and returned.
# returns callback(err,tree)
###
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

###
# retuns the path of the note in the cbk(err, path)
###
Tree.getPath = (note_id, cbk)->
    path = Tree.dataTree.getPath(note_id)
    return path
