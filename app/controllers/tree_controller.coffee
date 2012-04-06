DataTree = require('../../lib/tree').Tree


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


action 'tree', ->
    send JSON.parse(@tree.struct)

action 'create', ->
    path = body.path

    if path != undefined
        data = new DataTree JSON.parse(@tree.struct)
        data.addNode path
        tree = new Tree
            struct: data.toJson(),
        @tree.updateAttributes tree, (err) ->
            if err
                console.log err
                send error: "An error occured while node was created", 500
            else
                send success: "Node created", 201

    else
        send error: "No path sent", 400


action 'update', ->
    @note.updateAttributes note, (err) =>
        if !err
            send success: 'Note updated'
        else
            console.log err
            send error: 'Note can not be updated', 400

action 'destroy', ->
    @note.destroy (err) ->
        if err
            send error: 'Can not destroy note', 500
        else
            send success: 'Note succesfuly deleted'


