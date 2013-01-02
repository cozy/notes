
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
        for note in notes
            @results.append template(note: note)

    fadeIn: (callback) ->
        @$el.fadeIn callback

    fadeOut: (callback) ->
        @$el.fadeOut callback

    hide: ->
        @$el.hide()

module.exports = SearchView
