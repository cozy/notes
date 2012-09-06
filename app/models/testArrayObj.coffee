###
    For the test of array storage in mongo - 
    remove only when the corresponding test ... fails
    cf /cozy-note/test/array-storage_test.coffee
###

# Destroy all obj corresponding at given condition.
TestArrayObj.destroyAll = (callback) ->

    # Replace this with async lib call.
    wait = 0
    error = null

    done = (err) ->
        error = error || err
        if --wait == 0
            callback(error)
    
    TestArrayObj.all {}, (err, data) ->
        if err then return callback(err)
        if data.length == 0 then return callback(null)
        wait = data.length
        data.forEach (obj) ->
            obj.destroy done