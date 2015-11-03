Contact = require '../models/contact'

module.exports.fetch = (req, res, next, id) ->
    Contact.find id, (err, contact) ->
        return res.status(500).send error: err if err
        return res.status(404).send error: 'Contact not found' if not contact

        req.contact = contact
        next()

module.exports.list = (req, res) ->
    Contact.request 'all', (err, contacts) ->
        return res.status(500).send error: err if err
        res.send contacts

module.exports.read = (req, res) ->
    res.send req.contact
