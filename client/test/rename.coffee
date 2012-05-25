should = require("should")
Browser = require("./browser").Browser
helpers = require("./helpers")

app = require("../../server")


describe "Rename", ->

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

    it "When I select todo note", (done) ->
        @browser.click "#tree-node-all-todo a"
        helpers.waits done, 100

    it "And I click on rename button", (done) ->
        @browser.click "#tree-rename"
        @browser.fill ".jstree-rename-input", "Todo renamed"
        @browser.enterKeyUp ".jstree-rename-input"
        helpers.waits done, 100

    it "Then Todo note new title and path are displayed", ->
        @browser.html("#note-full-breadcrump").should.equal "All / Todo renamed"
        @browser.text("#note-full-title").should.equal "Todo renamed"




