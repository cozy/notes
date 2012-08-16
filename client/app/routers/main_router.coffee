slugify = require("helpers").slugify

class exports.MainRouter extends Backbone.Router
    routes:
        '': 'home'

    # routes that need regexp.
    initialize: ->
        @route(/^note\/(.*?)$/, 'note')

    # Entry point, render app and select last selected note.
    home: (initPath) ->
        console.log "event : routeur.home"
        @_initializeTree("note/tree-node-allall")

    # Select given note (represented by its path), if tree is already 
    # rendered, note is directly selected else it loads tree then it selects 
    # given note.
    note: (path) ->
        console.log "event : routeur.note"
        id = path.substr(0,24)  # TODOBJA
        if $("#tree-create").length > 0
            app.homeView.selectNote id
        else
            @_initializeTree( id )

    _initializeTree : (initPath) ->
        console.log "routeur._initializeTree"
        $('body').append(app.homeView.el)
        app.homeView.initContent(initPath)

