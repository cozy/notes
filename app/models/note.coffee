module.exports = (compound, Note) ->

    async = require 'async'
    requests = require '../../common/requests'

    Note.all = (callback) -> Note.request "all", callback

    ###
    # Delete all notes.
    # This method doesn't update the tree.
    # USE FOR INIT DATABASE ONLY
    ###
    Note.destroyAll = (callback) ->
        Note.requestDestroy "all", callback


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
