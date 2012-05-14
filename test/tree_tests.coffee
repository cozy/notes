should = require("should")
client = require("./client")
app = require("../server")

DataTree = require("../lib/tree").Tree

responseTest = null
bodyTest = null

storeResponse = (error, response, body, done) ->
    responseTest = null
    bodyTest = null
    if error
        false.should.be.ok()
    else
        responseTest = response
        bodyTest = body
    done()

handleResponse = (error, response, body, done) ->
    if error
        false.should.be.ok()
    done()

tree = null



describe "/tree", ->

    before (done) ->
        app.listen(8001)
        Note.destroyAll ->
            Tree.destroyAll done

    after (done) ->
        app.close()
        done()


    describe "POST /tree Create a note inside tree", ->
        it "When I send data for a node creation to /tree", (done) ->
            client.post "tree/", \
                        { path: "/all", name: "Recipe" }, \
                        ->
                client.post "tree/", \
                            { path: "/all/recipe", name: "Dessert" }, \
                            ->
                                done()

        it "And I add a node creation to /tree", (done) ->
            client.post "tree/", \
                        { path: "/all/recipe/dessert", name: "Brownie" }, \
                        (error, response, body) ->
                storeResponse error, response, body, done

        it "Then a 201 success response is returned", ->
            responseTest.statusCode.should.equal 201


    describe "GET /tree Retrieve current tree", ->

        it "When I retrieve tree from /tree", (done) ->
            client.get "tree/", (error, response, body) ->
                storeResponse error, response, body, done

        it "Then I have a tree with this path /all/recipe/dessert/brownie", ->
            bodyTest = JSON.parse bodyTest
            tree = new DataTree bodyTest
            should.exist tree.all.recipe.dessert.brownie
            tree.all.recipe.dessert.brownie.name.should.equal "Brownie"

        it "When I retrieve note from /notes/id", (done) ->
            client.get "notes/#{tree.all.recipe.dessert.brownie.id}/", \
                       (error, response, body) ->
                storeResponse error, response, body, done

        it "Then I have a note with right path", ->
            bodyTest = JSON.parse bodyTest
            bodyTest.path.should.equal "/all/recipe/dessert/brownie"
            bodyTest.humanPath.split(",").join("/").should.equal \
                                                "All/Recipe/Dessert/Brownie"


    describe "PUT /tree Update a node", ->

        it "When I change Recipe to Main Dishes", (done) ->
            data =
                path: "/all/recipe"
                newName: "Main Dishes"
                
            client.put "tree/", data, (error, response, body) ->
                storeResponse error, response, body, done
        
        it "And I retrieve tree from /tree", (done) ->
            client.get "tree/", (error, response, body) ->
                storeResponse error, response, body, done

        it "Then I have a tree that contains path /all/main-dishes", ->
            bodyTest = JSON.parse bodyTest
            tree = new DataTree bodyTest
            should.exist tree.all.main_dishes
            tree.all.main_dishes.name.should.equal "Main Dishes"
            tree.all.main_dishes.dessert.name.should.equal "Dessert"

        it "When I send a request to get notes with old dessert path", (done) ->
            client.post "notes/path", path: "/all/recipe/dessert", \
                        (error, response, body) ->
                storeResponse error, response, body, done

        it "Then I got no notes", ->
            should.exist(bodyTest)
            should.exist(bodyTest.rows)
            bodyTest.rows.length.should.equal 0
            responseTest.statusCode.should.equal 200

        it "When I send a request to get notes with new dessert path", (done) ->
            client.post "notes/path", path: "/all/main-dishes", \
                        (error, response, body) ->
                storeResponse error, response, body, done

        it "Then I got three notes", ->
            should.exist(bodyTest)
            should.exist(bodyTest.rows)
            bodyTest.rows.length.should.equal 3
            responseTest.statusCode.should.equal 200


     describe "DELETE /tree Delete given node", ->

        it "When I delete node /all/main-dishes/dessert", (done) ->
            client.put "tree/path", \
                    path: "/all/main-dishes/dessert", (error, response, body) ->
                storeResponse error, response, body, done

        it "Then a 200 success response is returned", ->
            responseTest.statusCode.should.equal 200

        it "When I retrieve tree from /tree", (done) ->
            client.get "tree/", (error, response, body) ->
                storeResponse error, response, body, done

        it "Then I have a tree that contains only path /all/main-dishes", ->
            bodyTest = JSON.parse bodyTest
            tree = new DataTree bodyTest
            should.exist tree.all.main_dishes
            should.not.exist tree.all.main_dishes.dessert

        it "When I send a request to get notes with dessert path", (done) ->
            client.post "notes/path", path: "/all/main-dishes/dessert", \
                        (error, response, body) ->
                storeResponse error, response, body, done

        it "Then I got no notes", ->
            should.exist(bodyTest)
            should.exist(bodyTest.rows)
            bodyTest.rows.length.should.equal 0
            responseTest.statusCode.should.equal 200

    describe "POST /tree/path/move Move given node to given destination", \
                (done) ->

        it "When I send data for a node creation : /all/recipes", (done) ->
            client.post "tree/", { path: "/all", name: "Recipes" }, done

        it "And I move /all/main-dishes/ to /all/recipes/", (done) ->
            data = { path: "/all/main-dishes", dest: "/all/recipes" }
            client.post "tree/path/move", data, (error, response, body) ->
                storeResponse error, response, body, done

        it "Then a 200 success response is returned", ->
            responseTest.statusCode.should.equal 200

        it "When I retrieve tree from /tree", (done) ->
            client.get "tree/", (error, response, body) ->
                storeResponse error, response, body, done

        it "Then I have a tree that contains only path /all/recipes/main-dishes", ->
            bodyTest = JSON.parse bodyTest
            tree = new DataTree bodyTest
            should.not.exist tree.all.main_dishes
            should.exist tree.all.recipes.main_dishes
        
        it "When I send a request to get notes with main-dishes path", (done) ->
            client.post "notes/path", path: "/all/main-dishes", \
                        (error, response, body) ->
                storeResponse error, response, body, done

        it "Then I got no notes", ->
            should.exist(bodyTest)
            should.exist(bodyTest.rows)
            bodyTest.rows.length.should.equal 0
            responseTest.statusCode.should.equal 200

        it "When I send a request to get notes with recipes path", (done) ->
            client.post "notes/path", path: "/all/recipes", \
                        (error, response, body) ->
                storeResponse error, response, body, done

        it "Then I got two notes", ->
            should.exist(bodyTest)
            should.exist(bodyTest.rows)
            bodyTest.rows.length.should.equal 2
            note = bodyTest.rows[0]
            note.humanPath.should.equal "All,Recipes,Main Dishes"
            note = bodyTest.rows[1]
            note.humanPath.should.equal "All,Recipes"
            responseTest.statusCode.should.equal 200

