requests = require "../../common/requests"

Note.defineRequest "all", requests.all, requests.checkError

allType = -> emit doc.type, doc
Tree.defineRequest "all", allType, requests.checkError
