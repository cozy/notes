(function() {
  var Browser, app, helpers, should;

  should = require("should");

  Browser = require("./browser").Browser;

  helpers = require("./helpers");

  app = require("../../server");

  describe("Quick Search", function() {
    before(function(done) {
      app.listen(8001);
      return helpers.init(done);
    });
    before(function(done) {
      var _this = this;
      this.browser = new Browser();
      return this.browser.visit("http://localhost:8001/", function() {
        _this.browser.evaluate("$('#tree-search-field').hide()");
        return done();
      });
    });
    after(function(done) {
      app.close();
      return Note.destroyAll(function() {
        return Tree.destroyAll(done);
      });
    });
    it("I expect that three notes are displayed inside tree", function() {
      should.exist(this.browser.query("#tree-node-all"));
      should.exist(this.browser.query("#tree-node-all-recipe"));
      should.exist(this.browser.query("#tree-node-all-recipe-dessert"));
      return should.exist(this.browser.query("#tree-node-all-todo"));
    });
    it("And that tree search is hidden", function() {
      return this.browser.isVisible("#tree-search-field").should.not.be.ok;
    });
    it("When I click on search button", function() {
      return this.browser.click("#tree-search");
    });
    it("Then search field is visible", function() {
      return this.browser.isVisible("#tree-search-field").should.be.ok;
    });
    it("When i fill search field with dessert", function() {
      this.browser.fill("#tree-search-field", "dessert");
      return this.browser.keyUp("#tree-search-field");
    });
    return it("Then dessert note is highlighted and displayed", function() {
      this.browser.isVisible("#tree-node-all-recipe-dessert").should.be.ok;
      return this.browser.hasClass("#tree-node-all-recipe-dessert a", "jstree-search");
    });
  });

}).call(this);
