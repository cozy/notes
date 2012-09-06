helpers = require('../../client/app/helpers')

load 'application'


###--------------------------------------#
# Helpers
###

# Return to client a note list like this
# { length: number of note, rows: note list }
returnNotes = (err, notes) ->
    if err
        console.log err
        send error: "Retrieve notes failed.", 500
    else
        # due to jugglingdb pb, arrays are stored as json
        notes.forEach (n)->
            n.path = JSON.parse n.path 

        send length: notes.length, rows: notes

# Grab note corresponding to id given in url before 
# update, destroy or show actions
before 'load note', ->
    Note.find params.id, (err, note) =>
        if err
            send error: 'An error occured', 500
        else if note is null
            send error: 'Note not found', 404
        else
            note.path = JSON.parse note.path # due to jugglingdb pb, arrays are stored as json
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



###--------------------------------------#
# Actions
###

###
# Return all notes
###
action 'all', ->
    Note.all(returnNotes)

###
# Return a note 
###
action 'show', ->
    send @note, 200

###
# Create a new note from data given in the body of request
###
action 'create', ->
    # note = new Note body
    Tree.getPath body.parent_id, (err, path)->
        if err
            # TODO : roll back the creation of the note.
            send {error: 'note can not be created'}
        else
            path.push(body.title)
            body.path = JSON.stringify(path) # due to jugglingdb pb, arrays are stored as json
            Note.create body, (err, note) ->
                if err
                    # TODO : roll back the creation of the note.
                    send error: 'Note can not be created'
                else
                    Tree.addNode note, body.parent_id, (err)->
                        if err
                            # TODO : roll back the creation of the note.
                            send error: 'Note can not be created'
                        else
                            note.path = JSON.parse(note.path) # due to jugglingdb pb, arrays are stored as json
                            send note, 201
###
# Update the note and tree in case of :
#   change of the title
#   change of the parent_id (move in the tree)
#   change of the content
###
action 'update', ->

    console.log body
    
    updateNote = =>
        @note.updateAttributes body, (err) =>
            if err
                console.log err
                send error: 'Note can not be updated', 400
            else
                send success: 'Note updated', 200

    #if the title of the note changes
    if body.title? and body.title != @note.title
        # update the path of the note in the tree.
        # rq : by doing this operation, the path of note's children are updated
        #      since the path of all notes is stored in the dataTree (chain 
        #      of node's parents)
        Tree.updateTitle @note, body.title, (err,newPath)->
            if err
                send error : "Note can not be renamed", 400
            else
                path[path.length-1] = body.title
                body.path = JSON.stringify(path) # due to jugglingdb pb, arrays are stored as json
                updateNote()

    # if note is moved in the tree ()
    else if body.parent_id? and body.parent_id != @note.parent_id
        Tree.moveNote @note, body.parent_id, (err,newPath)->
            if err
                send error : "Note can not be moved", 400
            else
                updateNote()
    
    # the update does'nt impact the tree, the note can be updated immediately
    else
        updateNote()
            
        


