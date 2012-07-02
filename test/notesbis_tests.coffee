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

    describe "POST /notes Creates a note and update tree.", ->

        it "When I create several notes", (done) ->
            async.series [
                createNoteFunction "Recipe", "/all/recipe", "01"
                createNoteFunction "Dessert", "/all/recipe/dessert", "02"
                createNoteFunction "Todo", "/all/todo", "03"
            ], ->
                done()

        it "Then it should have 3 notes created", (done) ->
            client.get "notes/", (error, response, body) =>
                response.statusCode.should.equal 200
                notes = JSON.parse(body)
                notes.rows.length.should.equal 3
                notes.rows[0].title.should.equal "Recipe"
                notes.rows[0].path.should.equal "/all/recipe"
                notes.rows[0].humanPath.should.equal "All,Recipe"
                @recipeNote = notes.rows[0]
                done()

        it "And it should have updated tree structure properly", (done) ->
            client.get "tree/", (error, response, body) =>
                tree = new DataTree JSON.parse(body)
                should.exist tree.all.recipe.dessert
                should.exist tree.all.recipe
                should.exist tree.all.todo
                done()


    describe "DELETE /notes/:id Deletes a note and update tree.", ->
        
        it "When I delete Recipe note", (done) ->
            client.delete "notes/#{@recipeNote.id}", done

        it "Then it should have delete recipe note and its children", (done) ->
            client.get "notes/", (error, response, body) =>
                response.statusCode.should.equal 200
                notes = JSON.parse(body)
                notes.rows.length.should.equal 1
                notes.rows[0].title.should.equal "Todo"
                done()

        it "And it should have updated tree structure properly", (done) ->
            client.get "tree/", (error, response, body) =>
                tree = new DataTree JSON.parse(body)
                should.not.exist tree.all.recipe
                should.exist tree.all.todo
                done()


