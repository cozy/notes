request = require("lib/request")

# Model that describes a single task
module.exports = class Task extends Backbone.Model

    url: ->
      if @isNew() then "/apps/todos/todolists/#{Task.todolistId}/tasks"
      else "/apps/todos/todolists/#{Task.todolistId}/tasks/#{@id}"

    defaults: ->
        done:false
        nextTask:null       #needed ?
        previousTask:null   #needed ?

    parse: (data) -> if data.rows then data.rows[0] else data

    # Private static methods
    doNothing = ->
    isTodo = (app) -> app.name is 'todos'
    isFromNote = (todolist) -> todolist.title is 'from notes'


    todoIsInstalled = (callback) ->
        request.get '/api/applications', (err, apps) ->
            if not err and apps.rows.some isTodo
                callback(true)
            else
                callback(false)

    findInboxTodoList = (callback) ->
        request.get '/apps/todos/todolists', (err, lists) ->
            if err
                callback(null)
            else
                inboxList = _.find lists.rows, isFromNote
                callback(inboxList)

    createInboxTodoList = (callback) ->
        todolist = title:'from notes', parent_id:'tree-node-all'
        request.post '/apps/todos/todolists', todolist, (err, inboxList) ->
            if err
                callback(null)
            else
                callback(inboxList)


    # Static methods
    @initialize = (callback=doNothing) ->
        todoIsInstalled (installed) ->
            if not installed
                callback(Task.canBeUsed = false)
            else
                findInboxTodoList (list) ->
                    if list
                        Task.todolistId = list.id
                        callback(Task.canBeUsed = true)
                    else
                        createInboxTodoList (list) ->
                            if list
                                Task.todolistId = list.id
                                callback(Task.canBeUsed = true)
                            else
                                callback(Task.canBeUsed = false)
