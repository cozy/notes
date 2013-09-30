notes = require './notes'
contacts = require './contacts'
alarms = require './alarms'
tasks = require './tasks'

module.exports =

    # CONTACT MODEL
    "contactid":
        param: contacts.fetch

    "contacts":
        get:    contacts.list
    "contacts/:contactid":
        get:    contacts.read
        # no Update / Delete

    # ALARM MODEL

    "alarmid":
        param:  alarms.fetch

    "alarms":
        get:    alarms.list
        post:   alarms.create
    "alarms/:alarmid":
        get:    alarms.read
        put:    alarms.update
        delete: alarms.delete

    # TASK MODEL

    "taskid":
        param:  tasks.fetch

    "tasks":
        get:    tasks.list
        post:   tasks.create
    "tasks/:taskid":
        get:    tasks.read
        put:    tasks.update
        delete: tasks.delete

    # NOTE MODEL

    "tree":
        get:    notes.tree

    "noteid":
        param:   notes.fetch

    "notes":
        get:    notes.all
        post:   notes.create

    "notes/latest":
        get:    notes.latest

    "notes/search":
        post:   notes.search

    "notes/:noteid":
        get:    notes.show
        put:    notes.update
        delete: notes.destroy

    "notes/:noteid/files":
        post:   notes.addFile

    "notes/:noteid/files/:name":
        get:    notes.getFile
        delete: notes.delFile

