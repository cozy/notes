
# Widget that display search results
class SearchView extends Backbone.View
    
    id: "note-search"

    constructor: (@$el) ->
        @$el.hide()
        @$el.html require('views/templates/search_view')
        @results = @$(".results")
        @queryTitle = @$("span")

    fill: (notes, query) ->
        @results.html null
        @queryTitle.html " " + query
        
        template = require('views/templates/search_result')
        if notes.length
            for note in notes
                @results.append template(note: note)
        else
            @results.append '<p class="pl1">No note found.</p>'

    fadeIn: (callback) ->
        @$el.fadeIn callback

    fadeOut: (callback) ->
        @$el.fadeOut callback

    hide: ->
        @$el.hide()

module.exports = SearchView
