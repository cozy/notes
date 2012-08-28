Tree = require("./widgets/tree").Tree
NoteView = require("./note_view").NoteView
Note = require("../models/note").Note

###*
# Main view that manages interaction between tool$(".bar"), navigation and notes
    id : ='home-view'
    @treeCreationCallback 
    @noteFull
    @tree
    @noteView
    @treeLoaded
    @iframeLoaded
###

class exports.HomeView extends Backbone.View
    id: 'home-view'

    ###*
    #Load the home view and the tree
    #Called once by the main_router
    ###
    initContent: (note_uuid) -> 
        
        console.log "HomeView.initContent(#{note_uuid})"

        # when the tree and iframe of the editor will be loaded : select the note
        hv = this
        iframeLoaded = false
        treeLoaded = false
        onTreeLoaded = ->
            console.log "event HomeView.onTreeLoaded #{iframeLoaded}"
            $(".bar").css("width","30%")
            treeLoaded = true
            if iframeLoaded
                app.homeView.selectNote note_uuid
        onIFrameLoaded = ->
            console.log "event HomeView.onIFrameLoaded #{iframeLoaded}"
            $(".bar").css("width","10%")
            iframeLoaded = true
            if treeLoaded
                hv.selectNote note_uuid

        # add the html in the element of the view
        $(@el).html require('./templates/home')
        @noteView = new NoteView(onIFrameLoaded)
        @noteView.homeView = this
        @noteFull = $("#note-full")
        @noteFull.hide()
        
        # Use jquery layout to set main layout of current window.
        $('#home-view').layout
            size: "250"
            minSize: "250"
            resizable: true
            spacing_open: 10
            spacing_closed: 10
            togglerLength_closed: "100%"
        
        #Progress bar
        $(".ui-layout-center").append(
            "<div class='progress progress-striped active'>
                <div class='bar' style='width: 0%;'></div>
            </div>")
        @progress = $(".progress")
        progressBarLeftPosition = $(".ui-layout-center").width()/3-77
        progressBarTopPosition = $(".ui-layout-center").height()/2
        @progress.css("left", progressBarLeftPosition)
        @progress.css("top", progressBarTopPosition)
        
        # Path to open when the tree will be loaded
        #@onTreeLoaded = ->
        #    app.homeView.selectNote path
        
        # creation of the tree
        $.get "tree/", (data) =>
            @tree = new Tree( @.$("#nav"), data, 
                    onCreate: @createFolder
                    onRename: @onTreeRename
                    onRemove: @onTreeRemove
                    onSelect: @onTreeSelectionChg
                    onLoaded: onTreeLoaded
                    onDrop  : @onNoteDropped
                )

    ###*
    Create a new folder of path : fullPath and of name : newName
    ###
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
    ###*
    # Only called by jsTree event "rename.jstree" trigered when a node
    # is renamed.
    # May be called by another note than the currently selected node.
    ###
    onTreeRename: (uuid, newName) =>
        console.log "HomeView.onTreeRename()"
        if newName?
            if @tree.currentNote_uuid == uuid
                @noteView.setTitle(newName)
                @noteView.updateBreadcrumb(newName)
            Note.updateNote uuid,
                title: newName
            , () =>
    
    onNoteTitleChange:(uuid, newName) =>
        console.log "HomeView.onNoteTitleChange()"
        if newName?
            @tree.jstreeEl.jstree("rename_node", "##{uuid}", newName)
            Note.updateNote uuid,
                title: newName
            , () =>

    ###*
    # Only called by jsTree event "select_node.jstree"
    # Delete currently selected node.
    ###
    onTreeRemove: (note_uuid) =>
        console.log "HomeView.onTreeRemove(#{note_uuid})"
        if @currentNote and @currentNote.id == note_uuid
            console.log "indirect deletion"
            @currentNote.destroy()
        else
            console.log "direct request for deletion on server"
            Note.deleteNote(note_uuid , ->
                console.log arguments
            )

    ###*
    # Only called by jsTree event "select_node"
    # When a node is selected, the note widget is displayed and fill with
    # note data.
    ###
    onTreeSelectionChg: (path, id, data) =>
    # selectFolder: (path, id) =>
        console.log "HomeView.selectFolder( path:#{path} - id:#{id})"
        if id is undefined
            #removing progress bar
            @progress.remove()
        else
            $(".bar").css("width","70%")
        path = "/#{path}" if path.indexOf("/")
        app.router.navigate "note#{path}", trigger: false
        if id?
            Note.getNote id, (note) =>
                @renderNote note, data
                @noteFull.show()
        else
            @noteFull.hide()

    ###*
    # Force selection inside tree of note of a given uuid.
    ###
    selectNote: (note_uuid) =>
        console.log "HomeView.selectNote(#{note_uuid})"
        $(".bar").css("width","40%")
        if note_uuid=="all"
           note_uuid = 'tree-node-all'
        @tree.selectNode note_uuid

    ###*
    # Fill note widget with note data.
    ###
    renderNote: (note, data) ->
        console.log "HomeView.renderNote()"
        $(".bar").css("width","90%")
        note.url = "notes/#{note.id}"
        @currentNote = note
        # noteWidget = new NoteWidget note
        # noteWidget.render()
        @noteView.setModel(note, data)
        #removing progress bar
        @progress.remove()


    ###*
    # When note is dropped, its old path and its new path are sent to server
    # for persistence.
    ###
    onNoteDropped: (newPath, oldPath, noteTitle, data) =>
        console.log "HomeView.onNoteDropped()"
        Note.updateNote data.rslt.o.data("id"),
            path: newPath
            , () =>
                data.inst.deselect_all()
                data.inst.select_node data.rslt.o



