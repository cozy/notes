{BrunchApplication} = require 'helpers'
{MainRouter} = require 'routers/main_router'
{HomeView} = require 'views/home_view'

class exports.Application extends BrunchApplication

  initialize: ->
    @initializeJQueryExtensions()

    @homeView = new HomeView
    @homeView.render()
    @router = new MainRouter

window.app = new exports.Application
