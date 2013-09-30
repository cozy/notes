americano = require 'americano-cozy'

module.exports = Contact = americano.getModel 'Contact',
    fn            : String
    datapoints    : [Object]