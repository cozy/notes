load 'application'


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


# Actions

# Entry point, load first html page.
action 'index', ->
    render
        title: "Cozy Notes", test: false

action 'index-test', ->
    render "index",
        title: "Cozy Notes", test: true

# Return all notes
action 'all', ->
    Note.all returnNotes

# Return notes corresponding at a given path of the tree.
action 'allForPath', ->
    if body.path?
        Note.allForPath body.path, returnNotes
    else
        returnNotes(null, [])

# Create a new note from data given in body.
action 'create', ->
    note = new Note body
    Note.create note, (err, note) =>
        if err
            console.log err
            send error: 'Note can not be created'
        else
            send note, 201

# Return a note 
action 'show', ->
    send @note, 200

# Update attributes with data given in body. If no data is provided for an 
# attribute it is not updated.
action 'update', ->
    @note.updateAttributes body, (err) =>
        if err
            console.log err
            send error: 'Note can not be updated', 400
        else
            send success: 'Note updated'

# Remove given note from db.
action 'destroy', ->
    @note.destroy (err) ->
        if err
            console.log err
            send error: 'Can not destroy note', 500
        else
            send success: 'Note succesfuly deleted'


