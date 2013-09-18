notes = require './notes'

module.exports =

    "tree":
        get:    notes.tree

    "notes":
        get:    notes.all
        post:   notes.create

    "notes/latest":
        get:    notes.latest

    "notes/search":
        post:   notes.search

    "notes/:id":
        get:    notes.show
        put:    notes.update
        delete: notes.destroy

    "notes/:id/files":
        post:   notes.addFile

    "notes/:id/files/:name":
        get:    notes.getFile
        delete: notes.delFile

