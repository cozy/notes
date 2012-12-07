Tree = require("./widgets/tree").Tree
NoteView = require("./note_view").NoteView
Note = require("../models/note").Note

###*
# Main view that manages interaction between toolprogressBar, navigation and notes
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
    # Load the home view and the tree
    # Called once by the main_router
    ###
    initContent: (note_uuid) ->
        # vars
        @progressBar = $(".bar")
        progressBar = @progressBar

        # when the tree and iframe of the editor are loaded : select the note
        hv = this
        iframeLoaded = false
        treeLoaded = false
        onTreeLoaded = ->
            console.log "event HomeView.onTreeLoaded #{iframeLoaded}"
            progressBar.css("width","30%")
            treeLoaded = true
            if iframeLoaded
                app.homeView.selectNote note_uuid
        onIFrameLoaded = ->
            console.log "event HomeView.onIFrameLoaded #{iframeLoaded}"
            progressBar.css("width","10%")
            iframeLoaded = true
            if treeLoaded
                hv.selectNote note_uuid

        # add the html in the element of the view
        $(@el).html require('./templates/home')
        @noteView = new NoteView(onIFrameLoaded)
        @noteView.homeView = this
        @noteFull = $("#note-full")
        @noteFull.hide()
        drag = $("#drag")

        # Use jquery layout to set main layout of current window.
        $('#home-view').layout
            size: "250"
            minSize: "250"
            resizable: true
            spacing_open: 10
            spacing_closed: 10
            togglerLength_closed: "100%"
            onresize_end: ->
                console.log "resize end"
                drag.css("z-index","-1")

        # we detect the start of resize with the on mousedown instead of 
        # the onresize_start because this one happens a bit latter what may be a pb.
        $(".ui-layout-resizer").bind 'mousedown', (e)->
            console.log "resize start"
            drag.css("z-index","1")
        
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
        
        # creation of the tree
        $.get "tree/", (data) =>
            console.log data
            window.tree = data
            @tree = new Tree( @.$("#nav"), data,
                    onCreate: @onCreateFolder
                    onRename: @onTreeRename
                    onRemove: @onTreeRemove
                    onSelect: @onTreeSelectionChg
                    onLoaded: onTreeLoaded
                    onDrop  : @onNoteDropped
                )

        # Resize editor
        @resizeNoteView()
        $(window).resize @resizeNoteView

        # Save data when user leaves page.
        $(window).unload =>
            @noteView.saveEditorContent()
        
    # Small trick to adapt editor size when window is resized.
    resizeNoteView: ->
        windowHeight = $(window).height()
        $("#note-style").height(windowHeight - 80)
        $("#editor").height(windowHeight - 180)

    ###*
    Create a new folder.
    Params :
        fullPath : path of the folder
        newName : name of the folder
    ###
    onCreateFolder: (parentId, newName, data) ->
        Note.createNote
            title: newName
            parent_id:parentId
            , (err, note) ->
                if err
                    alert "Server error occured."
                else
                    data.rslt.obj.data("id", note.id) # TODO BJA : use case ?
                    data.rslt.obj.prop("id", note.id)
                    data.inst.deselect_all()
                    data.inst.select_node data.rslt.obj

    ###*
    # Only called by jsTree event "rename.jstree" trigered when a node
    # is renamed.
    # May be called by another note than the currently selected node.
    ###
    onTreeRename: (uuid, newName) =>
        if newName?
            if @tree.currentNote_uuid == uuid
                @noteView.setTitle(newName)
                @noteView.updateBreadcrumbOnTitleChange(newName)
            Note.updateNote uuid, title: newName, (err) ->
                alert "Server error occured" if err

    ###*
    # When note title is changed, the changement is send to backend for
    # persistence. 
    ###
    onNoteTitleChange:(uuid, newName) =>
        if newName?
            @tree.jstreeEl.jstree "rename_node", "##{uuid}", newName
            Note.updateNote uuid, title: newName, (err) ->
                alert "Server error occured" if err

    ###*
    # Only called by jsTree event "select_node.jstree"
    # Delete currently selected node.
    ###
    onTreeRemove: (note_uuid) =>
        if @currentNote and @currentNote.id == note_uuid
            @currentNote.destroy()
        else
            Note.deleteNote note_uuid, (err) ->
                alert "Server error occured" if err

    ###*
    # Only called by jsTree event "select_node"
    # When a node is selected, the note_view is displayed and filled with
    # note data.
    ###
    onTreeSelectionChg: (path, id, data) =>
        @noteView.saveEditorContent()

        if id is undefined
            @progress.remove()
        else
            @progressBar.css "width", "70%"
            
        path = "/#{path}" if path.indexOf "/"
        app.router.navigate "note#{path}", trigger: false
        if id?
            if id == "tree-node-all"
                @progress.remove()
                @noteFull.hide()
            else
                Note.getNote id, (note) =>
                    @renderNote note, data
                    @noteFull.show()
        else
            @progress.remove()
            @noteFull.hide()

    ###*
    # Force selection inside tree of note of a given uuid.
    ###
    selectNote: (note_uuid) =>
        @progressBar.css("width","40%")
        note_uuid = 'tree-node-all' if note_uuid=="all"
        @tree.selectNode note_uuid

    ###*
    # Fill note widget with note data.
    ###
    renderNote: (note, data) ->
        @progressBar.css("width","90%")
        note.url = "notes/#{note.id}"
        @currentNote = note
        @noteView.setModel(note, data)
        @progress.remove()


    ###*
    # When note is dropped, its old path and its new path are sent to server
    # for persistence.
    ###
    onNoteDropped: (nodeId, targetNodeId) ->
        Note.updateNote nodeId, {parent_id:targetNodeId} , () ->
