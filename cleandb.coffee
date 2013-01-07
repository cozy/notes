server = require './server'

Tree.destroyAll ->
    Note.destroyAll ->
        console.log "all data are deleted"
        process.exit(0)
