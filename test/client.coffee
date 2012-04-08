request = require('request')

host = "http://localhost:8001/"

exports.get = (path, callback) ->
    request.get
        uri: host + path
        json: true
        , callback

exports.post = (path, json, callback) ->
    request
        method: "POST"
        uri: host + path
        json: json
        , callback

exports.put = (path, json, callback) ->
    request
        method: "PUT"
        uri: host + path
        json: json
        , callback

exports.del = (path, json, callback) ->
    request
        method: "DELETE"
        uri: host + path
        json: json
        , callback


