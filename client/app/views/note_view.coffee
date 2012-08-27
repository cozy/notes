template = require('./templates/note')
CNEditor = require('./editor').CNEditor
Note = require('../models/note').Note
TreeInst = require('./widgets/tree')

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
        console.log "NoteWidget.constructor()"
        @onIFrameLoaded = onIFrameLoaded
        super()

    #     @id = @model.slug
    #     @model.view = @

    remove: ->
        $(@el).remove()

    initialize:->
        console.log "NoteWidget.initialize()"
        # load the base's content into the editor
        $("#editor").html require('./templates/editor')
        # Callback to execute when the editor is ready
        # this refers to the editor during instanciation
        @model     = undefined
        model      = undefined
        saveTimer  = null
        saveButton = $("#save-editor-content")
        
        # creation of the editor controler
        onIFrameLoaded=@onIFrameLoaded
        iframeEditorCallBack = () ->
            onIFrameLoaded()
        editorCtrl = new CNEditor($('#editorIframe')[0], iframeEditorCallBack)
        @editorCtrl=editorCtrl

        # buttons for the editor

        $("#indentBtn").on "click", () ->
            editorCtrl._addHistory()
            editorCtrl.tab()

        $("#unIndentBtn").on "click", () ->
            editorCtrl._addHistory()
            editorCtrl.shiftTab()

        $("#markerListBtn").on "click", () ->
            editorCtrl._addHistory()
            editorCtrl.markerList()

        $("#titleBtn").on "click", () ->
            editorCtrl._addHistory()
            editorCtrl.titleList()

        $("iframe").on "onKeyUp", () =>
            clearTimeout(saveTimer)
            if saveButton.hasClass("btn-info")
                    saveButton.addClass("btn-primary").removeClass("active btn-info")
            model     = @model
            saveTimer = setTimeout( ->
                    model.saveContent editorCtrl.getEditorContent()
                    if saveButton.hasClass("btn-primary")
                        saveButton.addClass("active btn-info").removeClass("btn-primary")
                , 3000)

        $("#save-editor-content").on "click", () ->
            clearTimeout(saveTimer)
            model.saveContent editorCtrl.getEditorContent()
            if saveButton.hasClass("btn-primary")
                saveButton.addClass("active btn-info").removeClass("btn-primary")

        $("#note-full-title").live("keypress", (e) ->
            if e.keyCode is 13
                $("#note-full-title").trigger "blur"
            )

        $("#note-full-title").blur => 
            console.log "event : note-full-title.blur"
            newName = $("#note-full-title").val()
            oldName = @model.title
            if newName isnt "" and oldName != newName
                @homeView.onNoteTitleChange(@model.id, newName)
                TreeInst.Tree.prototype.updateSuggestionList("rename", newName, oldName)
                @updateBreadcrumb(newName)
                
                # TODO BJA : utilité ? sert qd les id des fils étaient impactés par le renommage, ce n'est plus le cas.
                # @rebuildIds @currentData, @currentData.rslt.obj, @currentPath 

    setModel : (noteModel, data) ->
        @model = noteModel
        @setTitle(noteModel.title)
        @setContent(noteModel.content)
        @createBreadcrumb(noteModel, data)


    setTitle : (nTitle) ->
        #give a title to the note
        $("#note-full-title").val nTitle


    setContent : (content) ->
        # load the base's content into the editor
        if content
            @editorCtrl.setEditorContent(content)
        else
            @editorCtrl.deleteContent()


    createBreadcrumb : (noteModel, data) ->
        #breadcrumb will contain the path of the selected note in a link format(<a>)
        # the code below generates the breadcrumb corresponding
        # to the current note path
            i = noteModel.humanPath.split(",").length - 1
            breadcrumb = ""
            linkToThePath = []
            parent = undefined
            while i >= 1
                parent = data.inst._get_parent(parent)
                path = "/#note/#{parent[0].id}"
                breadcrumb = "<a href='#{path}'> #{noteModel.humanPath.split(",")[i-1]}</a> > #{breadcrumb}"
                i--
            path = "/#note/#{noteModel.id}"
            breadcrumb = "#{breadcrumb} <a href='#{path}' > #{noteModel.title}</a>"
                
            $("#note-full-breadcrumb").html breadcrumb

    updateBreadcrumb : (newName) ->
        $("#note-full-breadcrumb a:last").text(newName)
