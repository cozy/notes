Alarm = require '../models/alarm'

module.exports.fetch = (req, res, next, id) ->
    Alarm.find id, (err, alarm) ->
        return res.send error: err, 500 if err
        return res.send error: 'Alarm not found', 404 if not alarm

        req.alarm = alarm
        next()

module.exports.list = (req, res) ->
    Alarm.request 'all', (err, alarms) ->
        return res.send error: err, 500 if err
        res.send alarms

module.exports.create = (req, res) ->
    delete req.body.id
    Alarm.create req.body, (err, alarm) ->
        return res.send error: err, 500 if err
        res.send alarm, 201

module.exports.read = (req, res) ->
    res.send req.alarm

module.exports.update = (req, res) ->
    req.alarm.updateAttributes req.body, (err, alarm) ->
        return res.send error: err, 500 if err

        res.send alarm, 200

module.exports.delete = (req, res) ->
    req.alarm.destroy (err) ->
        return res.send error: err, 500 if err

        res.send success: "Alarm destroyed", 204