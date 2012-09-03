helpers = require('../../client/app/helpers')

load 'application' # TODO BJA : utilité ?



# Helpers

# Return to client a note list like this
# { length: number of note, rows: note list }
returnNotes = (err, notes) ->
    if err
        console.log err
        send error: "Retrieve notes failed.", 500
    else
        send length: notes.length, rows: notes

# Grab note corresponding to id given in url before loading action.
before 'load note', ->
    Note.find params.id, (err, note) =>
        if err
            send error: 'An error occured', 500
        else if note is null
            send error: 'Note not found', 404
        else
            @note = note
            next()
, only: ['update', 'destroy', 'show']

# Before each note list modification current tree is loaded. If it does not 
# exist it is created.
before 'load tree', ->
    createTreeCb = (err, tree) =>
        if err
            console.log err
            send error: 'An error occured while loading tree', 500
        else
            next()

    Tree.getOrCreate createTreeCb, only: ['update', 'destroy', 'create']





# Actions

# Return all notes
action 'all', ->
    Note.all returnNotes

# Create a new note from data given in the body of request
action 'create', ->
    # note = new Note body
    Note.create body, (err, note) ->
        if err
            send error: 'Note can not be created'
        else
            debugger;
            Tree.addNode note, body.parent_id, (err)->
                if err
                    # TODO : roll back the creation of the note.
                    send error: 'Note can not be created'
                else
                    console.log 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
                    console.log note.path
                    debugger;
                    note.updateAttributes path: note.path, (err) ->
                        if err
                            # TODO : roll back the creation of the note.
                            send error: 'Note can not be created'
                        else
                            send note, 201


