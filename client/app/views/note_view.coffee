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
    #breadcrumb will contain the path of the selected note in a link format (<a>)
    #the code below generates the breadcrumb corresponding to the current note path
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
        $("#note-full-title").html @model.title
        $("#note-full-content").val @model.content

        @el

    @setEditor: (changeCallback) ->
        editor = $("textarea#note-full-content")
        editor.keyup (event) =>
            changeCallback()

