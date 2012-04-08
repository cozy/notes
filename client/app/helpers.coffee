class exports.BrunchApplication
  constructor: ->
    $ =>
      @initialize this
      Backbone.history.start()

  initialize: ->
    null


exports.slugify = (string) ->
    _slugify_strip_re = /[^\w\s-]/g
    _slugify_hyphenate_re = /[-\s]+/g
    string = string.replace(_slugify_strip_re, '').trim().toLowerCase()
    string = string.replace _slugify_hyphenate_re, '-'
    string

