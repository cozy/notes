slugify = require("helpers").slugify

class exports.MainRouter extends Backbone.Router
    ###*
    Routes : 2 types : 

      * '' : home : only for the initialization of the app
      * '#note/{note_uuid : 25 char}/slugyPath' : unique url corresponding 
        to a note where note_uuid is the note id and slugyPath the slugified 
        path of a note constituted with the name of its parents.
    ###

    routes:
        '': 'home'
        'note/all': "allNotes"

    # routes that need regexp.
    initialize: ->
        @route /^note\/(.*?)\/(.*?)$/, 'note'

    # Entry point, render app and select last selected note.
    # used only at the initialisation of the app
    home: () ->
        console.log "event : router.home"
        @navigate "note/all", trigger: false
        @_initializeTree "tree-node-all"

    # Select given note (represented by its path), if tree is already 
    # rendered, note is directly selected else it loads tree then it selects 
    # given note.
    note: (note_uuid, path) ->
        console.log "event : routeur.note path=#{path}"
        if $("#tree-create").length > 0
            app.homeView.selectNote note_uuid
        else
            @allNotes()

    allNotes: ->
        if $('#tree').length > 0
            app.homeView.selectNote "tree-node-all"
        else
            @_initializeTree "tree-node-all"

    _initializeTree: (initPath) ->
        console.log "routeur._initializeTree( #{initPath} )"
        $('body').append app.homeView.el
        app.homeView.initContent initPath

