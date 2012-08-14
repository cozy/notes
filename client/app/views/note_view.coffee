template = require('./templates/note')
CNEditor = require('./editor').CNEditor
Note = require('../models/note').Note

# Row displaying application name and attributes
class exports.NoteWidget extends Backbone.View
    className: "note-full"
    tagName: "div"
   
    ### Constructor ####

    constructor: (@model) ->
        super()

        @id = @model.slug
        @model.view = @

    remove: ->
        $(@el).remove()

    ### configuration ###
    

    render: ->
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
        #give a title to the note
        $("#note-full-title").val @model.title
        # load the base's content into the editor
        $("#note-area").html require('./templates/editor')
        myContent = @model.content
        
        # Callback to execute when the editor is ready
        # this refers to the editor during instanciation
        note = @model
                
        callBackEditor = () ->
            editorCtrl = this
            # load the base's content into the editor
            if myContent
                editorCtrl.setEditorContent(myContent)
            else
                editorCtrl.deleteContent()
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
                if $("#save-editor-content").hasClass("btn-info")
                    $("#save-editor-content").addClass("btn-primary").removeClass("active btn-info")
            $("#save-editor-content").on "click", () ->
                if $("#save-editor-content").hasClass("btn-primary")
                    $("#save-editor-content").addClass("active btn-info").removeClass("btn-primary")
                editorCtrl._addHistory()
            $("iframe").on "onHistoryChanged", () =>
                note.saveContent @.getEditorContent()
                if $("#save-editor-content").hasClass("btn-primary")
                    $("#save-editor-content").addClass("active btn-info").removeClass("btn-primary")
        # creation of the editor itself
        instEditor = new CNEditor($('#editorIframe')[0], callBackEditor)
        
        return @el
