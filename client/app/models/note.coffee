BaseModel = require("models/models").BaseModel

# Describes an application installed in mycloud.
class exports.Note extends BaseModel

  url: '/all/'

  constructor: (note) ->
    super()
    for property of note
        @[property] = note[property]


