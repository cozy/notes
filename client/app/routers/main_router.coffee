slugify = require("helpers").slugify

class exports.MainRouter extends Backbone.Router
    routes:
         '': 'home'

    # routes that need regexp.
    initialize: ->
        @route(/^note\/(.*?)$/, 'note')

    # Entry point, render app and select last selected note.
    home: ->
        $('body').html app.homeView.render().el
        app.homeView.setLayout()
        app.homeView.fetchData()

    note: (path) ->
        @home()


