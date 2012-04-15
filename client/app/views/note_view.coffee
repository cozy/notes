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
        $("#note-full-breadcrump").html @model.humanPath.split(",").join(" / ")
        $("#note-full-title").html @model.title
        $("#note-full-content").val @model.content

        @el

    @setEditor: (changeCallback) ->
        CKEDITOR.editorConfig = (config) ->
            config.removePlugins = 'scayt,menubutton,contextmenu'
            config.extraPlugins = 'onchange'
            config.minimumChangeMilliseconds=1000


        $("#note-full-content").ckeditor ->
                $(".cke_toolbar").hide()
            ,
            toolbar_Cozy: [[
                    'Bold', 'Italic', '-',
                    'NumberedList', 'BulletedList', '-',
                    'Outdent', 'Indent'
                ]]
            toolbar: 'Cozy'
            uiColor : 'white'


        editor = $("#note-full-content").ckeditorGet()
        editor.on "focus", (event) ->
            $(".cke_toolbar").show()
        editor.on "focusout", (event) ->
            $(".cke_toolbar").hide()
        editor.on "change", changeCallback

        editor = $("textarea#note-full-content")
        editor
