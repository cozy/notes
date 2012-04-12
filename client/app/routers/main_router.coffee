slugify = require("helpers").slugify

class exports.MainRouter extends Backbone.Router
  routes:
    '': 'home'

  initialize: ->
    @route(/^note\/(.*?)$/, 'note')

  home: ->
    $('body').html app.homeView.render().el
    $('#home-view').layout
        size: "310"
        minSize: "310"
        resizable: true
    app.homeView.fetchData()

  note: (path) ->
      #alert slugify(path)

    @home()
