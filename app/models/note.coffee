async = require("async")
helpers = require('../../client/app/helpers') 

###
# DestroyNote corresponding to given condition
# TODO optimise deletion : each deletion requires on request.
# This method doesn't update the tree. 
# USE FOR INIT DATABASE ONLY
###
Note.destroySome = (condition, callback) ->

    # TODO FRU : Replace this with async lib call.
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


###
# Delete all notes.
# This method doesn't update the tree.
# USE FOR INIT DATABASE ONLY
###
Note.destroyAll = (callback) ->
    Note.destroySome {}, callback


###*
 * Destroy a note and its children and update the tree.
 * @param  {string} nodeId id of the note to delete
 * @param  {function} cbk    cbk(error) is executed at the end returning null or the error.
###
Note.destroy = (nodeId, cbk)->

    # called in parallele to delete each note in the db
    _deleteNote = (noteId,cbk)->
        Note.find noteId, (err, note)->
            note.destroy cbk
    
    # vars
    dataTree = Tree.dataTree

    # walk through dataTree to remove the node and all its children
    nodesToDelete = dataTree.removeNode(nodeId)
    nodesToDelete.push(nodeId)

    # deletion in // of all the notes in the db
    async.forEach nodesToDelete, _deleteNote, (err)->

        # then we can save the tree
        Tree.tree.updateAttributes struct: dataTree.toJson(), (err) ->
            if err
                cbk(err)
            else
                cbk(null)