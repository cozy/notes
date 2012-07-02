should = require('should')
async = require('async')
Client = require('../common/test/client').Client
app = require('../server')
helpers = require("./helpers")

DataTree = require("../lib/tree").Tree


client = new Client("http://localhost:8888/")



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


    describe "PUT /notes/:id Rename a note and update tree.", ->
        
        it "When I rename a note", (done) ->
            client.put "notes/#{@recipeNote.id}", title: "Recipes", done


        it "Then it should have rename recipe note and its children", (done) ->
            client.get "notes/", (error, response, body) =>
                response.statusCode.should.equal 200
                notes = JSON.parse body
                notes.rows.length.should.equal 3
                notes.rows[0].title.should.equal "Recipes"
                notes.rows[0].path.should.equal "/all/recipes"
                notes.rows[0].humanPath.should.equal "All,Recipes"
                notes.rows[1].title.should.equal "Dessert"
                notes.rows[1].path.should.equal "/all/recipes/dessert"
                notes.rows[1].humanPath.should.equal "All,Recipes,Dessert"
                done()

        it "And it should have updated tree structure properly", (done) ->
            client.get "tree/", (error, response, body) =>
                tree = new DataTree JSON.parse(body)
                should.exist tree.all.recipes
                should.exist tree.all.recipes.dessert
                should.exist tree.all.todo
                done()


    describe "PUT /notes/:id Move a note", ->
        
        it "When I add two new notes", (done) ->
            async.series [
                createNoteFunction "Travel", "/all/travel", "04"
                createNoteFunction "Cambodia", "/all/travel/cambodia", "05"
            ], ->
                done()

        it "And I move recipe to travel", (done) ->
            client.put "notes/#{@recipeNote.id}", path: "/all/travel", done

        it "Then it should have move recipe note and its children", (done) ->
            client.get "notes/", (error, response, body) =>
                response.statusCode.should.equal 200
                notes = JSON.parse body
                notes.rows.length.should.equal 5
                notes.rows[0].title.should.equal "Recipes"
                notes.rows[0].path.should.equal "/all/travel/recipes"
                notes.rows[0].humanPath.should.equal "All,Travel,Recipes"
                notes.rows[1].title.should.equal "Dessert"
                notes.rows[1].path.should.equal "/all/travel/recipes/dessert"
                notes.rows[1].humanPath.should.equal "All,Travel,Recipes,Dessert"
                done()

        it "And it should have updated tree structure properly", (done) ->
            client.get "tree/", (error, response, body) =>
                tree = new DataTree JSON.parse(body)
                should.not.exist tree.all.recipes
                should.exist tree.all.travel.recipes
                should.exist tree.all.travel.recipes.dessert
                should.exist tree.all.todo
                done()


    describe "DELETE /notes/:id Deletes a note and update tree.", ->
        
        it "When I delete Recipe note", (done) ->
            client.delete "notes/#{@recipeNote.id}", done

        it "Then it should have delete recipe note and its children", (done) ->
            client.get "notes/", (error, response, body) =>
                response.statusCode.should.equal 200
                notes = JSON.parse body
                notes.rows.length.should.equal 3
                done()

        it "And it should have updated tree structure properly", (done) ->
            client.get "tree/", (error, response, body) =>
                tree = new DataTree JSON.parse(body)
                should.not.exist tree.all.recipe
                should.exist tree.all.todo
                should.exist tree.all.travel
                should.exist tree.all.travel.cambodia
                done()

