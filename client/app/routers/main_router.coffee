class exports.MainRouter extends Backbone.Router
  routes:
    '': 'home'

  home: ->
    $('body').html app.homeView.render().el
    $('#home-view').layout
        size: "330"
        minSize: "320"
        resizable: true
    app.homeView.fetchData()
