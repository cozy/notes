template = require('./templates/note')
CNEditor = require('./editor').CNEditor
Note = require('../models/note').Note
Test = require('./widgets/tree')

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
        console.log Test.Tree.prototype.updateSuggestionList
        # Callback to execute when the editor is ready
        # this refers to the editor during instanciation
        @model     = undefined
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
            @model.saveContent editorCtrl.getEditorContent()
            if saveButton.hasClass("btn-primary")
                saveButton.addClass("active btn-info").removeClass("btn-primary")

        $("#note-full-title").blur => 
            console.log "event : note-full-title.blur"
            newName = $("#note-full-title").val()
            oldName = @model.title
            if newName isnt "" and oldName != newName
                @homeView.onNoteTitleChange(@model.id, newName)
                Test.Tree.prototype.updateSuggestionList("rename", newName, oldName)
                @updateBreadcrum()
                
                # TODO BJA : utilité ? sert qd les id des fils étaient impactés par le renommage, ce n'est plus le cas.
                # @rebuildIds @currentData, @currentData.rslt.obj, @currentPath 


    setModel : (noteModel) ->
        @model = noteModel
        @setTitle(noteModel.title)
        @setContent(noteModel.content)
        @updateBreadcrum()


    setTitle : (nTitle) ->
        #give a title to the note
        $("#note-full-title").val @model.title


    setContent : (content) ->
        # load the base's content into the editor
        if content
            @editorCtrl.setEditorContent(content)
        else
            @editorCtrl.deleteContent()


    updateBreadcrum : ->
        #breadcrumb will contain the path of the selected note in a link format(<a>)
        # the code below generates the breadcrumb corresponding
        # to the current note path
            i = 0
            breadcrumb = ""
            linkToThePath = []
            while i < @model.humanPath.split(",").length
                linkToThePath[i] = @model.humanPath.split(",")[0..i].join("/")
                path = "/#note/#{linkToThePath[i]}".toLowerCase()
                path = path.replace(/\s+/g, "-")
                linkToThePath[i] = "<a href='#{path}'> #{@model.humanPath.split(",")[i]}</a>"
                if i is 0
                    breadcrumb += "#{linkToThePath[i]}"
                else
                    breadcrumb += " > #{linkToThePath[i]}"
                i++
                
            $("#note-full-breadcrumb").html breadcrumb


