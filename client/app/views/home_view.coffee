Tree = require("./widgets/tree").Tree
NoteWidget = require("./note_view").NoteWidget
Note = require("../models/note").Note

# Main view that manages interaction between toolbar, navigation and notes
class exports.HomeView extends Backbone.View
    id: 'home-view'

    # Tree functions

    # Send a request for a tree modification.
    sendTreeRequest: (type, data, callback) ->
        url = "tree"

        # Small trick needed because delete request should not have data
        # in their body.
        if type == "DELETE"
            type = "PUT"
            url = url + "/path"

        $.ajax
            type: type
            url: url
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
        @noteFull.hide()
        @sendTreeRequest "DELETE", path: path

    # When a note is selected, the note widget is displayed and fill with
    # note data.
    selectFolder: (path, id) =>
        if id?
            $.get "notes/#{id}", (data) =>
                note = new Note data
                @renderNote note
                @noteFull.show()
        else
            @noteFull.hide()

    # Fill note widget with note data.
    renderNote: (note) ->
        @currentNote = note
        noteWidget = new NoteWidget @currentNote

        if @editor == undefined
            @editor == NoteWidget.setEditor @onNoteChange

        noteWidget.render()

    # When note change, its content is saved.
    onNoteChange: (event) =>
        @currentNote.saveContent $("#note-full-content").val()


    # Initializers

    render: ->
        $(@el).html require('./templates/home')
        this

    # Use jquery layout so set main layout of current window.
    setLayout: ->
        $('#home-view').layout
            size: "310"
            minSize: "310"
            resizable: true

    # Loads note tree and configure it.
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

