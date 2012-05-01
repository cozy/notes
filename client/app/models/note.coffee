BaseModel = require("models/models").BaseModel


request = (type, url, data, callback) ->
    $.ajax
        type: type
        url: url
        data: data
        success: callback
        error: (data) ->
            if data and data.msg
                alert data.msg
            else
                alert "Server error occured."


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


    @createNote = (data, callback) ->
        request "POST", "tree", data, callback

    @updateNote = (data, callback) ->
        request "PUT", "tree", data, callback

    @deleteNote = (data, callback) ->
        request "PUT", "tree/path", data, callback

    @moveNote = (data, callback) ->
        request "POST", "tree/path/move", data, callback

    @getNote = (id, callback) ->
        $.get "notes/#{id}", (data) =>
            note = new Note data
            callback(note)

