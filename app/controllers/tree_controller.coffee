
DataTree = require('../../lib/tree').Tree
helpers = require('../../client/app/helpers')

load 'application'

# Helpers

# Before each action current tree is loaded. If it does not exists it created.
before 'load tree', ->
    createTreeCb = (err, tree) =>
        if err
            console.log err
            send error: 'An error occured while loading tree', 500
        else
            @tree = tree
            next()

    Tree.getOrCreate createTreeCb

# Before each action that requires a path this one is excracted from the 
# request body.
before 'load path', ->
    @path = body.path

    if @path != undefined
        next()
    else
        send error: "No path sent", 400
, only: ['update', 'destroy', 'create', 'move']


# Actions


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

        @tree.updateAttributes struct: treeData.toJson(), (err) =>
            if err
                console.log err
                send error: "An error occured while node was created", 500
            else
                send note, 201

    note = new Note
        path: "#{@path}/#{helpers.slugify name}"
        title: name
        humanPath: humanPath

    Note.create note, (err, note) =>
        if err
            send error: 'Note can not be created'
        else
            updateTree note


# Update node name and human name: update tree and update all notes which have 
# this note as parent.
action 'update', ->

     callback = (err) ->
         if err
             console.log err
             send error: "An error occured while node was updated", 500
         else
             send success: "Node succesfully updated", 200

     if body.newName?
         newName = body.newName
         data = new DataTree JSON.parse(@tree.struct)
 
         # Build new path from current path and new name
         nodes = @path.split("/")
         nodes.pop()
         nodes.push(helpers.slugify newName)
         newPath = nodes.join("/")
         
         # Update tree
         data.updateNode @path, newName

         # Update db data
         @tree.updateAttributes struct: data.toJson(), (err) =>
             if err
                 console.log err
                 send error: "An error occured while node was created", 500
             else
                 Note.updatePath @path, newPath, newName, callback
     else
         send error: "No new name sent", 400


# Destroy a tree node and his childrens. Destroy all notes linked to that
# nodes.
action 'destroy', ->
    data = new DataTree JSON.parse(@tree.struct)
    data.deleteNode @path
    tree = new Tree
        struct: data.toJson()

    destroyNotes = =>
        Note.destroyForPath @path, (err) ->
            if err
                console.log err
                send error: "An error occured while node was deleted", 500
            else
                send success: "Node succesfully deleted", 200

    @tree.updateAttributes tree, (err) =>
        if err
            console.log err
            send error: "An error occured while node was deleted", 500
        else
            destroyNotes()


# Move a node to another parent place : update tree object and all path of
# nodes which are linked to moved node.
action 'move', ->
    data = new DataTree JSON.parse(@tree.struct)
    dest = body.dest
    data.moveNode @path, dest
    humanDest = data.getHumanPath dest

    tree = new Tree
        struct: data.toJson()
       
    callback = (err) ->
         if err
             console.log err
             send error: "An error occured while node was moved", 500
         else
             send success: "Node succesfully moved", 200

    @tree.updateAttributes tree, (err) =>
        if err
            console.log err
            send error: "An error occured while node was moved", 500
        else
            Note.movePath @path, dest, humanDest, callback
