should = require('should')
async = require('async')
client = require('./client')
app = require('../server')



## Helpers

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



before (done) ->
    Note.destroyAll done


describe "/notes", ->


    describe "POST /notes Create a note", ->
        it "When I send data for a note creation", (done) ->
            note =
                title: "Test note 01"
                content: "Test content 01"
                path: "/all/test-note-01"

            client.post "notes/", note, (error, response, body) ->
                storeResponse error, response, body, done

        it "Then a success is returned with a note with an id", ->
            should.exist bodyTest
            should.exist bodyTest.id
            responseTest.statusCode.should.equal 201


    describe "GET /notes/ Get all notes", ->
        it "When I send a request to retrieve all notes", (done) ->
            client.get "notes/", (error, response, body) ->
                storeResponse error, response, body, done

        it "Then I got expected note in a list", ->
            should.exist bodyTest
            bodyTest = JSON.parse bodyTest
            console.log bodyTest
            should.exist bodyTest.rows
            bodyTest.rows.length.should.equal 1
            bodyTest.rows[0].title.should.equal "Test note 01"
            responseTest.statusCode.should.equal 200


    describe "POST /notes/path Get all notes with given path", ->
        it "When I send a request to retrieve all notes", (done) ->
            client.post "notes/path", path: "/all/test-note-01", \
                        (error, response, body) ->
                storeResponse error, response, body, done

        it "Then I got expected note in a list", ->
            should.exist(bodyTest)
            should.exist(bodyTest.rows)
            bodyTest.rows.length.should.equal 1
            bodyTest.rows[0].title.should.equal "Test note 01"
            responseTest.statusCode.should.equal 200


    describe "GET /notes/:id Get a note", ->
        it "When I send a request to retrieve a given note", (done) ->
            client.get "notes/#{bodyTest.rows[0].id}", \
                      (error, response, body) ->
                storeResponse error, response, body, done

        it "Then I got expected note ", ->
            should.exist(bodyTest)
            bodyTest = JSON.parse bodyTest
            should.exist(bodyTest.title)
            bodyTest.title.should.equal "Test note 01"
            responseTest.statusCode.should.equal 200

  
     describe "PUT /notes/:id Update a note", ->
        note =
            title: "Test note 01 update"

        it "When I send a request to update a given note", (done) ->
            client.put "notes/#{bodyTest.id}", note, (error, response, body) ->
                handleResponse error, response, body, done

        it "And I send a request to retrieve a given note", (done) ->
            client.get "notes/#{bodyTest.id}", (error, response, body) ->
                storeResponse error, response, body, done

        it "Then I got expected note ", ->
            should.exist(bodyTest)
            bodyTest = JSON.parse bodyTest
            should.exist(bodyTest.title)
            bodyTest.title.should.equal "Test note 01 update"

          
    describe "DELETE /notes/:id Delete a note", ->

        it "When I send a request to delete a given note", (done) ->
            client.delete "notes/#{bodyTest.id}", (error, response, body) ->
                handleResponse error, response, body, done

        it "And I send a request to retrieve a given note", (done) ->
            client.get "notes/#{bodyTest.id}", (error, response, body) ->
                storeResponse error, response, body, done

        it "Then I got 404 error ", ->
            responseTest.statusCode.should.equal 404

