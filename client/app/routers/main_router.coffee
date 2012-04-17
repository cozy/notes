slugify = require("helpers").slugify

class exports.MainRouter extends Backbone.Router
  routes:
    '': 'home'

  initialize: ->
    @route(/^note\/(.*?)$/, 'note')

  home: ->
    $('body').html app.homeView.render().el
    app.homeView.setLayout()
    app.homeView.fetchData()

  note: (path) ->

    @home()
