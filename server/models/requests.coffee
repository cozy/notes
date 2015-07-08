americano = require 'americano-cozy'

module.exports =
    note:
        all:  (doc) -> emit doc._id, doc
        path: (note) -> emit note.path, note
        tree: (note) -> emit note.parent_id, note.title
        lastmodified: (note) -> emit note.lastModificationValueOf, note
    alarm:
        all: (doc) -> emit doc._id, doc
    contact:
        all: (doc) -> emit doc._id, doc
    todolist:
        all: (doc) -> emit doc._id, doc
    task:
        all: (doc) -> emit doc._id, doc