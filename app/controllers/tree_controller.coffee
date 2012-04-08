DataTree = require('../../lib/tree').Tree
slugify = require('../../client/app/helpers').slugify

before 'load tree', ->
    Tree.all (err, trees) =>
        if err
            console.log err
            send error: 'An error occured', 500
        else if trees.length == 0
            Tree.create { struct: new DataTree().toJson() }, (err, tree) =>
                if err
                    console.log err
                    send error: 'An error occured', 500
                else
                    @tree = tree
                    next()
        else
            @tree = trees[0]
            next()

before 'load path', ->
    @path = body.path

    if @path != undefined
        next()
    else
        send error: "No path sent", 400
, only: ['update', 'destroy', 'create']



action 'tree', ->
    send JSON.parse(@tree.struct)


action 'create', ->
    data = new DataTree JSON.parse(@tree.struct)
    name = body.name
    data.addNode @path, name
    tree = new Tree
        struct: data.toJson(),
    @tree.updateAttributes tree, (err) =>
        if err
            console.log err
            send error: "An error occured while node was created", 500
        else
            note = new Note
                path: @path
                humanPath: @path.split("/")
            Note.create note, (err, note) =>
                    if err
                        send error: 'Note can not be created'
                    else
                        send note, 201


action 'update', ->
    if body.newName != undefined
        newName = body.newName
        data = new DataTree JSON.parse(@tree.struct)
        data.updateNode @path, newName
        tree = new Tree
            struct: data.toJson(),
        @tree.updateAttributes tree, (err) ->
            if err
                console.log err
                send error: "An error occured while node was created", 500
            else
                send success: "Node succesfully updated", 200
    else
        send error: "No new name sent", 400


action 'destroy', ->
    data = new DataTree JSON.parse(@tree.struct)
    data.deleteNode @path
    tree = new Tree
        struct: data.toJson(),
    @tree.updateAttributes tree, (err) ->
        if err
            console.log err
            send error: "An error occured while node was created", 500
        else
            send success: "Node succesfully deleted", 200




