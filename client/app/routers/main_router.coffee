slugify = require("helpers").slugify

class exports.MainRouter extends Backbone.Router
    routes:
        '': 'home'

    # routes that need regexp.
    initialize: ->
        @route(/^note\/(.*?)$/, 'note')

    # Entry point, render app and select last selected note.
    home: (callback) ->
        $('body').html app.homeView.render().el
        app.homeView.setLayout()
        app.homeView.fetchData callback

    note: (path) ->
        selectNote = ->
            app.homeView.selectNote path

        if $("#tree-create").length > 0
            selectNote()
        else
            @home ->
                setTimeout((->
                    selectNote()), 100)
