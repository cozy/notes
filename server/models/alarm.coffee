americano = require 'americano-cozy'

module.exports = Alarm = americano.getModel 'Alarm',
    action      : type: String, default: 'DISPLAY'
    trigg       : type: String
    description : type: String
    related     : type: String, default: null