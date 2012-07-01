should = require('should')
async = require('async')
Client = require('../common/test/client').Client
app = require('../server')


client = new Client("http://localhost:8001/")

## Helpers

responseTest = null
bodyTest = null

describe "/notes", ->

    before (done) ->
        app.listen(8888)
        Note.destroyAll ->
            Tree.destroyAll done

    after (done) ->
        app.close()
        done()


    describe "POST /notes Creates a bunch of notes", ->
        it "When I send data for a note creation", (done) ->
            note =
                title: "Recipe"
                content: "Test content 01"
                path: "/all/recipe"

            client.post "notes/", note,
