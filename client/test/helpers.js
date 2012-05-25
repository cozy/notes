(function() {
  var async, client;

  async = require("async");

  client = require("../../test/client");

  exports.createDefaultNotes = function(callback) {
    async.series([
      function() {
        return client.post("tree/", {
          path: "/all",
          name: "Recipe"
        });
      }, function() {
        return client.post("tree/", {
          path: "/all",
          name: "Todo"
        });
      }, function() {
        return client.post("tree/", {
          path: "/all/recipe",
          name: "Dessert"
        });
      }
    ]);
    return callback();
  };

  exports.init = function(callback) {
    return Note.destroyAll(function() {
      return Tree.destroyAll(function() {
        return exports.createDefaultNotes(function() {
          return callback();
        });
      });
    });
  };

  exports.waits = function(done, time) {
    var func;
    func = function() {
      return done();
    };
    return setTimeout(func, time);
  };

}).call(this);
