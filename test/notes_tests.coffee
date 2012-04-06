request = require('request')
should = require('should')
client = require('./client')


clearDb = (callback) ->
    console.log "clear"

initDb = (callback) ->
    console.log "init"


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

describe "/all", ->


    describe "POST /all Create a note", ->
        it "When I send data for a note creation", (done) ->
            note =
                title: "Test note 01"
                content: "Test content 01"

            client.post "all/", note, (error, response, body) ->
                storeResponse error, response, body, done

        it "Then a success is returned with a note with an id", ->
            should.exist(bodyTest)
            should.exist(bodyTest.id)
            responseTest.statusCode.should.equal 201


    describe "GET /all/ Get all notes", ->
        it "When I send a request to retrieve all notes", (done) ->
            client.get "all/", (error, response, body) ->
                storeResponse error, response, body, done

        it "Then I got expected note in a list", ->
            should.exist(bodyTest)
            should.exist(bodyTest.rows)
            bodyTest.rows.length.should.equal 1
            bodyTest.rows[0].title.should.equal "Test note 01"
            responseTest.statusCode.should.equal 200


    describe "GET /all/:id Get a note", ->
        it "When I send a request to retrieve a given note", (done) ->
            client.get "all/#{bodyTest.rows[0].id}", (error, response, body) ->
                storeResponse error, response, body, done

        it "Then I got expected note ", ->
            should.exist(bodyTest)
            should.exist(bodyTest.title)
            bodyTest.title.should.equal "Test note 01"
            responseTest.statusCode.should.equal 200

            
    describe "PUT /all/:id Update a note", ->
        note =
            title: "Test note 01 update"

        it "When I send a request to update a given note", (done) ->
            client.put "all/#{bodyTest.id}", note, (error, response, body) ->
                handleResponse error, response, body, done

        it "And I send a request to retrieve a given note", (done) ->
            client.get "all/#{bodyTest.id}", (error, response, body) ->
                storeResponse error, response, body, done

        it "Then I got expected note ", ->
            should.exist(bodyTest)
            should.exist(bodyTest.title)
            bodyTest.title.should.equal "Test note 01 update"

            
    describe "DELETE /all/:id Update a note", ->

        it "When I send a request to delete a given note", (done) ->
            client.del "all/#{bodyTest.id}", (error, response, body) ->
                handleResponse error, response, body, done

        it "And I send a request to retrieve a given note", (done) ->
            client.get "all/#{bodyTest.id}", (error, response, body) ->
                storeResponse error, response, body, done

        it "Then I got 404 error ", ->
            responseTest.statusCode.should.equal 404

