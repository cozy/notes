should = require('should')
Client = require('request-json').JsonClient
app = require('../server')
helpers = require("./helpers")

client = new Client("http://localhost:8888/")


###
# 
###
describe "/test/arraystorage/", ->

    before (done) ->
        app.listen(8888)
        helpers.cleanDb done
        done()

    after (done) ->
        app.close()
        done()

    describe "Arrays are poorly stored in mongo through jugglingDb.\n
    The pb seems no to be du to mongoose but to jugglingDb, \n
    probably due to the versions of these librairie. \n
    The current code is a workaround (arrays are serialized)\n
    This tests checks whether the wrong behaviour remains.\n
    The day it will work, this test will ... fail :-)", ->
    
        it "should fail when it will work ! :-)", (done)->
            
            client.post "test/arraystorage/", {dummy:2}, (err, resp, body) ->
                
                console.log "The create request returns to the client a correct object : body.myArrayProp ="
                console.log body
                
                client.get "test/arraystorage/#{body.id}", (err,resp,body)->
                    
                    testArrayObj = JSON.parse(body)
                    
                    console.log 'but when the client wants to get back the object, the response is no longer an array'
                    console.log testArrayObj
                    console.log typeof testArrayObj.myArrayProp
                    
                    # will fail the day it works ! :-)
                    should.equal typeof testArrayObj.myArrayProp, "string" 
                    
                    done()
            done()