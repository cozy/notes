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

    # When note change, its content is saved.
    onNoteChanged: (event) =>
        @model.saveContent $("#note-full-content").val()

    remove: ->
        $(@el).remove()

    ### configuration ###

    render: ->
        $("#note-full-breadcrump").html @model.humanPath.split(",").join(" / ")
        $("#note-full-title").html @model.title
        $("#note-full-content").val @model.content

        editor = @.$("textarea#note-full-content")
        editor.unbind("keyup")
        editor.keyup @onNoteChanged

        @el

