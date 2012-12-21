slugify = require("helpers").slugify

class exports.MainRouter extends Backbone.Router
    ###*
    Routes:

      * '': home: initialize the app
      * '#note/{note_uuid : 25 char}/slugyPath' : unique url corresponding 
        to a note where note_uuid is the note id and slugyPath the slugified 
        path of a note constituted with the name of its parents.
    ###

    routes:
        '': 'home'
        'note/all': 'allNotes'

    # routes that need regexp.
    initialize: ->
        @route /^note\/(.*?)\/(.*?)$/, 'note'

    # Entry point, render app and select last selected note.
    # used only at the initialisation of the app
    home: ->
        @navigate "note/all", trigger: false
        @_initializeTree "tree-node-all"

    # Select given note (represented by its path), if tree is already 
    # rendered, note is directly selected else it loads tree then it selects 
    # given note.
    note: (note_uuid, path) ->
        if $("#tree").length > 0
            app.homeView.selectNote note_uuid
        else
            @_initializeTree note_uuid

    allNotes: ->
        if $('#tree').length > 0
            app.homeView.selectNote "tree-node-all"
        else
            @_initializeTree "tree-node-all"

    _initializeTree: (note_uuid) ->
        $('body').append app.homeView.el
        app.homeView.initContent note_uuid
