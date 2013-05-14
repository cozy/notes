Tree = require("./widgets/tree").Tree
NoteView = require("./note_view").NoteView
Note = require("../models/note").Note
NotesCollection = require("../collections/notes")
SearchView = require './search_view'
slugify = require '../lib/slug'


###*
# Main view that manages interaction between toolprogressBar, navigation and notes
###

class exports.HomeView extends Backbone.View
    id: 'home-view'

    ###*
    # Load the home view and the tree
    # Called once by the main_router
    ###
    initContent: (note_uuid, callback) ->
        @note_uuid = note_uuid
        @iframeLoaded = false
        @treeLoaded = false

        @buildViews()
        @configureLayoutDrag()
        @loadTree callback
        @configureScrolling()
        @configureResize()
        @configureSaving()

    # Build main view and layout, create note view and integrate it inside home
    # view.
    buildViews: ->
        @$el.html require('./templates/home')
        @noteView = new NoteView @, @onIFrameLoaded
        @noteFull = @$ "#note-full"
        @noteFull.hide()
        @helpInfo = @$ "#help-info"
        @searchView = new SearchView @$("#search-view")

        @$el.layout
            size: "250"
            minSize: "250"
            resizable: true
            spacing_open: 10
            spacing_closed: 10
            togglerLength_closed: "100%"
            defaults:
                enableCursorHotkey: false
            onresize_end: =>
                @onWindowResized()

    # Load data for tree and render it.
    loadTree: (callback) ->
        $.get "tree/", (data) =>
            window.tree = data
            @tree = new Tree @$("#nav"), data,
                onCreate: @onCreateFolder
                onRename: @onTreeRename
                onRemove: @onTreeRemove
                onSelect: @onTreeSelectionChg
                onLoaded: callback
                onDrop  : @onNoteDropped
                onSearch: @onSearch

            @$("#create-note").click =>
                @tree.widget.jstree(
                    "create","#tree-node-all","first","A New Note")

    # Detect the start of resize with the on mousedown instead of
    # the onresize_start because this one happens a bit latter what may be a pb.
    configureLayoutDrag: ->
        drag = $("#drag")
        $(".ui-layout-resizer").bind 'mousedown', (e) ->
            #drag.css("z-index","1")

    # Resize editor and register resize listener.
    configureResize: ->
        @onWindowResized()
        $(window).resize @onWindowResized
        @faketop.on 'topaffix', @onWindowResized


    configureScrolling: ->
        @faketop = $('
            <div id="faketop">
                <div id="faketop-grad"></div>
            </div>')
        @faketop.prependTo $('#note-full')
        $('#note-area').scroll @onWindowScrolled


    # Save data when user leaves page.
    configureSaving: ->
        $(window).unload = =>
            @noteView.saveEditorContent =>
                console.log "note saved on closing"

    ### Listeners ###

    # If editor iframe is loaded after tree, it displays the note that should be
    # loaded first.
    onIFrameLoaded: =>
        @iframeLoaded = true
        @selectNote note_uuid if @treeLoaded
        @treeLoaded = true
        @iframe = $ "iframe"

    # If tree is loaded after iframe, it displays the note that should be
    # loaded first.
    selectNoteIfIframeLoaded: =>
        @treeLoaded = true
        @selectNote(@note_uuid) if @iframeLoaded

    # Small trick to adapt editor size when window is resized.
    onWindowResized: =>
        windowWidth = $(window).width()
        windowHeight = $(window).height()

        ns = $('#note-style')
        nsLeft = ns.offset().left

        editorBB = $('#editor-button-bar')
        editorBB.css
            left: nsLeft - 0.5 * editorBB.width()

        title = $('#note-full-title')
        title.width  $('#editor-container').width() - 10

        if @faketop?
            @faketop.width ns.width() + 102
            $('#faketop-grad').width ns.width() + 102
            @faketop.offset 'left':nsLeft

    onWindowScrolled: =>
        scrollTop = $('#note-area').scrollTop()

        @handleAffix $('#note-full-breadcrumb'), scrollTop, 30
        @handleAffix $('#note-file-list'), scrollTop, 30
        @handleAffix $('#note-full-title'), scrollTop, 30
        @handleAffix $('#faketop'), scrollTop, 30
        @handleAffix $('#faketop-grad'), scrollTop, 30

        ns = $('#note-style')
        nsLeft = ns.offset().left
        fileList = $('#note-file-list')
        if @faketop.hasClass 'topaffix'
            fileListLeft =  nsLeft  + ns.width() - 200
            fileList.css
                left: fileListLeft
        else
            fileListLeft = nsLeft  + ns.width() - 600
            fileList.css
                left: fileListLeft

    handleAffix: (el, scrollTop, limit) ->
        if scrollTop > limit
            if not el.hasClass('topaffix')
                el.addClass('topaffix')
                el.trigger('topaffix')
        else
            if el.hasClass('topaffix')
                el.removeClass('topaffix')
                el.trigger('topaffix')

    onSearch: (query) =>
        if query.length > 0
            app.router.navigate "search/#{slugify query}", trigger: true
        else
            if @treeLoaded
                app.router.navigate "note/all", trigger: true

    search: (query) =>
        if @tree?
            @helpInfo.hide()
            @tree.widget.jstree "search", query
            NotesCollection.search query, (notes) =>
                @searchView.fill notes, query
                @noteFull.fadeOut =>
                    @searchView.fadeIn()

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
        if newName?
            if @tree.currentNote_uuid is uuid
                @noteView.setTitle newName
                @noteView.updateBreadcrumbOnTitleChange newName
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


    disableTreeHotkey: () =>
        @tree.disable_hotkeys()


    enableTreeHotkey: () =>
        @tree.enable_hotkeys()

    ###*
    # Only called by jsTree event "select_node.jstree"
    # Delete currently selected node.
    ###
    onTreeRemove: (note_uuid) =>
        if @currentNote and @currentNote.id is note_uuid
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
        @tree.widget.jstree "search", ""
        @searchView.hide()
        @noteView.saveEditorContent()

        path = "/#{path}" if path.indexOf "/"
        app.router.navigate "note#{path}", trigger: false

        if not id? or id is "tree-node-all"
            @helpInfo.show()
            @noteFull.hide()
        else
            @helpInfo.hide()
            @noteView.showLoading()
            Note.getNote id, (note) =>
                @noteView.hideLoading()
                @renderNote note, data
                @noteFull.show()
                @onWindowResized()

    ###*
    # When note is dropped, its old path and its new path are sent to server
    # for persistence.
    ###
    onNoteDropped: (nodeId, targetNodeId) ->
        Note.updateNote nodeId, {parent_id:targetNodeId} , () ->


    ### Functions ###

    ###*
    # Force selection inside tree of note of a given uuid.
    ###
    selectNote: (noteId) =>
        if not noteId? or noteId in ["all", 'tree-node-all'] or noteId.length is 0
            @helpInfo.show()
            @noteFull.hide()
            @tree?.widget.jstree "search", ""
            @searchView.hide()
        else
            @tree.selectNode noteId

    ###*
    # Fill note widget with note data.
    ###
    renderNote: (note, data) =>
        note.url = "notes/#{note.id}"
        @currentNote = note
        @noteView.setModel note, data

