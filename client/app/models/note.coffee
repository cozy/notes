BaseModel = require("models/models").BaseModel

# Describes an application installed in mycloud.
class exports.Note extends BaseModel

    url: '/notes/'

    constructor: (note) ->
        super()
        for property of note
            @[property] = note[property]


    isNew: ->
        not @id?

    saveContent: (content) ->
        @content = content
        @url = "/notes/#{@.id}"
        @save content: @content
