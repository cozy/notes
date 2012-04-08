Tree = require("./widgets/tree").Tree

# Main view that manages interaction between toolbar, navigation and notes
class exports.HomeView extends Backbone.View
    id: 'home-view'


    # Tree functions

    # Send a request for a tree modification.
    sendTreeRequest: (type, data) ->
        $.ajax
            type: type
            url: "tree"
            data: data
            error: (data) ->
                if data and data.msg
                    alert data.msg
                else
                    alert "Server error occured."

    # Create a new folder inside currently selected node.
    createFolder: (path) =>
        @sendTreeRequest "POST", path: path
        
    # Rename currently selected node.
    renameFolder: (path, newName) =>
        @sendTreeRequest "PUT",
            path: path
            newName: newName
        
    # Delete currently selected node.
    deleteFolder: (path) =>
        @sendTreeRequest "DELETE", path: path


    # Initializers

    render: ->
        $(@el).html require('./templates/home')
        this

    # Fetch data loads notre tree and configure it.
    fetchData: ->
        $.get "tree/", (data) =>
            @tree = new Tree @.$("#nav"), data,
                onCreate: @createFolder
                onRename: @renameFolder
                onRemove: @deleteFolder

