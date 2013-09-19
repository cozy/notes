Task = require '../models/task'
Todolist = require '../models/todolist'

module.exports.fetch = (req, res, next, id) ->
    Task.find id, (err, task) ->
        return res.send error: err, 500 if err
        return res.send error: 'Task not found', 404 if not task

        req.task = task
        next()

module.exports.list = (req, res) ->
    Task.request 'all', (err, tasks) ->
        return res.send error: err, 500 if err
        res.send tasks

module.exports.create = (req, res) ->
    Todolist.getOrCreateInbox (err, inbox, next) ->
        data =
            list: inbox
            done: req.body.done
            description: req.body.description

        Task.create data, (err, task) ->
            return res.send error: err, 500 if err
            res.send task, 201

module.exports.read = (req, res) ->
    res.send req.task

module.exports.update = (req, res) ->
    updates =
        done: req.body.done
        description: req.body.description

    req.task.updateAttributes updates, (err, task) ->
        return res.send error: err, 500 if err

        res.send task, 200

module.exports.delete = (req, res) ->
    req.task.destroy (err) ->
        return res.send error: err, 500 if err

        res.send success: "Task destroyed", 204