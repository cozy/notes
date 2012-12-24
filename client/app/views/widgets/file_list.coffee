helpers = require '../../helpers'

class exports.FileList

    constructor: (@model, @id) ->
        @$el = $ @id

        @uploadButton = $("#file-pic")
        @uploader = new qq.FileUploaderBasic
            button: document.getElementById('file-pic')
            mutliple: false
            forceMultipart: true
            onComplete: @onUploadComplete
            onSubmit: @submitComplete
        @uploadButton.find("input").css("cursor", "pointer !important")

        @widget = $("#note-file-list")
        @widget.mouseenter @onMouseEnter
        @widget.mouseleave @onMouseLeave

    onSubmit: =>
        @uploadButton.find("i").css('visibility', 'hidden')
        @uploadButton.spin 'small'

    onUploadComplete: (id, filename, response) =>
        @uploadButton.find("i").css('visibility', 'visible')
        @$el.slideDown()
        @model._attachments = {} if not @model._attachments?
        @model._attachments[filename] = {}
        @addFileLine filename
        @setFileNumber()
        @fileList.slideDown =>
            @uploadButton.spin()

    onMouseEnter: =>
        @widget.unbind 'mouseleave'
        @$el.slideDown =>
            @widget.mouseleave @onMouseLeave

    onMouseLeave: =>
        @$el.slideUp()

    configure: (model) ->
        @model = model
        @uploader._options.action = "notes/#{@model.id}/files/"
        @uploader._handler._options.action = "notes/#{@model.id}/files/"
        @setFileNumber()

    ###*
    # Display inside dedicated div list of files attached to the current note.
    ###
    render: ->
        if @model?
            $('.note-file button').unbind()
            @$el.html null
            for file of @model._attachments
                @addFileLine file
            @setFileNumber()

    # Render link corresponding to given file : label + delete button.
    # Set listener on delete button.
    addFileLine: (file) ->
        path = "notes/#{@model.id}/files/#{file}"
        slug = helpers.slugify file
        lineId = "note-#{slug}"
        @$el.append """
            <div class="note-file spacer" id="#{lineId}">
                <a href="#{path}" target="_blank">#{file}</a>
                <button>(x)</button>
            </div>"""
        line = @$el.find("##{lineId}")
        delButton = line.find("button")
        line.hide()
        delButton.click (target) =>
            delButton.html "&nbsp;&nbsp;&nbsp;"
            delButton.spin 'tiny'
            $.ajax
                url: path
                type: "DELETE"
                success: =>
                    delButton.spin()
                    delete @model._attachments[file]
                    @setFileNumber()
                    line.fadeOut ->
                        line.remove()
                error: =>
                    alert "Server error occured."
        line.fadeIn()

    setFileNumber: ->
        fileNumber = 0
        for file of @model._attachments
            fileNumber++

        if fileNumber > 1
            @widget.find('#file-number').html "#{fileNumber} files"
        else if fileNumber is 1
            @widget.find('#file-number').html "#{fileNumber} file"
        else
            @widget.find('#file-number').html "no file"
