americano = require 'americano-cozy'

module.exports =
    note:
        all: americano.defaultRequests.all
        path: (note) -> emit note.path, note
        tree: (note) -> emit note.parent_id, note.title
        lastmodified: (note) -> emit note.lastModificationValueOf, note
    alarm:
        all: americano.defaultRequests.all
    contact:
        all: americano.defaultRequests.all
    todolist:
        all: (doc) -> emit doc._id, doc
    tree:
        all: (doc) -> emit doc.type, doc
    task:
        all: americano.defaultRequests.all