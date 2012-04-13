async = require("async")
eyes = require("eyes")

DataTree = require('../../lib/tree').Tree
slugify = require('../../client/app/helpers').slugify

# Before each action current tree is loaded. If it does not exists it created.
before 'load tree', ->
    createTreeCb = (err, tree) =>
        if err
            console.log err
            send error: 'An error occured', 500
        else
            @tree = tree
            next()

    Tree.all (err, trees) =>
        if err
            console.log err
            send error: 'An error occured', 500
        else if trees.length == 0
            Tree.create { struct: new DataTree().toJson() }, createTreeCb
        else
            @tree = trees[0]
            next()


# Before each action that requires a path this one is excracted from the 
# request body.
before 'load path', ->
    @path = body.path

    if @path != undefined
        next()
    else
        send error: "No path sent", 400
, only: ['update', 'destroy', 'create']


# Returns complete tree.
action 'tree', ->
    send JSON.parse(@tree.struct)


# Create a node inside tree and create corresponding note.
action 'create', ->
    treeData = new DataTree JSON.parse(@tree.struct)
    name = body.name
    humanPath = treeData.getHumanPath(@path)
    humanPath.push(name)

    updateTree = (note) =>
        treeData.addNode @path, name, note.id
        tree = new Tree
            struct: treeData.toJson()

        @tree.updateAttributes tree, (err) =>
            if err
                console.log err
                send error: "An error occured while node was created", 500
            else
                send note, 201

    note = new Note
        path: "#{@path}/#{slugify name}"
        title: name
        humanPath: humanPath

    Note.create note, (err, note) =>
        if err
            send error: 'Note can not be created'
        else
            updateTree note


action 'update', ->

    changeNotesPath = (err, notes) =>
        if err
            console.log err
            send error: "An error occured while node was updated", 500
        else
            nodeIndex = @path.split("/").length - 2
            funcs = []

            callback = (err) ->
                if err
                    console.log err
                    send error: "An error occured while node was updated", 500
                else
                    send success: "Node succesfully updated", 200

            wait = notes.length
            done = (err) ->
                error = error || err
                if --wait == 0
                    callback(error)

            for note in notes
                note.path = newPath + note.path.substring(@path.length)
                humanNames = note.humanPath.split(",")
                humanNames[nodeIndex] = newName
                note.humanPath = humanNames
                note.save done

           if notes.length == 0
                callback(null)


            async.series funcs, (err, results) ->
            #    #console.log results


    if body.newName != undefined
        newName = body.newName
        nodes = @path.split("/")
        nodes.pop()
        nodes.push(slugify newName)
        newPath = nodes.join("/")
        data = new DataTree JSON.parse(@tree.struct)

        data.updateNode @path, newName
        tree = new Tree
            struct: data.toJson()

        @tree.updateAttributes tree, (err) =>
            if err
                console.log err
                send error: "An error occured while node was created", 500
            else
                slashReg = new RegExp "/", "g"
                reg = "^#{@path.replace(slashReg, "\/")}"
                Note.all { where: { path: { regex: reg } } }, changeNotesPath
    else
        send error: "No new name sent", 400


# Destroy a node inside and his childrens. Destroy all notes linked to that
# nodes.
action 'destroy', ->
    data = new DataTree JSON.parse(@tree.struct)
    data.deleteNode @path
    tree = new Tree
        struct: data.toJson(),

    destroyNotes = =>
        slashReg = new RegExp "/", "g"
        reg = "^#{@path.replace(slashReg, "\/")}"
        Note.destroySome { where: { path: { regex: reg } } }, (err) ->
            if err
                console.log err
                eyes.inspect(err)
                send error: "An error occured while node was deleted", 500
            else
                send success: "Node succesfully deleted", 200

    @tree.updateAttributes tree, (err) =>
        if err
            console.log err
            send error: "An error occured while node was deleted", 500
        else
            destroyNotes()


