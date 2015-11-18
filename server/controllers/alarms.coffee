Alarm = require '../models/alarm'

module.exports.fetch = (req, res, next, id) ->
    Alarm.find id, (err, alarm) ->
        return res.status(500).send error: err if err
        return res.status(404).send error: 'Alarm not found' if not alarm

        req.alarm = alarm
        next()

module.exports.list = (req, res) ->
    Alarm.request 'all', (err, alarms) ->
        return res.status(500).send error: err if err
        res.send alarms

module.exports.create = (req, res) ->
    delete req.body.id
    Alarm.create req.body, (err, alarm) ->
        return res.status(500).send error: err if err
        res.status(201).send alarm

module.exports.read = (req, res) ->
    res.send req.alarm

module.exports.update = (req, res) ->
    req.alarm.updateAttributes req.body, (err, alarm) ->
        return res.status(500).send error: err if err

        res.status(200).send alarm

module.exports.delete = (req, res) ->
    req.alarm.destroy (err) ->
        return res.status(500).send error: err if err

        res.status(204).send success: "Alarm destroyed"
