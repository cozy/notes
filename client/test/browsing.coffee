should = require("should")
Browser = require("./browser").Browser
helpers = require("./helpers")

app = require("../../server")


describe "Browsing", ->

    before (done) ->
        app.listen 8001
        helpers.init done

    before (done) ->
        @browser = new Browser()
        @browser.visit "http://localhost:8001/", =>
            done()

    after (done) ->
        Note.destroyAll ->
            Tree.destroyAll ->
                app.close()
                done()

    it "When I click on recipe note", (done) ->
        @browser.click "#tree-node-all-recipe-dessert a"
        helpers.waits(done, 100)

    it "Then Recipe note title and path are displayed", ->
        @browser.text("#note-full-breadcrump").should.equal \
            "All / Recipe / Dessert"
        @browser.text("#note-full-title").should.equal "Dessert"

    it "When I click on todo note", (done) ->
        @browser.click "#tree-node-all-todo a"
        helpers.waits(done, 100)

    it "Then Todo note title and path are displayed", ->
        @browser.html("#note-full-breadcrump").should.equal "All / Todo"
        @browser.text("#note-full-title").should.equal "Todo"





