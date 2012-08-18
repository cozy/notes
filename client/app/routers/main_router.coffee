slugify = require("helpers").slugify

class exports.MainRouter extends Backbone.Router
    ###*
    Routes : 2 types : 
        * '' : home : only for the initialization of the app
        * '#note/{note_uuid : 25 char}/slugyPath' : unique url corresponding to a note.
    slugyPath : slugified path of a note constituted with the name of its parents.
    ###

    routes:
        '': 'home'

    # routes that need regexp.
    initialize: ->
        @route(/^note\/(.*?)$/, 'note')

    # Entry point, render app and select last selected note.
    # used only at the initialisation of the app
    home: () ->
        console.log "event : routeur.home"
        @navigate "note/all", trigger: false
        @_initializeTree("tree-node-all")

    # Select given note (represented by its path), if tree is already 
    # rendered, note is directly selected else it loads tree then it selects 
    # given note.
    note: (path) ->
        console.log "event : routeur.note path=#{path}"
        note_uuid = path.substr(0,24)  # TODO BJA : get the id with a regex
        if $("#tree-create").length > 0
            app.homeView.selectNote note_uuid
        else
            if note_uuid == "/all"
                note_uuid = "tree-node-all"
            @_initializeTree(note_uuid)

    _initializeTree : (initPath) ->
        console.log "routeur._initializeTree( #{initPath} )"
        $('body').append(app.homeView.el)
        app.homeView.initContent(initPath)

