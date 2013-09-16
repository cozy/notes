module.exports = (compound, Note) ->

    Tree = compound.models.Tree

    async = require 'async'

    Note.all = (callback) -> Note.request "all", callback

    ###
    # Delete all notes.
    # This method doesn't update the tree.
    # USE FOR INIT DATABASE ONLY
    ###
    Note.destroyAll = (callback) ->
        Note.requestDestroy "all", callback

    ###
    # Old notes were stored with stringified path, this reverses it
    ###
    Note.patchPath = (note, callback) ->
        if typeof note.path is 'string'
            path = JSON.parse(note.path)
            note.updateAttributes path: path, callback
        else
            callback()


    Note.tree = (callback) ->
        Note.rawRequest "tree", {}, (err, notes) ->

            byId = {}
            tree = children:[], data:'All', attr: id: 'tree-node-all'
            for note in notes
                format =
                    parent: note.key
                    children: []
                    data: note.value
                    attr: id: note.id

                byId[note.id] = format
                tree.children.push format if note.key is 'tree-node-all'


            for key, format of byId
                byId[format.parent]?.children.push format
                delete format.parent

            callback null, tree


    Note::moveOrRename = (newTitle, newParent, callback) ->


        parent_id = newParent or @parent_id
        title = newTitle or @title

        if parent_id is 'tree-node-all'
            @updatePath [title], callback

        else
            Note.find parent_id, (err, parent) =>
                path = parent.path.slice(0)
                path.push title
                @updatePath path, callback

    Note::updatePath = (newPath, callback) ->

        oldPath = @path.slice(0) # [a, b, oldtitle]


        # arguments to be passed to splice
        # replace oldPath by newPath
        # ~ path.splice 0, oldPath.length, newPath[0], newPath[1], ..., title
        spliceArgs = newPath.slice(0) # newpath = [d, e, newtitle]
        spliceArgs.unshift oldPath.length
        spliceArgs.unshift 0 # [0, 3, d, e, newtitle]


        # console.log oldPath
        # console.log spliceArgs

        #get note and subnotes
        query =
            startkey: oldPath # [a, b, oldtitle]
            endkey:   oldPath.concat [{}] # [a, b, oldtitle,{}]

        Note.request "path", query, (err, notes) ->

            # console.log query, spliceArgs, notes.length
            # console.log notes
            return callback err if err or not notes

            async.each notes, (note, cb) ->
                path = note.path
                path.splice.apply path, spliceArgs
                note.updateAttributes path: path, cb
            , callback

    Note::destroyWithChildren = (callback) ->

        oldPath = @path.slice(0)
        query =
            startkey: oldPath # [a, b, oldtitle]
            endkey:   oldPath.concat [{}] # [a, b, oldtitle,{}]

        console.log " QUERYIS = ", query

        Note.requestDestroy "path", query, callback
