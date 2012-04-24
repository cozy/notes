BaseModel = require("models/models").BaseModel

# Model that describes a single note.
class exports.Note extends BaseModel

    url: 'notes/'

    # Copy note properties to current model.
    constructor: (note) ->
        super()
        for property of note
            @[property] = note[property]

    # Set right url then send save request to server.
    saveContent: (content) ->
        @content = content
        @url = "notes/#{@.id}"
        @save content: @content
