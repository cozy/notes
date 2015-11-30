// Generated by CoffeeScript 1.10.0
var Alarm;

Alarm = require('../models/alarm');

module.exports.fetch = function(req, res, next, id) {
  return Alarm.find(id, function(err, alarm) {
    if (err) {
      return res.status(500).send({
        error: err
      });
    }
    if (!alarm) {
      return res.status(404).send({
        error: 'Alarm not found'
      });
    }
    req.alarm = alarm;
    return next();
  });
};

module.exports.list = function(req, res) {
  return Alarm.request('all', function(err, alarms) {
    if (err) {
      return res.status(500).send({
        error: err
      });
    }
    return res.send(alarms);
  });
};

module.exports.create = function(req, res) {
  delete req.body.id;
  return Alarm.create(req.body, function(err, alarm) {
    if (err) {
      return res.status(500).send({
        error: err
      });
    }
    return res.status(201).send(alarm);
  });
};

module.exports.read = function(req, res) {
  return res.send(req.alarm);
};

module.exports.update = function(req, res) {
  return req.alarm.updateAttributes(req.body, function(err, alarm) {
    if (err) {
      return res.status(500).send({
        error: err
      });
    }
    return res.status(200).send(alarm);
  });
};

module.exports["delete"] = function(req, res) {
  return req.alarm.destroy(function(err) {
    if (err) {
      return res.status(500).send({
        error: err
      });
    }
    return res.status(204).send({
      success: "Alarm destroyed"
    });
  });
};
