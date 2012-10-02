###
    For the test of array storage in mongo - 
    remove only when the corresponding test ... fails
    cf /cozy-note/test/array-storage_test.coffee
###


# Destroy all obj corresponding at given condition.
TestArrayObj.destroyAll = (callback) ->
    TestArrayObj.requestDestroy "all", callback

