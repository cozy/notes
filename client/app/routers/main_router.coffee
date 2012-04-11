class exports.MainRouter extends Backbone.Router
  routes:
    '': 'home'

  home: ->
    $('body').html app.homeView.render().el
    $('#home-view').layout
        size: "310"
        minSize: "310"
        resizable: true
    app.homeView.fetchData()
