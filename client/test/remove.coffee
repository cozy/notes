should = require("should")
Browser = require("../../common/test/browser").Browser
helpers = require("./helpers")

app = require("../../server")


describe "Remove", ->

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

    it "And I click on delete button", (done) ->
        @browser.click "#tree-remove"
        helpers.waits done, 200

    it "Then Todo node is removed", ->
        should.not.exist @browser.query("#tree-node-all-todo")
        
    it "Then note widget is hidden", ->
        @browser.isVisible("#note-full").should.be.ok
