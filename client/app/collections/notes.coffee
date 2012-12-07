Note = require("models/notes").Note


class exports.NotesCollection extends Backbone.Collection
      
    model: Note
    url: 'notes/'

    constructor: () ->
        super()

    # Select which field from backend response to use for parsing to populate
    # collection.
    parse: (response) ->
        response.rows
