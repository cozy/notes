checkError = (err) ->
    if err
        console.log "An error occured while creating request"

all = -> emit doc._id, doc
User.defineRequest "all", all, checkError
Notes.defineRequest "all", all, checkError
TestArrayObj.defineRequest "all", all, checkError

allType = -> emit doc.type, doc
Tree.defineRequest "all", allType, checkError
