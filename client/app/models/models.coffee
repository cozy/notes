# Base class that contains common methods for models.
class exports.BaseModel extends Backbone.Model

  isNew: () ->
    not @id?
