module.exports = (compound) ->
    requests = require "../../common/requests"

    {Note} = compound.models

    Note.defineRequest "all", requests.all, requests.checkError

    lastModifMap = -> emit doc.lastModificationValueOf, doc
    Note.defineRequest "lastmodified", lastModifMap, requests.checkError

    pathRequest = -> emit doc.path, doc
    Note.defineRequest "path", pathRequest, requests.checkError

    treeRequest = -> emit doc.parent_id, doc.title
    Note.defineRequest "tree", treeRequest, requests.checkError

    Note.request 'all', (err, notes) ->
        console.log err if err

        for note in notes

            Note.patchPath note, (err) =>
                console.log err if err
