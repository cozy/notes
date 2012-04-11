Application = require("models/application").Application

# List of installed applications.
class exports.NotesCollection extends Backbone.Collection
    
  model: Application
  url: 'notes/'

  constructor: () ->
    super()

  # Select which field from backend response to use for parsing to populate
  # collection.
  parse: (response) ->
    response.rows

