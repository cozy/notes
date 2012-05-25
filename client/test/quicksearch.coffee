should = require("should")
Browser = require("./browser").Browser
helpers = require("./helpers")

app = require("../../server")



describe "Quick Search", ->

    before (done) ->
        app.listen 8001
        helpers.init done

    before (done) ->
        @browser = new Browser()
        @browser.visit "http://localhost:8001/", =>
            @browser.evaluate "$('#tree-search-field').hide()"
            done()

    after (done) ->
        Note.destroyAll ->
            Tree.destroyAll ->
                app.close()
                done()


    it "I expect that three notes are displayed inside tree", ->
        should.exist @browser.query("#tree-node-all")
        should.exist @browser.query("#tree-node-all-recipe")
        should.exist @browser.query("#tree-node-all-recipe-dessert")
        should.exist @browser.query("#tree-node-all-todo")

    it "And that tree search is hidden", ->
        @browser.isVisible("#tree-search-field").should.not.be.ok

    it "When I click on search button", ->
        @browser.click "#tree-search"

    it "Then search field is visible", ->
        @browser.isVisible("#tree-search-field").should.be.ok

    it "When i fill search field with dessert", ->
        @browser.fill "#tree-search-field", "dessert"
        @browser.keyUp "#tree-search-field"

    it "Then dessert note is highlighted and displayed", ->
        @browser.isVisible("#tree-node-all-recipe-dessert").should.be.ok
        @browser.hasClass("#tree-node-all-recipe-dessert a", "jstree-search")


        

