load 'application'


###--------------------------------------#
# Helpers
###

###
# Return to client a note list like this
# { length: number of note, rows: note list }
###
returnNotes = (err, notes) ->
    if err
        console.log "retun ???????"
        console.log err
        send error: "Retrieve notes failed.", 500
    else
        # due to jugglingdb pb, arrays are stored as json
        notes.forEach (nt)->
            nt.path = JSON.parse nt.path 
        send length: notes.length, rows: notes

###
# Grab note corresponding to id given in url before 
# update, destroy or show actions
###
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
, only: ['destroy', 'show']


###
# Before each note list modification current tree is loaded. If it does not 
# exist it is created.
###
before 'load tree', ->

    createTreeCb = (err, tree) ->
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
# params : post object : 
#               { title : "the title, mandatory",
#                 parent_id : "the parent note, mandatory, null if root"}
#          Other attributes of a note are optionnal (content, tags)
###
action 'create', ->
    console.log " \nACTION CREATE - " + body.title + '  ' + body.parent_id
    console.log body
    parent_id = body.parent_id
    path = Tree.getPath parent_id
    path.push(body.title)
    body.path = JSON.stringify(path) # due to jugglingdb pb, arrays are stored as json
    Note.create body, (err, note) ->
        if err
            # TODO : roll back the creation of the note.
            send error: 'Note can not be created'
        else
            Tree.addNode note, parent_id, (err)->
                if err
                    # TODO : roll back the creation of the note.
                    send error: 'Note can not be created'
                else
                    note.path = JSON.parse(note.path) # due to jugglingdb pb, arrays are stored as json
                    console.log note
                    send note, 201
###
# Update the note and tree in case of :
#   change of the title
#   change of the parent_id (move in the tree)
#   change of the content
###
action 'update', ->
    # console.log "\nDEBUGGING UPDATE : " + body.title + '  ' + body.parent_id
    cbk = (err) ->
            if err
                send error: 'Note can not be updated', 400
            else
                send success: 'Note updated', 200

    #if the title of the note changes
    dataTreeNode = Tree.dataTree.nodes[params.id]
    isNewTitle   = body.title? and body.title != dataTreeNode.data
    isNewParent  = body.parent_id? and body.parent_id != dataTreeNode._parent._id
    if isNewTitle or isNewParent
        # update the path of the note in the tree.
        # rq : the path of note's children are impacted, this operation updates
        #      the note and its children paths and the tree.
        #      The call back is called only when the tree and notes are saved.
        Tree.moveOrRenameNode params.id, body.title, body.parent_id, (err)->
            newData    = {}
            isToUpdate = false
            if body.content
                newData.content = body.content
                isToUpdate = true
            if isNewTitle
                newData.title = body.title
                isToUpdate = true
            if body.tags
                newData.tags = body.tags
                isToUpdate = true
            if isNewParent
                newData.parent_id = body.parent_id
                isToUpdate = true
            if isToUpdate
                newData.id = params.id
                Note.upsert(newData, cbk)
            else
                cbk(null)
    # neither title nor path is changed, the note can be updated immediately.
    else
        newData    = {}
        isToUpdate = false
        if body.content
            newData.content = body.content
            isToUpdate = true
        if body.tags
            newData.tags = body.tags
            isToUpdate = true
        if isToUpdate
            newData.id = params.id
            Note.upsert(newData, cbk)
        else
            cbk(null)
            
        


