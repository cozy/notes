(function(/*! Brunch !*/) {
  if (!this.require) {
    var modules = {}, cache = {}, require = function(name, root) {
      var module = cache[name], path = expand(root, name), fn;
      if (module) {
        return module;
      } else if (fn = modules[path] || modules[path = expand(path, './index')]) {
        module = {id: name, exports: {}};
        try {
          cache[name] = module.exports;
          fn(module.exports, function(name) {
            return require(name, dirname(path));
          }, module);
          return cache[name] = module.exports;
        } catch (err) {
          delete cache[name];
          throw err;
        }
      } else {
        throw 'module \'' + name + '\' not found';
      }
    }, expand = function(root, name) {
      var results = [], parts, part;
      if (/^\.\.?(\/|$)/.test(name)) {
        parts = [root, name].join('/').split('/');
      } else {
        parts = name.split('/');
      }
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part == '..') {
          results.pop();
        } else if (part != '.' && part != '') {
          results.push(part);
        }
      }
      return results.join('/');
    }, dirname = function(path) {
      return path.split('/').slice(0, -1).join('/');
    };
    this.require = function(name) {
      return require(name, '');
    };
    this.require.brunch = true;
    this.require.define = function(bundle) {
      for (var key in bundle)
        modules[key] = bundle[key];
    };
  }
}).call(this);(this.require.define({
  "helpers": function(exports, require, module) {
    (function() {

  exports.BrunchApplication = (function() {

    function BrunchApplication() {
      var _this = this;
      $(function() {
        _this.initialize(_this);
        return Backbone.history.start();
      });
    }

    BrunchApplication.prototype.initialize = function() {
      return null;
    };

    return BrunchApplication;

  })();

}).call(this);

  }
}));
(this.require.define({
  "initialize": function(exports, require, module) {
    (function() {
  var BrunchApplication, HomeView, MainRouter,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  BrunchApplication = require('helpers').BrunchApplication;

  MainRouter = require('routers/main_router').MainRouter;

  HomeView = require('views/home_view').HomeView;

  exports.Application = (function(_super) {

    __extends(Application, _super);

    function Application() {
      Application.__super__.constructor.apply(this, arguments);
    }

    Application.prototype.initialize = function() {
      this.router = new MainRouter;
      return this.homeView = new HomeView;
    };

    return Application;

  })(BrunchApplication);

  window.app = new exports.Application;

}).call(this);

  }
}));
(this.require.define({
  "routers/main_router": function(exports, require, module) {
    (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.MainRouter = (function(_super) {

    __extends(MainRouter, _super);

    function MainRouter() {
      MainRouter.__super__.constructor.apply(this, arguments);
    }

    MainRouter.prototype.routes = {
      '': 'home'
    };

    MainRouter.prototype.home = function() {
      $('body').html(app.homeView.render().el);
      return app.homeView.fetchData();
    };

    return MainRouter;

  })(Backbone.Router);

}).call(this);

  }
}));
(this.require.define({
  "views/home_view": function(exports, require, module) {
    (function() {
  var Tree,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Tree = require("./widgets/tree").Tree;

  exports.HomeView = (function(_super) {

    __extends(HomeView, _super);

    function HomeView() {
      HomeView.__super__.constructor.apply(this, arguments);
    }

    HomeView.prototype.id = 'home-view';

    HomeView.prototype.render = function() {
      $(this.el).html(require('./templates/home'));
      return this;
    };

    HomeView.prototype.createFolder = function(path) {
      return $.ajax({
        type: "POST",
        url: "tree",
        data: {
          path: path
        },
        error: function(data) {
          if (data && data.msg) {
            return alert(data.msg);
          } else {
            return alert("Server error occured.");
          }
        }
      });
    };

    HomeView.prototype.fetchData = function() {
      var _this = this;
      return $.get("tree/", function(data) {
        return _this.tree = new Tree(_this.$("#nav"), data, {
          onCreate: _this.createFolder,
          onRename: _this.createFolder,
          onRemove: _this.createFolder
        });
      });
    };

    return HomeView;

  })(Backbone.View);

}).call(this);

  }
}));
(this.require.define({
  "views/widgets/tree": function(exports, require, module) {
    (function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  exports.Tree = (function() {

    function Tree(treeElement, data, callbacks) {
      this.convertData = __bind(this.convertData, this);
      var tree,
        _this = this;
      treeElement.prepend(require('../templates/tree_buttons'));
      tree = this.convertData(data);
      this.treeEl = $("#tree");
      this.t = this.treeEl.jstree({
        plugins: ["themes", "json_data", "ui", "crrm", "dnd"],
        json_data: tree,
        themes: {
          theme: "default",
          dots: false,
          icons: false
        },
        core: {
          animation: 0
        }
      });
      this.t.bind("create.jstree", function(e, data) {
        var path;
        path = _this._getPath(data);
        return callbacks.onCreate(path);
      });
      this.t.bind("rename.jstree", function(e, data) {
        var path;
        path = _this._getPath(data);
        return callbacks.onRename(path);
      });
      this.t.bind("remove.jstree", function(e, data) {
        var path;
        path = _this._getPath(data);
        return callbacks.onRemove(path);
      });
      this.setListeners();
    }

    Tree.prototype.setListeners = function() {
      var _this = this;
      $("#tree-create").click(function() {
        return _this.treeEl.jstree("create");
      });
      $("#tree-rename").click(function() {
        return _this.treeEl.jstree("rename");
      });
      return $("#tree-remove").click(function() {
        return _this.treeEl.jstree("remove");
      });
    };

    Tree.prototype._getPath = function(data) {
      var i, name, nodes, parent;
      nodes = [this.slugify(data.rslt.name)];
      parent = data.inst._get_parent(data.rslt.obj);
      if (parent !== void 0 && parent.children !== void 0) {
        name = parent.children("a:eq(0)").text();
        nodes.unshift(this.slugify(name));
        i = 0;
        while (name && parent.parent() !== void 0 && parent.parent().parent() !== void 0 && i < 10) {
          parent = parent.parent().parent();
          i++;
          if (parent !== void 0 && parent.children !== void 0) {
            name = parent.children("a:eq(0)").text();
            nodes.unshift(this.slugify(name));
          }
        }
      }
      if (nodes.length > 1) {
        return nodes.join("/");
      } else {
        return "/" + (nodes.join("/"));
      }
    };

    Tree.prototype.convertData = function(data) {
      var tree;
      tree = {
        data: []
      };
      this.convertNode(tree, data);
      if (tree.data.length === 0) tree.data = "loading...";
      return tree;
    };

    Tree.prototype.convertNode = function(parentNode, node) {
      var newNode, property, _results;
      _results = [];
      for (property in node) {
        newNode = {
          data: property,
          children: []
        };
        if (parentNode.children === void 0) {
          parentNode.data.push(newNode);
        } else {
          parentNode.children.push(newNode);
        }
        _results.push(this.convertNode(newNode, node[property]));
      }
      return _results;
    };

    Tree.prototype.slugify = function(s) {
      var _slugify_hyphenate_re, _slugify_strip_re;
      _slugify_strip_re = /[^\w\s-]/g;
      _slugify_hyphenate_re = /[-\s]+/g;
      s = s.replace(_slugify_strip_re, '').trim().toLowerCase();
      s = s.replace(_slugify_hyphenate_re, '-');
      return s;
    };

    return Tree;

  })();

}).call(this);

  }
}));
(this.require.define({
  "views/templates/tree_buttons": function(exports, require, module) {
    module.exports = function anonymous(locals, attrs, escape, rethrow) {
var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div');
buf.push(attrs({ 'id':('tree-buttons') }));
buf.push('><button');
buf.push(attrs({ 'id':('tree-create') }));
buf.push('>Create</button><button');
buf.push(attrs({ 'id':('tree-remove') }));
buf.push('>Delete</button><button');
buf.push(attrs({ 'id':('tree-rename') }));
buf.push('>Rename</button></div><div');
buf.push(attrs({ 'id':('tree') }));
buf.push('></div>');
}
return buf.join("");
};
  }
}));
(this.require.define({
  "views/templates/home": function(exports, require, module) {
    module.exports = function anonymous(locals, attrs, escape, rethrow) {
var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div');
buf.push(attrs({ 'id':('content') }));
buf.push('><div');
buf.push(attrs({ 'id':('nav') }));
buf.push('><div');
buf.push(attrs({ 'id':('tree') }));
buf.push('></div></div><div');
buf.push(attrs({ 'id':('editor') }));
buf.push('>editor</div></div>');
}
return buf.join("");
};
  }
}));
