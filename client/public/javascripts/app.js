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
  "views/widgets/tree": function(exports, require, module) {
    (function() {
  var slugify,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  slugify = require("helpers").slugify;

  exports.Tree = (function() {

    function Tree(navEl, data, callbacks) {
      this._convertData = __bind(this._convertData, this);
      var tree;
      this.setToolbar(navEl);
      tree = this._convertData(data);
      this.treeEl = $("#tree");
      this.widget = this.treeEl.jstree({
        plugins: ["themes", "json_data", "ui", "crrm", "unique", "sort"],
        json_data: tree,
        ui: {
          select_limit: 1,
          initially_select: ["tree-node-all"]
        },
        themes: {
          theme: "default",
          dots: false,
          icons: false
        },
        core: {
          animation: 0,
          initially_open: ["tree-node-all"]
        },
        unique: {
          error_callback: function(node, p, func) {
            return alert("A note has already that name: '" + node + "'");
          }
        }
      });
      this.setListeners(callbacks);
    }

    Tree.prototype.setToolbar = function(navEl) {
      return navEl.prepend(require('../templates/tree_buttons'));
    };

    Tree.prototype.setListeners = function(callbacks) {
      var _this = this;
      $("#tree-create").click(function() {
        return _this.treeEl.jstree("create");
      });
      $("#tree-rename").click(function() {
        return _this.treeEl.jstree("rename");
      });
      $("#tree-remove").click(function() {
        return _this.treeEl.jstree("remove");
      });
      this.widget.bind("create.jstree", function(e, data) {
        var path;
        path = _this._getPath(data);
        return callbacks.onCreate(path, data.rslt.name);
      });
      this.widget.bind("rename.jstree", function(e, data) {
        var path;
        path = _this._getPath(data, data.rslt.old_name);
        return callbacks.onRename(path, data.rslt.new_name);
      });
      this.widget.bind("remove.jstree", function(e, data) {
        var path;
        path = _this._getPath(data);
        return callbacks.onRemove(path);
      });
      return this.widget.bind("select_node.jstree", function(e, data) {
        var path;
        path = _this._getPath(data);
        return callbacks.onSelect(path, data.rslt.obj.data("id"));
      });
    };

    Tree.prototype._getPath = function(data, nodeName) {
      var name, nodes, parent;
      if (nodeName === void 0) nodeName = data.inst.get_text(data.rslt.obj);
      nodes = [slugify(nodeName)];
      parent = data.rslt.parent;
      if (parent === void 0) parent = data.inst._get_parent(data.rslt.obj);
      name = "all";
      while (name && parent !== void 0 && parent.children !== void 0) {
        name = parent.children("a:eq(0)").text();
        nodes.unshift(slugify(name));
        parent = parent.parent().parent();
      }
      return nodes.join("/");
    };

    Tree.prototype._convertData = function(data) {
      var tree;
      tree = {
        data: []
      };
      this._convertNode(tree, data);
      if (tree.data.length === 0) tree.data = "loading...";
      return tree;
    };

    Tree.prototype._convertNode = function(parentNode, nodeToConvert) {
      var newNode, property, _results;
      _results = [];
      for (property in nodeToConvert) {
        if (!(property !== "name" && property !== "id")) continue;
        newNode = {
          data: nodeToConvert[property].name,
          metadata: {
            id: nodeToConvert[property].id
          },
          children: []
        };
        if (parentNode.children === void 0) {
          parentNode.data.push(newNode);
        } else {
          parentNode.children.push(newNode);
        }
        _results.push(this._convertNode(newNode, nodeToConvert[property]));
      }
      return _results;
    };

    return Tree;

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
  "views/note_view": function(exports, require, module) {
    (function() {
  var template,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  template = require('./templates/note');

  exports.NoteWidget = (function(_super) {

    __extends(NoteWidget, _super);

    NoteWidget.prototype.className = "note-full";

    NoteWidget.prototype.tagName = "div";

    /* Constructor
    */

    function NoteWidget(model) {
      this.model = model;
      NoteWidget.__super__.constructor.call(this);
      this.id = this.model.slug;
      this.model.view = this;
    }

    NoteWidget.prototype.remove = function() {
      return $(this.el).remove();
    };

    /* configuration
    */

    NoteWidget.prototype.render = function() {
      $(this.el).html(template({
        note: this.model
      }));
      this.el.id = "note-" + this.model.id;
      return this.el;
    };

    return NoteWidget;

  })(Backbone.View);

}).call(this);

  }
}));
(this.require.define({
  "models/models": function(exports, require, module) {
    (function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  exports.BaseModel = (function(_super) {

    __extends(BaseModel, _super);

    function BaseModel() {
      BaseModel.__super__.constructor.apply(this, arguments);
    }

    BaseModel.prototype.isNew = function() {
      return this.id === void 0;
    };

    return BaseModel;

  })(Backbone.Model);

}).call(this);

  }
}));
(this.require.define({
  "models/note": function(exports, require, module) {
    (function() {
  var BaseModel,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  BaseModel = require("models/models").BaseModel;

  exports.Note = (function(_super) {

    __extends(Note, _super);

    Note.prototype.url = '/all/';

    function Note(note) {
      var property;
      Note.__super__.constructor.call(this);
      for (property in note) {
        this[property] = note[property];
      }
    }

    return Note;

  })(BaseModel);

}).call(this);

  }
}));
(this.require.define({
  "collections/notes": function(exports, require, module) {
    (function() {
  var Application,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Application = require("models/application").Application;

  exports.NotesCollection = (function(_super) {

    __extends(NotesCollection, _super);

    NotesCollection.prototype.model = Application;

    NotesCollection.prototype.url = 'notes/';

    function NotesCollection() {
      NotesCollection.__super__.constructor.call(this);
    }

    NotesCollection.prototype.parse = function(response) {
      return response.rows;
    };

    return NotesCollection;

  })(Backbone.Collection);

}).call(this);

  }
}));
(this.require.define({
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

  exports.slugify = function(string) {
    var _slugify_hyphenate_re, _slugify_strip_re;
    _slugify_strip_re = /[^\w\s-]/g;
    _slugify_hyphenate_re = /[-\s]+/g;
    string = string.replace(_slugify_strip_re, '').trim().toLowerCase();
    string = string.replace(_slugify_hyphenate_re, '-');
    return string;
  };

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
buf.push('><div');
buf.push(attrs({ 'id':('tree-create'), "class": ('button') }));
buf.push('><i');
buf.push(attrs({ "class": ('icon-plus') }));
buf.push('></i><span>create</span></div><div');
buf.push(attrs({ 'id':('tree-remove'), "class": ('button') }));
buf.push('><i');
buf.push(attrs({ "class": ('icon-remove') }));
buf.push('></i><span>delete</span></div><div');
buf.push(attrs({ 'id':('tree-rename'), "class": ('button') }));
buf.push('><i');
buf.push(attrs({ "class": ('icon-pencil') }));
buf.push('></i><span>rename</span></div><div');
buf.push(attrs({ "class": ('spacer') }));
buf.push('></div></div>');
}
return buf.join("");
};
  }
}));
(this.require.define({
  "views/templates/note": function(exports, require, module) {
    module.exports = function anonymous(locals, attrs, escape, rethrow) {
var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<h2>' + escape((interp = note.title) == null ? '' : interp) + '</h2><p>' + escape((interp = note.path) == null ? '' : interp) + '</p>');
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
buf.push(attrs({ 'id':('nav'), "class": ('ui-layout-west') }));
buf.push('><div');
buf.push(attrs({ 'id':('tree') }));
buf.push('></div></div><div');
buf.push(attrs({ 'id':('editor'), "class": ('ui-layout-center') }));
buf.push('></div>');
}
return buf.join("");
};
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
      $('#home-view').layout({
        size: "330",
        minSize: "320",
        resizable: true
      });
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
  var Note, NoteWidget, Tree,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Tree = require("./widgets/tree").Tree;

  NoteWidget = require("./note_view").NoteWidget;

  Note = require("../models/note").Note;

  exports.HomeView = (function(_super) {

    __extends(HomeView, _super);

    function HomeView() {
      this.selectFolder = __bind(this.selectFolder, this);
      this.deleteFolder = __bind(this.deleteFolder, this);
      this.renameFolder = __bind(this.renameFolder, this);
      this.createFolder = __bind(this.createFolder, this);
      HomeView.__super__.constructor.apply(this, arguments);
    }

    HomeView.prototype.id = 'home-view';

    HomeView.prototype.sendTreeRequest = function(type, data) {
      return $.ajax({
        type: type,
        url: "tree",
        data: data,
        error: function(data) {
          if (data && data.msg) {
            return alert(data.msg);
          } else {
            return alert("Server error occured.");
          }
        }
      });
    };

    HomeView.prototype.createFolder = function(path, name) {
      return this.sendTreeRequest("POST", {
        path: path,
        name: name
      });
    };

    HomeView.prototype.renameFolder = function(path, newName) {
      return this.sendTreeRequest("PUT", {
        path: path,
        newName: newName
      });
    };

    HomeView.prototype.deleteFolder = function(path) {
      return this.sendTreeRequest("DELETE", {
        path: path
      });
    };

    HomeView.prototype.selectFolder = function(path, id) {
      var _this = this;
      if (id != null) {
        return $.get("all/" + id, function(data) {
          var note;
          note = new Note(data);
          return _this.renderNote(note);
        });
      }
    };

    HomeView.prototype.renderNote = function(note) {
      var noteWidget;
      this.noteArea.html(null);
      noteWidget = new NoteWidget(note);
      return this.noteArea.append(noteWidget.render());
    };

    HomeView.prototype.render = function() {
      $(this.el).html(require('./templates/home'));
      return this;
    };

    HomeView.prototype.fetchData = function() {
      var _this = this;
      this.noteArea = $("#editor");
      return $.get("tree/", function(data) {
        return _this.tree = new Tree(_this.$("#nav"), data, {
          onCreate: _this.createFolder,
          onRename: _this.renameFolder,
          onRemove: _this.deleteFolder,
          onSelect: _this.selectFolder
        });
      });
    };

    return HomeView;

  })(Backbone.View);

}).call(this);

  }
}));
