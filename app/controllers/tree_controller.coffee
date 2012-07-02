
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


# Actions


# Returns complete tree.
action 'tree', ->
    send JSON.parse(@tree.struct)

