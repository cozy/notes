slugify = require("helpers").slugify

class exports.MainRouter extends Backbone.Router
    routes:
        '': 'home'

    # routes that need regexp.
    initialize: ->
        @route(/^note\/(.*?)$/, 'note')

    # Entry point, render app and select last selected note.
    # home: (callback) ->
    #     $('body').append( app.homeView.el )
    #     app.homeView.setLayout()
    #     app.homeView.fetchData( callback )
    home: (path) ->
        $('body').append( app.homeView.el )
        app.homeView.initContent(path)

    # Select given note (represented by its path), if tree is already 
    # rendered, note is directly selected else it loads tree then it selects 
    # given note.
    note: (path) ->
        # selectNote = ->
        #     app.homeView.selectNote path

        if $("#tree-create").length > 0
            # selectNote()
            app.homeView.selectNote path
        else
            # @home( ->
            #     setTimeout((->
            #         selectNote()), 100)
            # )
            @home( path )
