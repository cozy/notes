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
    console.log "ALARM CREATE", req.body
    delete req.body.id
    console.log req.body.description
    Alarm.create req.body, (err, alarm) ->
        console.log "RESULT = ", alarm
        return res.send error: err, 500 if err
        res.send alarm

module.exports.read = (req, res) ->
    res.send req.alarm

module.exports.update = (req, res) ->
    console.log "ALARM UPDATE", req.body
    req.alarm.updateAttributes req.body, (err, alarm) ->
        return res.send error: err, 500 if err

        res.send alarm

module.exports.delete = (req, res) ->
    req.alarm.destroy (err) ->
        return res.send error: err, 500 if err

        res.send success: "Alarm destroyed", 204