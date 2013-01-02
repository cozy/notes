template = require('./templates/note')
Note = require('../models/note').Note
TreeInst = require('./widgets/tree')
FileList = require('./widgets/file_list').FileList

helpers = require '../helpers'


class exports.NoteView extends Backbone.View
    className: "note-full"
    id: "note-full"
    tagName: "div"
   
    ### Constructor ####

    remove: ->
        @$el.remove()

    constructor: (@homeView, @onIFrameLoaded) ->
        super()

        @$el = $("#note-full")

        @$("#editor").html require('./templates/editor')

        @saveTimer = null
        @saveButton = @$ '#save-editor-content'
        @noteFullTitle = @$ '#note-full-title'
        @breadcrumb = @$ '#note-full-breadcrumb'

        @editor = new CNeditor(@$('#editorIframe')[0], @onIFrameLoaded)
        #@$('#editorIframe').niceScroll
            #cursorcolor: "#CCC"
            #enablekeyboard: false
        @configureButtons()
        @setTitleListeners()
        @setSaveListeners()

        @fileList = new FileList @model, '#file-list'
        
    ###*
    # every keyUp in the note's editor will trigger a countdown of 3s, after
    # 3s and if the user didn't type anything, the content will be saved
    ###
    setSaveListeners: ->
        @$("iframe").on "onKeyUp", () =>
            id = @model.id

            clearTimeout @saveTimer
            @saveButton.removeClass("active") if @saveButton.hasClass "active"

            @saveTimer = setTimeout(=>
                @saveButton.spin 'small'
                Note.updateNote id, content: @editor.getEditorContent(), =>
                    @saveButton.spin()

                unless @saveButton.hasClass "active"
                    @saveButton.addClass "active"
            , 3000)
        @saveButton.click @saveEditorContent

    setTitleListeners: ->
        @noteFullTitle.live "keypress", (event) ->
            noteFullTitle.trigger "blur" if event.keyCode is 13

        @noteFullTitle.blur =>
            newName = @noteFullTitle.val()
            oldName = @model.title
            if newName isnt "" and oldName != newName
                @homeView.onNoteTitleChange @model.id, newName
                @homeView.tree._updateSuggestionList "rename", newName, oldName
                @updateBreadcrumbOnTitleChange newName
        
    configureButtons: ->
        @indentBtn = @$("#indentBtn")
        @unIndentBtn = @$("#unIndentBtn")
        @markerListBtn = @$("#markerListBtn")
        @saveEditorBtn = @$("#save-editor-content")
        @titleBtn = @$("#titleBtn")

        @indentBtn.tooltip
            placement: "right"
            title: "Indent the selection"
        @indentBtn.on "click", () =>
            @editor._addHistory()
            @editor.tab()

        @unIndentBtn.tooltip
            placement: "right"
            title: "Unindent the selection"
        @unIndentBtn.on "click", () =>
            @editor._addHistory()
            @editor.shiftTab()

        @markerListBtn.tooltip
            placement: "right"
            title: "Change selection from titles to marker list"
        @markerListBtn.on "click", () =>
            @editor._addHistory()
            @editor.markerList()

        @titleBtn.tooltip
            placement: "right"
            title: "Change selection from marker list to titles"
        @titleBtn.on "click", () =>
            @editor._addHistory()
            @editor.titleList()
            
        @saveEditorBtn.tooltip
            placement: "right"
            title: "Save the current content"
        
    ###*
    # 
    ###
    setModel : (note, data) ->
        @model = note
        @setTitle note.title
        @setContent note.content
        @createBreadcrumb note, data
        @fileList.configure @model
        @fileList.render()
        
    ###*
    #  Display note title
    ###
    setTitle: (title) ->
        @noteFullTitle.val title

    ###*
    # Stop saving timer if any and force saving of editor content. 
    ###
    saveEditorContent: =>
        if @model? and @editor? and @saveTimer?
            clearTimeout @saveTimer
            @saveTimer = null
            @saveButton.spin 'small'
            Note.updateNote @model.id, content: @editor.getEditorContent(), =>
                @saveButton.addClass("active")
                @saveButton.spin()

    # Display given content inside editor.
    # If no content is given, editor is cleared.
    setContent : (content) ->
        if content
            @editor.setEditorContent(content)
        else
            @editor.deleteContent()

    ###*
    # create a breadcrumb showing a clickable way from the root to the current note
    # input: noteModel, contains the informations of the current note
    #  data, allow to reach the id of the parents of the current note
    # output: the breadcrumb html is modified
    ###
    createBreadcrumb : (noteModel, data) ->
        paths = noteModel.path
        noteName = paths.pop()
        breadcrumb = ""

        parent = @homeView.tree.jstreeEl.jstree("get_selected")
        while paths.length > 0
            parent = data.inst._get_parent parent
            path = "#note/#{parent[0].id}/"
            currentPath = paths.join("/")
            noteName = paths.pop()
            breadcrumb = "<a href='#{path}#{currentPath}'> #{noteName}</a> >#{breadcrumb}"

        breadcrumb = "<a href='#note/all'> All</a> > #{breadcrumb}"
        
        @breadcrumb.find("a").unbind()
        @breadcrumb.html breadcrumb
        @breadcrumb.find("a").click (event) ->
            event.preventDefault()
            hash = event.target.hash.substring(1)
            path = hash.split("/")
            id = path[1]
            app.homeView.selectNote id
            
    ###*
    # in case of renaming a note this function update the breadcrumb in consequences
    ###
    updateBreadcrumbOnTitleChange : (newName) ->
        @breadcrumb.find(" a:last").text newName

