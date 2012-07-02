should = require('should')
async = require('async')
Client = require('../common/test/client').Client
app = require('../server')
helpers = require("./helpers")

DataTree = require("../lib/tree").Tree


client = new Client("http://localhost:8001/")



#helpers 

createNoteFunction = (title, path, content) ->
    (callback) ->
        note =
            title: title
            content: content
            path: path

        client.post "notes/", note, callback

describe "/notes", ->

    before (done) ->
        app.listen(8888)
        helpers.cleanDb done

    after (done) ->
        app.close()
        #helpers.cleanDb done
        done()

    describe "POST /notes Creates a bunch of notes", ->

        it "When I create several notes", (done) ->
            async.series [
                createNoteFunction "Recipe", "/all/recipe", "Test content 01"
                createNoteFunction "Dessert", "/all/recipe/dessert", \
                    "Test content 02"
            ], ->
                done()

        it "Then it should have 2 notes created", (done) ->
            client.get "notes/", (error, response, body) =>
                response.statusCode.should.equal 200
                notes = JSON.parse(body)
                console.log notes
                notes.rows.length.should.equal 2
                body.rows[0].title.should.equal "Recipe"
                done()

        it "Then it should have updated tree structure properly", (done) ->
            client.get "tree/", (error, response, body) =>
                tree = new DataTree JSON.parse(body)
                should.exist tree.all.recipe.dessert
                should.exist tree.all.recipe
                done()
