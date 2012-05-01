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

        console.log "TODO: set editor"

        editor = $("textarea#note-full-content")
        editor
