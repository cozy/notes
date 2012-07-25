Tree = require("./widgets/tree").Tree
NoteWidget = require("./note_view").NoteWidget
Note = require("../models/note").Note
###
# Main view that manages interaction between toolbar, navigation and notes
    @treeCreationCallback 
    @noteArea 
    @noteFull 
###

class exports.HomeView extends Backbone.View
    id: 'home-view'

    # Tree functions

    # Create a new folder inside currently selected node.
    createFolder: (path, newName, data) =>
        Note.createNote
            path: path
            name: newName
            , (note) =>
                data.rslt.obj.data("id", note.id)
                data.inst.deselect_all()
                data.inst.select_node data.rslt.obj

    # Rename currently selected node.
    renameFolder: (path, newName, data) =>
        if newName?
            Note.updateNote
                path: path
                newName: newName
            , () =>
                data.inst.deselect_all()
                data.inst.select_node data.rslt.obj
            
    renameFolderNoReselect: (path, newName) =>
        if newName?
            Note.updateNote
                path: path
                newName: newName
            
    # Delete currently selected node.
    deleteFolder: (path) =>
        @noteFull.hide()
        Note.deleteNote path: path

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
        @currentNote = note
        noteWidget = new NoteWidget @currentNote
        noteWidget.render()

    # When note change, its content is saved.
    onNoteChanged: (event) =>
        console.log "call onNoteChanged"
        noteWidget = new NoteWidget @currentNote
        console.log noteWidget
        @currentNote.saveContent noteWidget.instEditor.getEditorContent()

    # When tree is loaded, callback given in paramter when fetchData
    # function was called is run.
    onTreeLoaded: ->

    # When note is dropped, its old path and its new path are sent to server
    # for persistence.
    onNoteDropped: (newPath, oldPath, data) =>
        oldPath = "/" + oldPath if oldPath.charAt(0) != "/"
        Note.moveNote
            path: oldPath
            dest: newPath
            , () =>
                data.inst.deselect_all()
                data.inst.select_node data.rslt.o


    # Initializers
    constructor: () ->
        super()
    
    render: ->
        this

    # Load the home view and the tree
    initContent: (path) ->
        
        # add the html in the element of the view
        $(@el).html require('./templates/home')
        @noteArea = $("#editor")
        @noteFull = $("#note-full")
        @noteFull.hide()
        
        # Use jquery layout so set main layout of current window.
        $('#home-view').layout
            size: "350"
            minSize: "350"
            resizable: true
        
        # TODO : expliquer le coupt du cookie
        @onTreeLoaded = ->
            setTimeout(
                ->
                    app.homeView.selectNote path
                , 100
            )
        
        NoteWidget.setEditor @onNoteChanged

        # creation of the tree
        $.get "tree/",  (data) =>
            @tree = new Tree( @.$("#nav"), data, 
                    onCreate: @createFolder
                    onRename: @renameFolder
                    onRenameNoReselect: @renameFolderNoReselect
                    onRemove: @deleteFolder
                    onSelect: @selectFolder
                    onLoaded: @onTreeLoaded
                    onDrop  : @onNoteDropped
                    onNoteChangedEvent: @onNoteChanged
                )
