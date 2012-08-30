DataTree = require('../../lib/tree').Tree
helpers = require('../../client/app/helpers')

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

# Before each note list modification current tree is loaded. If it does not 
# exist it is created.
before 'load tree', ->
    createTreeCb = (err, tree) =>
        if err
            console.log err
            send error: 'An error occured while loading tree', 500
        else
            @tree = tree
            next()

    Tree.getOrCreate createTreeCb
, only: ['update', 'destroy', 'create']


# Actions

# Entry point, load first html page.
action 'index', ->
    render title: "Cozy Notes"

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
    dataTree = new DataTree JSON.parse(@tree.struct)
    
    @name = note.title
    @path = note.path.split("/")
    @path.pop()
    @path = @path.join("/")

    note.humanPath = dataTree.getHumanPath(@path)
    note.humanPath.push(@name)

    updateTree = (note) =>
        dataTree.addNode @path, @name, note.id

        @tree.updateAttributes struct: dataTree.toJson(), (err) =>
            if err
                console.log err
                send error: "An error occured while node was created", 500
            else
                send note, 201

    Note.create note, (err, note) =>
        if err
            send error: 'Note can not be created'
        else
            updateTree note

# Return a note 
action 'show', ->
    send @note, 200

# Update attributes with data given in body. If no data is provided for an 
# attribute it is not updated.
action 'update', ->
    updateNote = =>
        @note.updateAttributes body, (err) =>
            if err
                console.log err
                send error: 'Note can not be updated', 400
            else
                send success: 'Note updated'
    console.log "update"
    console.log body
    if body.title? and body.title != @note.title
        console.log "update.title"
        dataTree = new DataTree JSON.parse(@tree.struct)

        # Build new path from current path and new name
        @newName = body.title
        nodes = @note.path.split("/")
        nodes.pop()
        nodes.push helpers.slugify(@newName)
        @newPath = nodes.join("/")
         
        # Update tree
        dataTree.updateNode @note.path, @newName

        # Save Tree 
        @tree.updateAttributes struct: dataTree.toJson(), (err) =>
            if err
                console.log err
                send error: "An error occured while node was created", 500
            else
                # Update note children 
                Note.updatePath @note.path, @newPath, @newName, updateNote

    else if body.path? and body.path != @note.path

        console.log "update.path " + @tree.struct
        @dataTree = new DataTree JSON.parse(@tree.struct)
        @dest = body.path.split("/")
        @dest.pop()
        @dest = @dest.join("/")
        @dataTree.moveNode @note.path, @dest
        @humanDest = @dataTree.getHumanPath @dest

        callback = (err) ->
             if err
                 console.log err
                 send error: "An error occured while node was moved", 500
             else
                 send success: "Node succesfully moved", 200

        @tree.updateAttributes struct: @dataTree.toJson(), (err) =>
            if err
                console.log err
                send error: "An error occured while node was moved", 500
            else
                Note.movePath @note.path, @dest, @humanDest, callback

    else
        updateNote()


# Remove given note from db.
action 'destroy', ->
    
    @dataTree = new DataTree JSON.parse(@tree.struct)
    @dataTree.deleteNode @note.path

    updateTree = =>
        @tree.updateAttributes struct: @dataTree.toJson(), (err) =>
            if err
                console.log err
                send error: "An error occured while node was deleted", 500
            else
                send success: 'Note succesfuly deleted'

    Note.destroyForPath @note.path, (err) ->
        if err
            console.log err
            send error: "An error occured while node was deleted", 500
        else
            updateTree()
