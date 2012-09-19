exports.checkError = (err) ->
    console.log "An error occured while creating request" if err

exports.all = -> emit doc._id, doc
