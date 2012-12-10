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
        @note_uuid = note_uuid
        @progressBar = $(".bar")
        @iframeLoaded = false
        @treeLoaded = false

        @buildViews()
        @configureLayoutDrag()
        @setProgressBar()
        @loadTree()
        @configureResize()
        @configureSaving()

    # Build main view and layout, create note view and integrate it inside home
    # view.
    buildViews: ->
        @$el.html require('./templates/home')
        @noteView = new NoteView @, @onIFrameLoaded
        @noteFull = @$ "#note-full"
        @noteFull.hide()

        @$el.layout
            size: "250"
            minSize: "250"
            resizable: true
            spacing_open: 10
            spacing_closed: 10
            togglerLength_closed: "100%"
            onresize_end: ->
                drag.css "z-index","-1"

    # Load data for tree and render it.
    loadTree: ->
        $.get "tree/", (data) =>
            window.tree = data
            @tree = new Tree @$("#nav"), data,
                    onCreate: @onCreateFolder
                    onRename: @onTreeRename
                    onRemove: @onTreeRemove
                    onSelect: @onTreeSelectionChg
                    onLoaded: @onTreeLoaded
                    onDrop  : @onNoteDropped

    # Detect the start of resize with the on mousedown instead of 
    # the onresize_start because this one happens a bit latter what may be a pb.
    configureLayoutDrag: ->
        drag = $("#drag")
        $(".ui-layout-resizer").bind 'mousedown', (e)->
            drag.css("z-index","1")

    # Resize editor and register resize listener.
    configureResize: ->
        @onWindowResized()
        $(window).resize @onWindowResized

    # Save data when user leaves page.
    configureSaving: ->
        $(window).unload =>
            @noteView.saveEditorContent()

    # Build and configure presse bar.
    setProgressBar: ->
        @$(".ui-layout-center").append(
            "<div class='progress progress-striped active'>
                <div class='bar' style='width: 0%;'></div>
            </div>")
        @progress = @$el.find ".progress"
        progressBarLeftPosition = @$(".ui-layout-center").width()/3-77
        progressBarTopPosition = @$(".ui-layout-center").height()/2
        @progress.css "left", progressBarLeftPosition
        @progress.css "top", progressBarTopPosition


    ### Listeners ###
    
    # If editor iframe is loaded after tree, it displays the note that should be 
    # loaded first.
    onIFrameLoaded: =>
        @progressBar.css "width","10%"
        @iframeLoaded = true
        @selectNote note_uuid if @treeLoaded
        @iframe = $ "iframe"
        cssLink = document.createElement "link"
        cssLink.href = "stylesheets/app.css"
        cssLink .rel = "stylesheet"
        cssLink .type = "text/css"
        console.log @iframe.get()
        
        #@iframe.get().document.head.appendChild cssLink

    # If tree is loaded after iframe, it displays the note that should be
    # loaded first.
    onTreeLoaded: =>
        @progressBar.css "width","30%"
        @treeLoaded = true
        app.homeView.selectNote(@note_uuid) if @iframeLoaded
        
    # Small trick to adapt editor size when window is resized.
    onWindowResized: ->
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
        @progressBar.css "width","40%"
        note_uuid = 'tree-node-all' if note_uuid=="all"
        @tree.selectNode note_uuid

    ###*
    # Fill note widget with note data.
    ###
    renderNote: (note, data) =>
        @progressBar.css "width","90%"
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
