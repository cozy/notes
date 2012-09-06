slugify = require('../client/app/helpers').slugify

###
# The aim of this class is to have a representation of the tree on server side.
# The structure is close to what expect jstree on client side so that a simple
# serialization can send the tree to the client .
# All manipulations of the TreeData - creation renaming move delete update - 
# are done through the manipulation of Note
# Structure of the tree :
#       nodes : {"id_1":node_1, ... ,"id_n":node_n} hash table of all node. 
#           Ids are the same as notes ids. 
#           If you want to access to the node corresponding to a note : node = nodes[note_id]
#       root : ref to the root node. Initialised with the node "All"
# Structure of a node :
#       _parent  : parentNode reference
#       _id      : note.id
#       children : []
#       data     : note.title  => "data" corresponds to jstree requirements
#       attr     : {id:note.id}
# Methods :
#     addNode: (note, parentNoteID) ->
#         return newNode
###
class exports.DataTree

    ###
    # constructor (jsonStruct)
    #    jsonStruct : optionnal : a json sting that represents a DataTree. Used when
    #                 retrieving an existing tree from the DB.
    ###
    constructor: (jsonStruct) ->
        if jsonStruct
            @nodes       = {}
            @root        = JSON.parse(jsonStruct)
            @root._parent = null
            @_initWalk(@root)
        else
            @root = 
                    _parent  : null
                    _id      : 'all'
                    children : []
                    data     : 'All'
                    attr     : {id:'tree-node-all'}
            @nodes = {all:@root}


    ### 
    # Walks through the children of a node in order to init
    # add nodes to this.nodes
    # set the parent property of each node
    ###
    _initWalk: (node)->
        this.nodes[node._id]=node
        for n in node.children
            n._parent=node
            @_initWalk(n)


    ###
    # Add a node to the tree as the last son of the given parentNote
    # note : a instance of Note 
    ###
    addNode: (note, parentNoteID) ->
        # console.log '***** DataTree.addNode ('+note+", " + parentNoteID
        if !parentNoteID
            parentNoteID = 'all'
        parentNode = @nodes[parentNoteID]
        newNode    =
            _parent  : parentNode
            _id      : note.id
            children : []
            data     : note.title
            attr     : {id:note.id}
        parentNode.children.push(newNode)
        @nodes[note.id] = newNode
        return newNode


    ###
    updates the title of a node, wich corresponds to its "data" propertie.
    ###
    updateTitle: (note, newTitle) ->
        @nodes[note.id].data = newTitle


    deleteNode: (nodeId) ->

    moveNode: (nodeToMove,nodeParent) ->


    ###
    params :
        node : a reference to a node or the id of a node.
    ###
    getPath: (node)->
        # console.log '***** getPath '+node
        if typeof node == "string"
            node = @nodes[node]
        path = []
        while node._parent != null
            node = node._parent
            path.push(node.data)
        return path


    ###
    # Return a json string of the root for persistance in the database
    # _parent is filtered in ordered to avoid circular references.
    # The _initWalk method adds _parent and @nodes when the json is retrieved
    # from db.
    ###

    toJson: ()->
        filter = ->
            if arguments[0] == '_parent'
                return undefined
            else
                return arguments[1]
        return JSON.stringify(@root, filter)


    ###
    # Return a json string of the root for the jsTree of web client
    # properties with a name beginning by "_" are filtered
    ###

    toJsTreeJson: ->
        filter = ->
            if arguments[0].charAt(0) == '_'
                return undefined
            else
                return arguments[1]
        return JSON.stringify(@root, filter)
        # return @root

