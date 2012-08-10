Tree = require("./widgets/tree").Tree
NoteWidget = require("./note_view").NoteWidget
Note = require("../models/note").Note

###*
# Main view that manages interaction between toolbar, navigation and notes
    id : ='home-view'
    @treeCreationCallback 
    @noteArea 
    @noteFull 
###

class exports.HomeView extends Backbone.View
    id: 'home-view'

    # Load the home view and the tree - called once by the main-router
    initContent: (path) ->
        
        # add the html in the element of the view
        $(@el).html require('./templates/home')
        @noteArea = $("#editor")
        @noteFull = $("#note-full")
        @noteFull.hide()
        
        # Use jquery layout to set main layout of current window.
        $('#home-view').layout
            size: "350"
            minSize: "350"
            resizable: true
            spacing_open: 10
            spacing_closed: 10
        
            
        # Path to open when the tree will be loaded
        @onTreeLoaded = ->
            app.homeView.selectNote path

        # creation of the tree
        $.get "tree/",  (data) =>
            @tree = new Tree( @.$("#nav"), data, 
                    onCreate: @createFolder
                    onRename: @renameFolder
                    onRemove: @deleteFolder
                    onSelect: @selectFolder
                    onLoaded: @onTreeLoaded
                    onDrop  : @onNoteDropped
                )


    # Create a new folder inside currently selected node.
    createFolder: (path, newName, data) =>
        Note.createNote
            path: path
            title: newName
            , (note) =>
                data.rslt.obj.data("id", note.id)
                data.inst.deselect_all()
                data.inst.select_node data.rslt.obj

    # Rename currently selected node.
    renameFolder: (path, newName, data) =>
        if newName?
            Note.updateNote data.rslt.obj.data("id"),
                title: newName
            , () =>
                data.inst.deselect_all()
                data.inst.select_node data.rslt.obj
            
    # Delete currently selected node.
    deleteFolder: (path) =>
        @noteFull.hide()
        @currentNote.destroy()

    # When a note is selected, the note widget is displayed and fill with
    # note data.
    selectFolder: (path, id) =>
        path = "/#{path}" if path.indexOf("/")
        app.router.navigate "note#{path}", trigger: false
        if id?
            Note.getNote id, (note) =>
                @renderNote note
                @noteFull.show()
        else
            @noteFull.hide()

    # Force selection inside tree of note represented by given path.
    selectNote: (path) ->
        @tree.selectNode path

    # Fill note widget with note data.
    renderNote: (note) ->
        note.url = "notes/#{note.id}"
        @currentNote = note
        noteWidget = new NoteWidget @currentNote
        noteWidget.render()

    # When note is dropped, its old path and its new path are sent to server
    # for persistence.
    onNoteDropped: (newPath, oldPath, noteTitle, data) =>
        Note.updateNote data.rslt.o.data("id"),
            path: newPath
            , () =>
                data.inst.deselect_all()
                data.inst.select_node data.rslt.o



