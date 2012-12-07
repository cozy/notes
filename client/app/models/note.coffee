BaseModel = require("models/models").BaseModel
request = require("lib/request")


# Model that describes a single note.
class exports.Note extends BaseModel

    rootUrl: 'notes/'

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

    @createNote = (data, callback) ->
        request.post "notes", data, callback

    @updateNote = (id, data, callback) ->
        request.put "notes/#{id}", data, callback

    @deleteNote = (id, callback) ->
        request.del "DELETE", "notes/#{id}", callback

    @getNote = (id, callback) ->
        $.get "notes/#{id}", (data) =>
            note = new Note data
            callback(note)
