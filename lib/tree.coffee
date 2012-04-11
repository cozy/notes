slugify = require('../client/app/helpers').slugify

# JS object with some feature to add easily properties from a string 
# representation.
# JS object with properties like this :
# 
# all:
#   todo: {}
#   recipe:
#     dessert:
#       brownie: {}
#
# could be created with this code :
# tree = new Tree
# tree.addNode "todo"
# tree.addNode "recipe/dessert/brownie"
#
class exports.Tree

    # All trees have a root property called all
    constructor: (struct) ->
        if struct != undefined
            @all = struct.all
        else
            @all = name: "All"

    # Add a node to the tree. It needs the complete path to add a node.
    # If parent nodes does not exist, they are created too.
    addNode: (path, name, id) ->
        nodes = @_getCleanPath path

        currentNode = @all
        for pathNode in nodes
            pathNode = pathNode.replace("/-/g", "_")
            if currentNode[pathNode] != undefined
                currentNode = currentNode[pathNode]
            else
                currentNode[pathNode] = {}
                currentNode = currentNode[pathNode]

        newProperty = slugify(name).replace("/-/g", "_")
        currentNode[newProperty] =
            name: name
            id: id
        this
    

    # Return path as array and with human name instead of node name.
    getHumanPath: (path) ->
        nodes = @_getCleanPath path
        humanPath = []

        currentNode = @all
        console.log nodes
        for pathNode in nodes
            pathNode = pathNode.replace("/-/g", "_")
            humanPath.push(currentNode.name)
            if currentNode[pathNode]?
                currentNode = currentNode[pathNode]

        if currentNode?
            humanPath.push(currentNode.name)

        return humanPath

     # If exitsts, deletes node located at given path, else do nothing
    deleteNode: (path) ->
        nodes = @_getCleanPath path

        currentNode = @getNode path, 1
        delete currentNode[nodes.pop()] if currentNode != undefined

        this
        
    # Get node set at given path. Retrieve parent if limit = 1, great-parent
    # if limit = 2, ...
    # Default limit is 0
    getNode: (path, limit) ->
        limit = 0 if limit == undefined
        nodes = @_getCleanPath path

        currentNode = @all
        while currentNode != undefined and nodes.length > limit
            currentNode = currentNode[nodes.shift().replace("/-/g", "_")]
        
        currentNode


    # Change both human and machine node name.
    updateNode: (path, newName) ->
        nodes = @_getCleanPath path

        currentNode = @getNode path, 1
        if currentNode != undefined
            node = nodes.pop()
            slug = slugify(newName).replace("/-/g", "_")
            currentNode[slug] = currentNode[node]
            delete currentNode[node] if currentNode != undefined
            currentNode[slug].name = newName

        node
    

    # Transform string path to array path while removing first node (all node).
    _getCleanPath: (path) ->
        nodes = path.split("/")
        nodes.shift() # remove empty char
        nodes.shift() # remove all node
        nodes


    # Json representation of the tree
    toJson: ->
        JSON.stringify(@)

