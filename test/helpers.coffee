
Note = null
# init the compound application
# will create @app in context
# usage : before helpers.init require '../server'
exports.init = (instantiator) -> (done) ->
    @app = instantiator()
    @app.compound.on 'models', (models) ->
        {Note} = models
        done()

# Remove all notes and tree from DB.
exports.cleanDb = (callback) ->
    console.log "CLEAN DB"
    Note.destroyAll callback