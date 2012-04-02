load 'application'

before 'load note', ->
    Note.find params.id, (err, note) =>
        if err
            redirect path_to.notes
        else
            @note = note
            next()
, only: ['show', 'edit', 'update', 'destroy']


action 'new', ->
    @note = new Note
    @title = 'New note'
    render
        path: "../../"


action 'create', ->
    Note.create body.Note, (err, note) =>
        if err
            flash 'error', 'Note can not be created'
            @note = note
            @title = 'New note'
            render 'new',
                "../../"
        else
            flash 'info', 'Note created'
            redirect path_to.notes

action 'index', ->
    console.log "toto"
    Note.all (err, notes) =>
        @notes = notes
        @title = 'Notes index'
        render
            path: ""

action 'show', ->
    @title = 'Note show'
    render
        path: "../../"

action 'edit', ->
    @title = 'Note edit'
    render
        path: "../../"

action 'update', ->
    @note.updateAttributes body.Note, (err) =>
        if !err
            flash 'info', 'Note updated'
            redirect path_to.note(@note)
        else
            flash 'error', 'Note can not be updated'
            @title = 'Edit note details'
            render 'edit',
                path: "../../"

action 'destroy', ->
    @note.destroy (error) ->
        if error
            flash 'error', 'Can not destroy note'
        else
            flash 'info', 'Note successfully removed'
        send "'" + path_to.notes + "'"

