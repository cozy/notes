template = require('./templates/note')
Note = require('../models/note').Note
TreeInst = require('./widgets/tree')

helpers = require '../helpers'

###*
model
homeView
editorCtrl
###
# Row displaying application name and attributes
class exports.NoteView extends Backbone.View
    className: "note-full"
    tagName: "div"
   
    ### Constructor ####

    constructor: (onIFrameLoaded) ->
        @onIFrameLoaded = onIFrameLoaded

        super()

    remove: ->
        $(@el).remove()

    initialize:->
        # load the base's content into the editor
        $("#editor").html require('./templates/editor')
        # Callback to execute when the editor is ready
        # this refers to the editor during instanciation
        @model     = undefined
        model      = undefined
        saveTimer  = null
        saveButton = $("#save-editor-content")
        @saveButton = saveButton
        @uploadButton = $("#upload-btn")
        # creation of the editor controler
        onIFrameLoaded=@onIFrameLoaded
        iframeEditorCallBack = () ->
            onIFrameLoaded()
        editorCtrl = new CNeditor($('#editorIframe')[0], iframeEditorCallBack)
        @editorCtrl=editorCtrl

        # buttons for the editor

        $("#indentBtn").tooltip
            placement: "bottom"
            title: "Indent the selection"
            
        $("#indentBtn").on "click", () ->
            editorCtrl._addHistory()
            editorCtrl.tab()

        $("#unIndentBtn").tooltip
            placement: "bottom"
            title: "Unindent the selection"
            
        $("#unIndentBtn").on "click", () ->
            editorCtrl._addHistory()
            editorCtrl.shiftTab()

        $("#markerListBtn").tooltip
            placement: "bottom"
            title: "Change selection from titles to marker list"
            
        $("#markerListBtn").on "click", () ->
            editorCtrl._addHistory()
            editorCtrl.markerList()

        @uploadButton.tooltip
            placement: "bottom"
            title: "Add file to the note"
            
        $("#titleBtn").tooltip
            placement: "bottom"
            title: "Change selection from marker list to titles"
            
        $("#titleBtn").on "click", () ->
            editorCtrl._addHistory()
            editorCtrl.titleList()
            
        $("#save-editor-content").tooltip
            placement: "bottom"
            title: "Save the current content"
        

        ###*
        # every keyUp in the note's editor will trigger a countdown of 3s, after
        # 3s and if the user didn't type anything, the content will be saved
        ###
        $("iframe").on "onKeyUp", () =>
            clearTimeout(@saveTimer)
            saveButton.removeClass("active") if saveButton.hasClass("active")
            id = @model.id
            @saveTimer = setTimeout( ->
                Note.updateNote id, content: editorCtrl.getEditorContent()
                unless saveButton.hasClass("active")
                    saveButton.addClass("active")
            , 3000)

        ###*
        # allow the user to save the content of a note before the 3s of the
        # automatic save
        ###
        saveButton.click @saveEditorContent

        @noteFullTitle = $("#note-full-title")
        noteFullTitle = @noteFullTitle

        ###*
        # forbidden a new line in the title
        ###
        noteFullTitle.live("keypress", (e) ->
            if e.keyCode is 13
                noteFullTitle.trigger "blur"
            )

        ###*
        # allow to rename a note by directly writing in the title
        ###
        noteFullTitle.blur =>
            console.log "event : note-full-title.blur"
            newName = noteFullTitle.val()
            oldName = @model.title
            if newName isnt "" and oldName != newName
                @homeView.onNoteTitleChange(@model.id, newName)
                @homeView.tree._updateSuggestionList("rename", newName, oldName)
                @updateBreadcrumbOnTitleChange(newName)

        @initFileWidget()

    ###*
    # Configure file uploader, display loading indicator when file is
    # uploading.
    ###
    initFileWidget: ->
        @uploader = new qq.FileUploaderBasic
            button: document.getElementById('upload-btn')
            mutliple: false
            forceMultipart: true
            onComplete: (id, filename, response) =>
                @uploadButton.spin()
                @uploadButton.find("i").css('visibility', 'visible')
                @addFileLine filename
            onSubmit: =>
                @uploadButton.find("i").css('visibility', 'hidden')
                @uploadButton.spin 'small'
        @uploadButton.find("input").css("cursor", "pointer !important")
        #@uploadButton.click =>
            #@uploadButton.find("input").trigger "click"
        @fileList = $('#note-file-list')
            
    ###*
    # Stop saving timer if any and force saving of editor content. 
    ###
    saveEditorContent: =>
        if @model? and @editorCtrl? and @saveTimer?
            clearTimeout @saveTimer
            @saveTimer = null
            id = @model.id
            Note.updateNote id, content: @editorCtrl.getEditorContent()
            @saveButton.addClass("active")

    ###*
    # 
    ###
    setModel : (noteModel, data) ->
        @model = noteModel
        @setTitle(noteModel.title)
        @setContent(noteModel.content)
        @createBreadcrumb(noteModel, data)
        @uploader._options.action = "notes/#{@model.id}/files/"
        @uploader._handler._options.action = "notes/#{@model.id}/files/"
        @renderFileList()
        
    ###*
    #  Display note title
    ###
    setTitle : (nTitle) ->
        @noteFullTitle.val nTitle

    ###*
    # 
    ###
    setContent : (content) ->
        # load the base's content into the editor
        if content
            @editorCtrl.setEditorContent(content)
        else
            @editorCtrl.deleteContent()

    ###*
    # Display inside dedicated div list of files attached to the current note.
    ###
    renderFileList: ->
        if @model?
            $('.note-file button').unbind()
            @fileList.html null
            for file of @model._attachments
                @addFileLine file

    addFileLine: (file) ->
        path = "notes/#{@model.id}/files/#{file}"
        slug = helpers.slugify file
        @fileList.append """
            <div class="note-file spacer" id="note-#{slug}">
                <a href="#{path}" target="_blank">#{file}</a>
                <button>(x)</button>
            </div>"""
        line = $("#note-#{slug}")
        delButton = $("#note-#{slug} button")
        line.hide()
        delButton.click (target) =>
            delButton.html "&nbsp;&nbsp;&nbsp;"
            delButton.spin 'tiny'
            $.ajax
                url: path
                type: "DELETE"
                success: =>
                    delButton.spin()
                    line.fadeOut ->
                        line.remove()
                error: =>
                    alert "Server error occured."
        line.fadeIn()

    ###*
    # create a breadcrumb showing a clickable way from the root to the current note
    # input: noteModel, contains the informations of the current note
    #  data, allow to reach the id of the parents of the current note
    # output: the breadcrumb html is modified
    ###
    createBreadcrumb : (noteModel, data) ->
        #breadcrumb will contain the path of the selected note in a link format(<a>)
        # the code below generates the breadcrumb corresponding
        # to the current note path
        paths = noteModel.path
        noteName = paths.pop()
        breadcrumb = ""

        parent = this.homeView.tree.jstreeEl.jstree("get_selected")
        while paths.length > 0
            parent = data.inst._get_parent parent
            path = "#note/#{parent[0].id}/"
            currentPath = paths.join("/")
            noteName = paths.pop()
            breadcrumb = "<a href='#{path}#{currentPath}'> #{noteName}</a> >#{breadcrumb}"

        breadcrumb = "<a href='#note/all'> All</a> >#{breadcrumb}"
        $("#note-full-breadcrumb a").unbind()
        $("#note-full-breadcrumb").html breadcrumb
        $("#note-full-breadcrumb a").click (event) ->
            event.preventDefault()
            hash = event.target.hash.substring(1)
            path = hash.split("/")
            id = path[1]
            app.homeView.selectNote id
            

    ###*
    # in case of renaming a note this function update the breadcrumb in consequences
    ###
    updateBreadcrumbOnTitleChange : (newName) ->
        $("#note-full-breadcrumb a:last").text(newName)
