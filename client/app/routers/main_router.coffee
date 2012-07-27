slugify = require("helpers").slugify

class exports.MainRouter extends Backbone.Router
    routes:
        '': 'home'

    # routes that need regexp.
    initialize: ->
        @route(/^note\/(.*?)$/, 'note')

    # Entry point, render app and select last selected note.
    home: (path) ->
        $('body').append( app.homeView.el )
        app.homeView.initContent(path)

    # Select given note (represented by its path), if tree is already 
    # rendered, note is directly selected else it loads tree then it selects 
    # given note.
    note: (path) ->

        if $("#tree-create").length > 0
            app.homeView.selectNote path
        else
            @home( path )
