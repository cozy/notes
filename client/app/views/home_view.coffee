Tree = require("./widgets/tree").Tree
NoteWidget = require("./note_view").NoteWidget
Note = require("../models/note").Note

# Main view that manages interaction between toolbar, navigation and notes
class exports.HomeView extends Backbone.View
    id: 'home-view'


    # Tree functions

    # Send a request for a tree modification.
    sendTreeRequest: (type, data, callback) ->
        $.ajax
            type: type
            url: "tree"
            data: data
            success: callback
            error: (data) ->
                if data and data.msg
                    alert data.msg
                else
                    alert "Server error occured."

    # Create a new folder inside currently selected node.
    createFolder: (path, data) =>
        @sendTreeRequest "POST",
            path: path
            name: data.rslt.name
            , (note) =>
                data.rslt.obj.data("id", note.id)
                data.inst.deselect_all()
                data.inst.select_node(data.rslt.obj)

    # Rename currently selected node.
    renameFolder: (path, newName) =>
        if newName?
            @sendTreeRequest "PUT",
                path: path
                newName: newName
        
    # Delete currently selected node.
    deleteFolder: (path) =>
        @noteArea.html null
        @sendTreeRequest "DELETE", path: path

    selectFolder: (path, id) =>
        if id?
            $.get "notes/#{id}", (data) =>
                note = new Note data
                @renderNote note
                @noteFull.show()
        else
            @noteFull.hide()


    renderNote: (note) ->
        @currentNote = note
        noteWidget = new NoteWidget @currentNote

        if @editor == undefined
            @editor == NoteWidget.setEditor @onNoteChange

        noteWidget.render()

    onNoteChange: (event) =>
        @currentNote.content = $("#note-full-content").val()
        @currentNote.url = "/notes/#{@currentNote.id}"
        @currentNote.save content: $("#note-full-content").val()

    # Initializers

    render: ->
        $(@el).html require('./templates/home')
        this

    # Fetch data loads notre tree and configure it.
    fetchData: ->
        @noteArea = $("#editor")
        @noteFull = $("#note-full")
        @noteFull.hide()
        $.get "tree/", (data) =>
            @tree = new Tree @.$("#nav"), data,
                onCreate: @createFolder
                onRename: @renameFolder
                onRemove: @deleteFolder
                onSelect: @selectFolder

