Tree = require("./widgets/tree").Tree

class exports.HomeView extends Backbone.View
    id: 'home-view'

    render: ->
        $(@el).html require('./templates/home')
        this

    createFolder: (path) ->
        $.ajax
            type:"POST"
            url: "tree"
            data: path: path
            error: (data) ->
                if data and data.msg
                    alert data.msg
                else
                    alert "Server error occured."

    fetchData: ->
        $.get "tree/", (data) =>
            @tree = new Tree @.$("#nav"), data,
                onCreate: @createFolder
                onRename: @createFolder
                onRemove: @createFolder

