BaseModel = require("models/models").BaseModel

class exports.Note extends BaseModel

    url: 'notes/'

    # Copy note properties to current model.
    constructor: (note) ->
        super()
        for property of note
            @[property] = note[property]

    # Send save request to server.
    saveContent: (content) ->
        @content = content
        @url = "notes/#{@.id}"
        @save content: @content
