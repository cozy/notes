template = require('./templates/note')

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
        $(@el).html(template(note: @model))
        @el.id = "note-#{@model.id}"
        @el

    setEditor: ->
        CKEDITOR.editorConfig = (config) ->
            config.removePlugins = 'scayt,menubutton,contextmenu'

        $("textarea#note-content").ckeditor ->
                $(".cke_toolbar").hide()
            ,
            toolbar_Cozy: [[
                    'Bold', 'Italic', '-',
                    'NumberedList', 'BulletedList', '-',
                    'Outdent', 'Indent'
                ]]
            toolbar: 'Cozy'
            uiColor : 'white'

        CKEDITOR.on 'onChange', (e) ->
            alert "change"
