Browser = require("zombie").Browser
client = require("../../test/client")
should = require("should")

app = require("../../server")


createDefaultNotes = (callback) ->
    client.post "tree/", { path: "/all", name: "Recipe" }, ->
        client.post "tree/", { path: "/all", name: "Todo" }, ->
            client.post "tree/", { path: "/all/recipe", name: "Dessert" }, ->
                callback()

init = (callback) ->
    Note.destroyAll ->
        Tree.destroyAll ->
            createDefaultNotes ->
                callback()


describe "Quick Search", ->

    before (done) ->
        app.listen 8001
        init done

    before (done) ->
        @browser = new Browser()
        @browser.visit "http://localhost:8001/", =>
            done()

    after (done) ->
        app.close()
        Note.destroyAll ->
            Tree.destroyAll done

    it "I expect that three notes are displayed inside tree", (done) ->
        should.exist @browser.query("#tree-node-all")
        should.exist @browser.query("#tree-node-all-recipe")
        should.exist @browser.query("#tree-node-all-recipe-dessert")
        should.exist @browser.query("#tree-node-all-todo")
        done()

