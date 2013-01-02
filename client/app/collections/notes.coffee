Note = require("models/note").Note
request = require '../lib/request'

add3Dots = (string, limit) ->
    if string?.length > limit
        string.substring(1, limit - 1) + "..."
    else
        string

getPreview = (note) ->
    preview = add3Dots note.content, 200
    converter = new Showdown.converter()
    preview = converter.makeHtml preview
    preview


class NotesCollection extends Backbone.Collection
      
    model: Note
    url: 'notes/'

    constructor: () ->
        super()

    # Select which field from backend response to use for parsing to populate
    # collection.
    parse: (response) ->
        response.rows
    @search: (query, callback) ->

        if query.length > 0
            request.post 'notes/search', query: query, (err, notes) =>

                if err
                    alert "Server error occured while searching."
                else
                    results = []
                    for note in notes
                        #note.preview = getPreview note
                        results.push new Note(note)
                    callback results

        else
            callback []

module.exports = NotesCollection
