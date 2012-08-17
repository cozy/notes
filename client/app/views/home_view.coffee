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
    initContent: (path) ->  #TODO BJA : pas patch mais id
        console.log "HomeView.initContent"
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


    # Create a new folder of path : fullPath and of name : newName
    createFolder: (fullPath, newName, data) =>
        console.log "HomeView.createFolder()"
        Note.createNote
            path : fullPath
            title: newName
            , (note) =>
                data.rslt.obj.data("id", note.id)
                data.rslt.obj.prop("id", note.id)
                data.inst.deselect_all()
                data.inst.select_node data.rslt.obj

    # Rename currently selected node.
    renameFolder: (path, newName, data) =>
        console.log "HomeView.renameFolder()"
        if newName?
            Note.updateNote data.rslt.obj.data("id"),
                title: newName
            , () =>
                data.inst.deselect_all()
                data.inst.select_node data.rslt.obj
            
    # Delete currently selected node.
    deleteFolder: (note_id) =>
        console.log "HomeView.deleteFolder(#{note_id})"
        console.log "  @currentNote.id(#{@currentNote.id})"
        console.log "  @currentNote.id == note_id(#{@currentNote.id == note_id})"
        if @currentNote.id == note_id
            # @noteFull.hide()
            @currentNote.destroy()
        else
            console.log "ready to request for deletion on server (desactivated)"
            # Note.getNote note_id, (note) =>
            #     console.log "Note.getNote(#{note_id}).success, ready to destroy !"
            #     note.destroy()

    # When a note is selected, the note widget is displayed and fill with
    # note data.
    selectFolder: (path, id) =>
        console.log "HomeView.selectFolder(#{id})"
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
        console.log "HomeView.selectNote()"
        @tree.selectNode path

    # Fill note widget with note data.
    renderNote: (note) ->
        console.log "HomeView.renderNote()"
        note.url = "notes/#{note.id}"
        @currentNote = note
        noteWidget = new NoteWidget @currentNote
        noteWidget.render()

    # When note is dropped, its old path and its new path are sent to server
    # for persistence.
    onNoteDropped: (newPath, oldPath, noteTitle, data) =>
        console.log "HomeView.selectFolder()"
        Note.updateNote data.rslt.o.data("id"),
            path: newPath
            , () =>
                data.inst.deselect_all()
                data.inst.select_node data.rslt.o



