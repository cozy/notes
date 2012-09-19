###
    For the test of array storage in mongo - 
    remove only when the corresponding test ... fails
    cf /cozy-note/test/array-storage_test.coffee
###

helpers = require "../../lib/helpers"
TestArrayObj.defineRequest "all", helpers.all, helpers.checkError

# Destroy all obj corresponding at given condition.
TestArrayObj.destroyAll = (callback) ->
    TestArrayObj.requestDestroy "all", callback

