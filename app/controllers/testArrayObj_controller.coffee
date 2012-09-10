

###

    Test of array storage in mongo - 
    remove only when the corresponding test ... fails
    cf /cozy-note/test/array-storage_test.coffee

###


action 'create', ->
    # console.log "==== testArrayObj_controller.coffee action : create"
    data = 
        title       : 'a test string'
        myArrayProp : [ 'va1', 'val2' ]

    TestArrayObj.create data, (err,testArrayObj) ->
        # console.log "testArrayObj created and testArrayObj.myArrayProp ="
        # console.log testArrayObj.myArrayProp
        send testArrayObj


action 'show', ->
    # console.log "==== testArrayObj_controller.coffee action : show"
    TestArrayObj.find params.id, (err, testArrayObj)->
        send testArrayObj, 200
