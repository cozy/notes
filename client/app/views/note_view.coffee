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

