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
        'search/:query': 'search'

    # routes that need regexp.
    initialize: ->
        @route /^note\/(.*?)\/(.*?)$/, 'note'


    # Entry point, render app and select last selected note.
    # used only at the initialisation of the app
    home: ->
        @navigate "note/all", trigger: false
        @_initializeTree "tree-node-all", ->
            app.homeView.selectNoteIfIframeLoaded()

    # Navigate to root tree, display no note
    allNotes: ->
        if $('#tree').length > 0
            app.homeView.selectNote "tree-node-all"
        else
            @_initializeTree "tree-node-all", ->
                app.homeView.selectNoteIfIframeLoaded()

    # Select given note (represented by its path), if tree is already 
    # rendered, note is directly selected else it loads tree then it selects 
    # given note.
    note: (noteId, path) ->
        if $("#tree").length > 0
            app.homeView.selectNote noteId
        else
            @_initializeTree noteId, ->
                app.homeView.selectNoteIfIframeLoaded()

    # Build tree if needed, then asks to home view which request to perform.
    search: (query) ->
        query = query.replace(/-/g, ' ')
        if $('#tree').length is 0
            @_initializeTree "", ->
                app.homeView.tree.addSearchTag query
                app.homeView.search query
        else
             app.homeView.search query

    # Build tree then select note corresponding to nodeId.
    _initializeTree: (noteId, callback) ->
        $('body').append app.homeView.el
        app.homeView.initContent noteId, callback
