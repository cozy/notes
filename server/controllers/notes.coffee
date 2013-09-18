async = require 'async'
Note  = require '../models/note'
###--------------------------------------#
# Helpers
###


handleErr = (res, msg, code) ->
    msg  ?= 'An error occured'
    code ?= 500

    console.log msg.stack or msg
    res.send error: (msg.message or msg), code


###
# Grab note corresponding to id given in url before
# update, destroy or show actions
###
module.exports.find = (req, res, next, id) ->

    Note.find id, (err, note) =>
        return handleErr res, err if err
        return handleErr res, 'Note not found', 404 if note is null

        req.note = note
        next()


###--------------------------------------#
# Actions
###

###
# Return all notes
###
module.exports.all = (req, res) ->
    Note.all (err, notes) ->
        return res.send error: "Retrieve notes failed", 500 if err
        res.send length: notes.length, rows: notes

###
# Return a note
###
module.exports.show = (req, res) ->
    res.send req.note, 200

###
# Create a new note from data given in the body of request
# params : post object :
#               { title : "the title, mandatory",
#                 parent_id : "the parent note, mandatory, null if root"}
#          Other attributes of a note are optionnal (content, tags)
###
module.exports.create = (req, res) ->

    body = req.body

    doCreate = (data) ->
        Note.create data, (err, note) ->
            return handleErr res, err if err

            note.index ["title", "content"], (err) ->
                console.log 'Indexing error', err if err
                # success even if indexing error
                res.send note, 201

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
module.exports.update = (req, res) ->

    body = req.body


    hasChanged = (body, note, attr) ->
        body[attr] and (body[attr] isnt note[attr])

    changedTitle =   hasChanged body, req.note, 'title'
    changedParent =  hasChanged body, req.note, 'parent_id'
    changedContent = hasChanged body, req.note, 'content'

    # array of operations to be performed
    ops = []

    if changedTitle or changedParent
        # will change the note path and its children's
        ops.push (cb) ->
            req.note.moveOrRename body.title, body.parent_id, (err, newPath) ->
                body.path = newPath
                cb err

    ops.push (cb) =>
        body.lastModificationValueOf = (new Date()).getTime()
        req.note.updateAttributes body, cb


    if changedTitle or changedContent
        # update the index
        ops.push (cb) => req.note.index ["title", "content"], (err) ->
            console.log err
            #ignore errors on indexing
            cb()

    async.series ops, (err) ->
        # console.log "AFTERSERIES : ", err
        return handleErr res, err if err

        res.send success: 'Note updated', 200


## Remove given note from db.
module.exports.destroy = (req, res) ->
    req.note.destroyWithChildren (err) ->
        return handleErr res, err if err
        res.send success: 'Note succesfuly deleted', 204

###
## Perform a search for given query inside Cozy search engine.
###
module.exports.search = (req, res) ->
    return handleErr res, "wrong request format", 400 unless req.body.query?

    Note.search req.body.query, (err, notes) ->
        return handleErr res, err if err

        res.send notes

###
# Return 10 more recents notes
###
module.exports.latest = (req, res) ->
    query =
        descending: true
        limit: 10

    Note.request 'lastmodified', query, (err, notes) ->
        return handleErr res, err if err

        res.send notes

###
# return the tree of all notes
###
module.exports.tree = (req, res) ->
    Note.tree (err, tree) ->
        return handleErr res, err if err

        res.send JSON.stringify tree

###
## Attach a file to given note.
###
module.exports.addFile = (req, res) ->
    file = req.files["qqfile"] or req.files["file"]
    return handleErr res, "no files", 400 unless file?

    req.note.attachFile file.path, {name: file.name}, (err) ->
        # return handleErr res, err if err

        res.send success: true, msg:"Upload succeeds", 200

###
## Send corresponding to given name for given note.
###
module.exports.getFile = (req, res) ->
    name = req.params.name

    req.note.getFile name, (err, resp, body) ->
        # return handleErr res, err if err
        return handleErr res, 'File not found', 404 if resp?.statusCode is 404
        return handleErr res if not resp? or resp.statusCode isnt 200

        res.send 200

    .pipe(res)


###
## Delete corresponding to given name for given note.
###
module.exports.delFile = (req, res) ->
    name = req.params.name

    req.note.removeFile name, (err, body) ->
        return handleErr res, err if err

        res.send succes: true, msg: 'File deleted', 200
