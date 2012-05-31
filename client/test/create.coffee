should = require("should")
Browser = require("../../common/test/browser").Browser
helpers = require("./helpers")

app = require("../../server")


describe "Create", ->

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

    it "And I click on create button", (done) ->
        @browser.click "#tree-create"
        done()

    it "And i fill create input", (done) ->
        @browser.fill ".jstree-rename-input", "Cozy"
        @browser.evaluate "$('.jstree-rename-input').trigger('blur')"
        helpers.waits done, 200

    it "Then new note title and path are displayed", ->
        @browser.html("#note-full-breadcrump").should.equal "All / Todo / Cozy"
        @browser.text("#note-full-title").should.equal "Cozy"
        should.exist @browser.query("#tree-node-all-todo-cozy")
        @browser.location.hash.should.equal "#note/all/todo/cozy"
