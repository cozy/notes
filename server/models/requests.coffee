americano = require 'americano-cozy'

module.exports =
    note:
        all: americano.defaultRequests.all
        path: (note) -> emit note.path, note
        tree: (note) -> emit note.parent_id, note.title
        lastmodified: (note) -> emit note.lastModificationValueOf, note