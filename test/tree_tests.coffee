should = require("should")
client = require("./client")

DataTree = require("../lib/tree").Tree

responseTest = null
bodyTest = null

storeResponse = (error, response, body, done) ->
    responseTest = null
    bodyTest = null
    if error
        console.log error
        false.should.be.ok()
    else
        responseTest = response
        bodyTest = body
    done()

handleResponse = (error, response, body, done) ->
    if error
        console.log error
        false.should.be.ok()
    done()

tree = null

describe "/tree", ->


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
            tree = new DataTree bodyTest
            should.exist tree.all.recipe.dessert.brownie
            tree.all.recipe.dessert.brownie.name.should.equal "Brownie"

        it "When I retrieve note from /notes/id", (done) ->
            client.get "notes/#{tree.all.recipe.dessert.brownie.id}/", \
                       (error, response, body) ->
                storeResponse error, response, body, done

        it "Then I have a note with right path", ->
            bodyTest.path.should.equal "/all/recipe/dessert/brownie"
            bodyTest.humanPath.split(",").join("/").should.equal "All/Recipe/Dessert/Brownie"



    describe "PUT /tree Update a node", ->

        it "When I change Recipes to Main Dishes", (done) ->
            data =
                path: "/all/recipe"
                newName: "Main Dishes"
                
            client.put "tree/", data, (error, response, body) ->
                storeResponse error, response, body, done
        
        it "And I retrieve tree from /tree", (done) ->
            client.get "tree/", (error, response, body) ->
                storeResponse error, response, body, done

        it "Then I have a tree that contains path /all/main-dishes", ->
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

        it "Then I got two notes", ->
            should.exist(bodyTest)
            should.exist(bodyTest.rows)
            bodyTest.rows.length.should.equal 3
            responseTest.statusCode.should.equal 200


     describe "DELETE /tree Delete given node", ->

        it "When I delete node /all/recipe/dessert", (done) ->
            client.del "tree/", path: "/all/main-dishes/dessert", (error, response, body) ->
                storeResponse error, response, body, done

        it "Then a 200 success response is returned", ->
            responseTest.statusCode.should.equal 200

        it "When I retrieve tree from /tree", (done) ->
            client.get "tree/", (error, response, body) ->
                storeResponse error, response, body, done

        it "Then I have a tree that contains only path /all/main-dishes", ->
            tree = new DataTree bodyTest
            should.exist tree.all.recipe
            should.not.exist tree.all.recipe.dessert

        it "When I send a request to get notes with dessert path", (done) ->
            client.post "notes/path", path: "/all/main-dishes/dessert", \
                        (error, response, body) ->
                storeResponse error, response, body, done

        it "Then I got no notes", ->
            should.exist(bodyTest)
            should.exist(bodyTest.rows)
            bodyTest.rows.length.should.equal 0
            responseTest.statusCode.should.equal 200


