async = require('async')
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
        send length: notes.length, rows: notes


handle = (msg, code) ->
    msg  ?= 'An error occured'
    code ?= 500

    console.log msg.stack or msg
    send error: (msg.message or msg), code


###
# Grab note corresponding to id given in url before
# update, destroy or show actions
###
before 'load note', ->

    Note.find params.id, (err, note) =>
        return handle err if err
        return handle 'Note not found', 404 if note is null

        @note = note
        next()

, only: ['destroy', 'show', 'update', 'addFile', 'getFile', 'delFile']


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

    doCreate = (data) ->
        Note.create data, (err, note) ->
            return handle err if err

            note.index ["title", "content"], (err) ->
                console.log 'Indexing error', err if err
                # success even if indexing error
                send note, 201

    # console.log body.parent_id

    if body.parent_id is 'tree-node-all'
        body.path = [body.title]
        doCreate body
    else
        Note.find body.parent_id, (err, parent) ->
            body.path = parent.path.slice(0)
            body.path.push body.title
            doCreate body


###
# Update the note and tree in case of :
#   change of the title
#   change of the parent_id (move in the tree)
#   change of the content
###
action 'update', ->

    hasChanged = (body, note, attr) ->
        body[attr] and (body[attr] isnt note[attr])

    changedTitle =   hasChanged body, @note, 'title'
    changedParent =  hasChanged body, @note, 'parent_id'
    changedContent = hasChanged body, @note, 'content'

    # array of operations to be performed
    ops = []

    if changedTitle or changedParent
        # will change the note path and its children's
        ops.push (cb) =>
            @note.moveOrRename body.title, body.parent_id, (err) =>
                # console.log "MOVE OR RENAME DONE", err
                cb()

    ops.push (cb) =>
        body.lastModificationValueOf = (new Date()).getTime()
        @note.updateAttributes body, cb


    if changedTitle or changedContent
        # update the index
        ops.push (cb) => @note.index ["title", "content"], (err) ->
            console.log err
            #ignore errors on indexing
            cb()


    # console.log "BEFORE SERIES : ops", ops

    async.series ops, (err) ->
        # console.log "AFTERSERIES : ", err
        return handle err if err

        send success: 'Note updated', 200


## Remove given note from db.
action 'destroy', ->
    @note.destroyWithChildren (err) ->
        return handle err if err
        send success: 'Note succesfuly deleted', 200

###
## Perform a search for given query inside Cozy search engine.
###
action 'search', ->
    return handle "wrong request format", 400 unless body.query?

    Note.search body.query, (err, notes) ->
        return handle err if err

        send notes

###
# Return 10 more recents notes
###
action 'latest', ->
    query =
        descending: true
        limit: 10

    Note.request 'lastmodified', query, (err, notes) ->
        return handle err if err

        send notes

###
# return the tree of all notes
###
action 'tree', ->
    Note.tree (err, tree) ->
        return handle err if err

        send JSON.stringify tree

###
## Attach a file to given note.
###
action 'addFile', ->
    file = req.files["qqfile"] or req.files["file"]
    return handle "no files", 400 unless file?

    @note.attachFile file.path, {name: file.name}, (err) ->
        return handle err if err

        send success: true, msg:"Upload succeeds", 200

###
## Send corresponding to given name for given note.
###
action 'getFile', ->
    name = params.name

    @note.getFile name, (err, resp, body) ->
        return handle err if err
        return handle 'File not found', 404 if resp?.statusCode is 404
        return handle() if not resp? or resp.statusCode isnt 200

        send 200

    .pipe(res)


###
## Delete corresponding to given name for given note.
###
action 'delFile', ->
    name = params.name

    @note.removeFile name, (err, body) ->
        return handle err if err

        send succes: true, msg: 'File deleted', 200
