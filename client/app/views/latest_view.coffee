NoteCollection = require 'collections/notes'

class exports.LatestView extends Backbone.View
    id: 'latest-view'

    itemTemplate: require 'views/templates/search_result'

    initialize: () ->
        @collection = new NoteCollection()
        @refresh()

    refresh: () ->
        @collection.reset []
        @collection.fetch
            url: 'notes/latest/'
            success: @render

    render: () =>
        @$el.html ""
        @$el.append "<h1>Latest Notes</h1>"
        if @collection.length is 0
            @$el.append "<p>You have no notes, use the tree on the left to
create one.</p>"
        else
            @collection.each (note) =>
                date = Date.create(note.lastModificationValueOf)
                date = date.long() #TODO LOCALIZE ME
                @$el.append @itemTemplate note: note, date: date

