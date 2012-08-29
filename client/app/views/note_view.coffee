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

        ###*
        # every keyUp in the note's editor will trigger a countdown of 3s, after
        # 3s and if the user didn't type anything, the content will be saved
        ###
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

        ###*
        # allow the user to save the content of a note before the 3s of the
        # automatic save
        ###
        $("#save-editor-content").on "click", () ->
            clearTimeout(saveTimer)
            model.saveContent editorCtrl.getEditorContent()
            if saveButton.hasClass("btn-primary")
                saveButton.addClass("active btn-info").removeClass("btn-primary")

        ###*
        # forbidden a new line in the title
        ###
        $("#note-full-title").live("keypress", (e) ->
            if e.keyCode is 13
                $("#note-full-title").trigger "blur"
            )

        ###*
        # allow to rename a note by directly writing in the title
        ###
        $("#note-full-title").blur => 
            console.log "event : note-full-title.blur"
            newName = $("#note-full-title").val()
            oldName = @model.title
            if newName isnt "" and oldName != newName
                @homeView.onNoteTitleChange(@model.id, newName)
                TreeInst.Tree.prototype.updateSuggestionList("rename", newName, oldName)
                @updateBreadcrumbOnTitleChange(newName)
                
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
            i = noteModel.humanPath.split(",").length - 1
            breadcrumb = ""
            linkToThePath = []
            parent = undefined
            # ATTENTION! Parfois le humanPath n'est pas le bon ... je ne sais pas pourquoi
            while i >= 1
                parent = data.inst._get_parent(parent)
                path = "/#note/#{parent[0].id}"
                breadcrumb = "<a href='#{path}'> #{noteModel.humanPath.split(",")[i-1]}</a> > #{breadcrumb}"
                i--
            #avoir le meme path qu'avec path = "/"+ data.rslt.obj[0].id + @_getSlugPath parent, nodeName
            #faire appel à selectnote
            path = "/#note/#{noteModel.id}"
            breadcrumb = "#{breadcrumb} <a href='#{path}' > #{noteModel.title}</a>"
                
            $("#note-full-breadcrumb").html breadcrumb

    ###*
    # in case of renaming a note this function update the breadcrumb in consequences
    ###
    updateBreadcrumbOnTitleChange : (newName) ->
        $("#note-full-breadcrumb a:last").text(newName)
