class exports.HomeView extends Backbone.View
  id: 'home-view'

  render: ->
    $(@el).html require('./templates/home')
    @.$("#nav").jstree
	    json_data:
            data: [
                data: "recipe"
                metadata: id : 23
                children: [ "Child 1", "tert", "ret", "A Child 2" ]
            ,
                data :
                    title: "Todo"
            ]
        themes:
            theme: "default"
            dots: false
            icons: false
        core:
            animation: 0
	    plugins: [ "themes", "json_data", "ui" ]
    this
