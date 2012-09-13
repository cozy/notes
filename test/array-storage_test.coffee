should = require('should')
Client = require('request-json').JsonClient
app = require('../server')
helpers = require("./helpers")

client = new Client("http://localhost:8888/")


# uncomment to test this file alone
# before (done) ->
#     app.listen(8888)
#     helpers.cleanDb done
#     # done()

# after (done) ->
#     app.close()
#     done()

###
# 
###
describe "/test/arraystorage/", ->


    describe "Arrays are poorly stored in mongo through jugglingDb.\n
    The pb seems no to be du to mongoose but to jugglingDb, \n
    probably due to the versions of these librairie. \n
    The current code is a workaround (arrays are serialized)\n
    This tests checks whether the wrong behaviour remains.\n
    The day it will work, this test will ... fail :-)", ->
    
        it "should fail when it will work ! :-)", (done)->
            
            client.post "test/arraystorage/", {dummy:2}, (err, resp, body) ->
                
                # The create request returns to the client a correct object where myArrayProp is an array
                should.equal typeof body.myArrayProp, "object"
                should.exist body.myArrayProp.length
                
                client.get "test/arraystorage/#{body.id}", (err,resp,body)->
                    # but when the client wants to get back the object, the response is no longer an array
                    # will fail the day it works ! :-)
                    should.equal typeof body.myArrayProp, "string"   
                    done()