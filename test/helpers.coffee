
# Remove all notes and tree from DB.
exports.cleanDb = (callback) ->
    Note.destroyAll ->
        Tree.destroyAll callback
        ##Tree.destroyAll ->
            ##TestArrayObj.destroyAll callback
            
