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
        console.log err
        send error: "Retrieve notes failed.", 500
    else
        # due to jugglingdb pb, arrays are stored as json
        notes.forEach (note) ->
            note.path = JSON.parse note.path
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
            # due to jugglingdb pb, arrays are stored as json
            note.path = JSON.parse note.path
            @note = note
            next()
, only: ['destroy', 'show', 'addFile', 'getFile', 'delFile']


###*
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
    parent_id = body.parent_id
    path = Tree.getPath parent_id
    path.push body.title
    # due to jugglingdb pb, arrays are stored as json
    body.path = JSON.stringify(path)
    Note.create body, (err, note) ->
        if err
            # TODO : roll back the creation of the note.
            send error: 'Note error: Note can not be created'
        else
            Tree.addNode note, parent_id, (err)->
                if err
                    # TODO : roll back the creation of the note.
                    send error: 'Tree error: Note can not be created'
                else
                    note.index ["title", "content"], (err) ->
                        # due to jugglingdb pb, arrays are stored as json
                        note.path = JSON.parse(note.path)
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
            send success: 'Note updated', 200

    saveAttributes = (isToIndex, note, newData) ->
        newData.lastModificationValueOf = (new Date()).getTime()
        if isToIndex
            note.updateAttributes newData, (err) ->
                if err
                    send error: true, msg: "Cannot update note", 500
                else
                    note.index ["title", "content"], cbk
        else
            note.updateAttributes newData, cbk


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
            isToIndex  = false
            if body.content
                newData.content = body.content
                isToUpdate = true
                isToIndex = true
            if isNewTitle
                newData.title = body.title
                isToUpdate = true
                isToIndex = true
            if body.tags
                newData.tags = body.tags
                isToUpdate = true
            if isNewParent
                newData.parent_id = body.parent_id
                isToUpdate = true
            if isToUpdate
                newData.id = params.id
                newData.version = body.version
                note = new Note newData
                saveAttributes isToIndex, note, newData
            else
                cbk(null)
    # neither title nor path is changed, the note can be updated immediately.
    else
        newData    = {}
        isToUpdate = false
        isToIndex  = false
        if body.content
            newData.content = body.content
            isToUpdate = true
            isToIndex = true
        if body.tags
            newData.tags = body.tags
            isToUpdate = true
        if isToUpdate
            newData.id = params.id
            newData.version = body.version
            note = new Note newData
            saveAttributes isToIndex, note, newData
        else
            cbk(null)

## Remove given note from db.
action 'destroy', ->
    Note.destroy params.id, ->
        send success: 'Note succesfuly deleted', 200

###
## Perform a search for given query inside Cozy search engine.
###
action 'search', ->
    if not body.query?
        send error: "wrong request format", 400
    else
        Note.search body.query, (err, notes) ->
            if err
                send error: "search failed", 500
            else
                send notes

action 'latest', ->
    query =
        descending: true
        limit: 10

    Note.request 'lastmodified', query, (err, notes) ->
        if err then send error: "latestfailed", 500
        else send notes

###
## Attach a file to given note.
###
action 'addFile', ->
    file = req.files["qqfile"]
    file = req.files["file"] unless file?
    if file?
        @note.attachFile file.path, {name: file.name}, (err) ->
            if err
                send error: "error occured while saving file", 500
            else
                send success: true, msg:"Upload succeeds", 200
    else
        send error: "no files", 400


###
## Send corresponding to given name for given note.
###
action 'getFile', ->
    name = params.name

    @note.getFile name, (err, resp, body) ->
        if err or not resp?
            send 500
        else if resp.statusCode is 404
            send 'File not found', 404
        else if resp.statusCode != 200
            send 500
        else
            send 200
    .pipe(res) # this is compound "magic" res = response variable


###
## Send corresponding to given name for given note.
###
action 'delFile', ->
    name = params.name

    @note.removeFile name, (err, body) ->
        if err
            send 500
        else
            send succes: true, msg: 'File deleted', 200
