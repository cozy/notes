(function(/*! Brunch !*/) {
  'use strict';

  if (!this.require) {
    var modules = {};
    var cache = {};
    var __hasProp = ({}).hasOwnProperty;

    var expand = function(root, name) {
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
    };

    var getFullPath = function(path, fromCache) {
      var store = fromCache ? cache : modules;
      var dirIndex;
      if (__hasProp.call(store, path)) return path;
      dirIndex = expand(path, './index');
      if (__hasProp.call(store, dirIndex)) return dirIndex;
    };
    
    var cacheModule = function(name, path, contentFn) {
      var module = {id: path, exports: {}};
      try {
        cache[path] = module.exports;
        contentFn(module.exports, function(name) {
          return require(name, dirname(path));
        }, module);
        cache[path] = module.exports;
      } catch (err) {
        delete cache[path];
        throw err;
      }
      return cache[path];
    };

    var require = function(name, root) {
      var path = expand(root, name);
      var fullPath;

      if (fullPath = getFullPath(path, true)) {
        return cache[fullPath];
      } else if (fullPath = getFullPath(path, false)) {
        return cacheModule(name, fullPath, modules[fullPath]);
      } else {
        throw new Error("Cannot find module '" + name + "'");
      }
    };

    var dirname = function(path) {
      return path.split('/').slice(0, -1).join('/');
    };

    this.require = function(name) {
      return require(name, '');
    };

    this.require.brunch = true;
    this.require.define = function(bundle) {
      for (var key in bundle) {
        if (__hasProp.call(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    };
  }
}).call(this);
(this.require.define({
  "collections/notes": function(exports, require, module) {
    (function() {
  var Note,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Note = require("models/notes").Note;

  exports.NotesCollection = (function(_super) {

    __extends(NotesCollection, _super);

    NotesCollection.prototype.model = Note;

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

  exports.getPathRegExp = function(path) {
    var slashReg;
    slashReg = new RegExp("/", "g");
    return "^" + (path.replace(slashReg, "\/"));
  };

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
      var _this = this;
      $(function() {
        _this.initialize();
        return Backbone.history.start();
      });
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
      return !(this.id != null);
    };

    return BaseModel;

  })(Backbone.Model);

}).call(this);

  }
}));
(this.require.define({
  "models/note": function(exports, require, module) {
    (function() {
  var BaseModel, request,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  BaseModel = require("models/models").BaseModel;

  request = function(type, url, data, callback) {
    return $.ajax({
      type: type,
      url: url,
      data: data,
      success: callback,
      error: function(data) {
        if (data && data.msg) {
          return alert(data.msg);
        } else {
          return alert("Server error occured.");
        }
      }
    });
  };

  exports.Note = (function(_super) {

    __extends(Note, _super);

    Note.prototype.url = 'notes/';

    function Note(note) {
      var property;
      Note.__super__.constructor.call(this);
      for (property in note) {
        this[property] = note[property];
      }
    }

    Note.prototype.saveContent = function(content) {
      this.content = content;
      this.url = "notes/" + this.id;
      return this.save({
        content: this.content
      });
    };

    Note.createNote = function(data, callback) {
      return request("POST", "tree", data, callback);
    };

    Note.updateNote = function(data, callback) {
      return request("PUT", "tree", data, callback);
    };

    Note.deleteNote = function(data, callback) {
      return request("PUT", "tree/path", data, callback);
    };

    Note.moveNote = function(data, callback) {
      return request("POST", "tree/path/move", data, callback);
    };

    Note.getNote = function(id, callback) {
      var _this = this;
      return $.get("notes/" + id, function(data) {
        var note;
        note = new Note(data);
        return callback(note);
      });
    };

    return Note;

  })(BaseModel);

}).call(this);

  }
}));
(this.require.define({
  "routers/main_router": function(exports, require, module) {
    (function() {
  var slugify,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  slugify = require("helpers").slugify;

  exports.MainRouter = (function(_super) {

    __extends(MainRouter, _super);

    function MainRouter() {
      MainRouter.__super__.constructor.apply(this, arguments);
    }

    MainRouter.prototype.routes = {
      '': 'home'
    };

    MainRouter.prototype.initialize = function() {
      return this.route(/^note\/(.*?)$/, 'note');
    };

    MainRouter.prototype.home = function(callback) {
      $('body').html(app.homeView.render().el);
      app.homeView.setLayout();
      return app.homeView.fetchData(callback);
    };

    MainRouter.prototype.note = function(path) {
      var selectNote;
      selectNote = function() {
        return app.homeView.selectNote(path);
      };
      if ($("#tree-create").length > 0) {
        return selectNote();
      } else {
        return this.home(function() {
          return setTimeout((function() {
            return selectNote();
          }), 100);
        });
      }
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
      this.onNoteDropped = __bind(this.onNoteDropped, this);
      this.onTreeLoaded = __bind(this.onTreeLoaded, this);
      this.onNoteChange = __bind(this.onNoteChange, this);
      this.selectFolder = __bind(this.selectFolder, this);
      this.deleteFolder = __bind(this.deleteFolder, this);
      this.renameFolder = __bind(this.renameFolder, this);
      this.createFolder = __bind(this.createFolder, this);
      HomeView.__super__.constructor.apply(this, arguments);
    }

    HomeView.prototype.id = 'home-view';

    HomeView.prototype.createFolder = function(path, newName, data) {
      var _this = this;
      return Note.createNote({
        path: path,
        name: newName
      }, function(note) {
        data.rslt.obj.data("id", note.id);
        data.inst.deselect_all();
        return data.inst.select_node(data.rslt.obj);
      });
    };

    HomeView.prototype.renameFolder = function(path, newName, data) {
      var _this = this;
      if (newName != null) {
        return Note.udpateNote({
          path: path,
          newName: newName
        }, function() {
          data.inst.deselect_all();
          return data.inst.select_node(data.rslt.obj);
        });
      }
    };

    HomeView.prototype.deleteFolder = function(path) {
      this.noteFull.hide();
      return Note.deleteNote({
        path: path
      });
    };

    HomeView.prototype.selectFolder = function(path, id) {
      var _this = this;
      if (path.indexOf("/")) path = "/" + path;
      app.router.navigate("note" + path, {
        trigger: false
      });
      if (id != null) {
        return Note.getNote(id, function(note) {
          _this.renderNote(note);
          return _this.noteFull.show();
        });
      } else {
        return this.noteFull.hide();
      }
    };

    HomeView.prototype.selectNote = function(path) {
      return this.tree.selectNode(path);
    };

    HomeView.prototype.renderNote = function(note) {
      var noteWidget;
      this.currentNote = note;
      noteWidget = new NoteWidget(this.currentNote);
      return noteWidget.render();
    };

    HomeView.prototype.onNoteChange = function(event) {
      return this.currentNote.saveContent($("#note-full-content").val());
    };

    HomeView.prototype.onTreeLoaded = function() {
      if (this.treeCreationCallback != null) return this.treeCreationCallback();
    };

    HomeView.prototype.onNoteDropped = function(newPath, oldPath, data) {
      var _this = this;
      if (oldPath.charAt(0) !== "/") oldPath = "/" + oldPath;
      return Note.moveNote({
        path: oldPath,
        dest: newPath
      }, function() {
        data.inst.deselect_all();
        return data.inst.select_node(data.rslt.o);
      });
    };

    HomeView.prototype.render = function() {
      $(this.el).html(require('./templates/home'));
      return this;
    };

    HomeView.prototype.setLayout = function() {
      return $('#home-view').layout({
        size: "310",
        minSize: "310",
        resizable: true
      });
    };

    HomeView.prototype.fetchData = function(callback) {
      var _this = this;
      this.treeCreationCallback = callback;
      this.noteArea = $("#editor");
      this.noteFull = $("#note-full");
      this.noteFull.hide();
      return $.get("tree/", function(data) {
        return _this.tree = new Tree(_this.$("#nav"), data, {
          onCreate: _this.createFolder,
          onRename: _this.renameFolder,
          onRemove: _this.deleteFolder,
          onSelect: _this.selectFolder,
          onLoaded: _this.onTreeLoaded,
          onDrop: _this.onNoteDropped
        });
      });
    };

    return HomeView;

  })(Backbone.View);

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
      $("#note-full-breadcrump").html(this.model.humanPath.split(",").join(" / "));
      $("#note-full-title").html(this.model.title);
      $("#note-full-content").val(this.model.content);
      return this.el;
    };

    NoteWidget.setEditor = function(changeCallback) {
      var editor;
      console.log("TODO: set editor");
      editor = $("textarea#note-full-content");
      return editor;
    };

    return NoteWidget;

  })(Backbone.View);

}).call(this);

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
buf.push('><div');
buf.push(attrs({ 'id':('note-full'), "class": ('note-full') }));
buf.push('><p');
buf.push(attrs({ 'id':('note-full-breadcrump') }));
buf.push('>/</p><h2');
buf.push(attrs({ 'id':('note-full-title') }));
buf.push('>no note selected</h2><textarea');
buf.push(attrs({ 'id':('note-full-content') }));
buf.push('></textarea></div></div>');
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
buf.push('<p>' + escape((interp = note.humanPath.split(",").join(" / ")) == null ? '' : interp) + '</p><h2>' + escape((interp = note.title) == null ? '' : interp) + '</h2><textarea');
buf.push(attrs({ 'id':('note-content') }));
buf.push('></textarea>');
}
return buf.join("");
};
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
  "views/widgets/tree": function(exports, require, module) {
    (function() {
  var slugify,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  slugify = require("helpers").slugify;

  exports.Tree = (function() {

    function Tree(navEl, data, callbacks) {
      this._convertData = __bind(this._convertData, this);
      this._getStringPath = __bind(this._getStringPath, this);
      var tree;
      this.setToolbar(navEl);
      tree = this._convertData(data);
      this.treeEl = $("#tree");
      this.widget = this.treeEl.jstree({
        plugins: ["themes", "json_data", "ui", "crrm", "unique", "sort", "cookies", "types", "hotkeys", "dnd"],
        json_data: tree,
        types: {
          "default": {
            valid_children: "default"
          },
          "root": {
            valid_children: null,
            delete_node: false,
            rename_node: false,
            move_node: false,
            start_drag: false
          }
        },
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
        var nodeName, parent, path;
        nodeName = data.inst.get_text(data.rslt.obj);
        parent = data.rslt.parent;
        path = _this._getPath(parent, nodeName);
        path.pop();
        return callbacks.onCreate(path.join("/"), data.rslt.name, data);
      });
      this.widget.bind("rename.jstree", function(e, data) {
        var nodeName, parent, path;
        nodeName = data.inst.get_text(data.rslt.obj);
        parent = data.inst._get_parent(data.rslt.parent);
        path = _this._getStringPath(parent, data.rslt.old_name);
        if (path === "all") {
          return $.jstree.rollback(data.rlbk);
        } else {
          return callbacks.onRename(path, data.rslt.new_name, data);
        }
      });
      this.widget.bind("remove.jstree", function(e, data) {
        var nodeName, parent, path;
        nodeName = data.inst.get_text(data.rslt.obj);
        parent = data.rslt.parent;
        path = _this._getStringPath(parent, nodeName);
        if (path === "all") {
          return $.jstree.rollback(data.rlbk);
        } else {
          return callbacks.onRemove(path);
        }
      });
      this.widget.bind("select_node.jstree", function(e, data) {
        var nodeName, parent, path;
        nodeName = data.inst.get_text(data.rslt.obj);
        parent = data.inst._get_parent(data.rslt.parent);
        path = _this._getStringPath(parent, nodeName);
        return callbacks.onSelect(path, data.rslt.obj.data("id"));
      });
      this.widget.bind("move_node.jstree", function(e, data) {
        var newPath, nodeName, oldParent, oldPath, parent;
        nodeName = data.inst.get_text(data.rslt.o);
        parent = data.inst._get_parent(data.rslt.o);
        newPath = _this._getPath(parent, nodeName);
        newPath.pop();
        oldParent = data.inst.get_text(data.rslt.op);
        parent = data.inst._get_parent(data.rslt.op);
        oldPath = _this._getPath(parent, oldParent);
        oldPath.push(slugify(nodeName));
        if (newPath.length === 0) {
          return $.jstree.rollback(data.rlbk);
        } else {
          return callbacks.onDrop(newPath.join("/"), oldPath.join("/"), data);
        }
      });
      return this.widget.bind("loaded.jstree", function(e, data) {
        return callbacks.onLoaded();
      });
    };

    Tree.prototype.selectNode = function(path) {
      var node, nodePath, tree;
      nodePath = path.replace(/\//g, "-");
      node = $("#tree-node-" + nodePath);
      tree = $("#tree").jstree("deselect_all", null);
      return tree = $("#tree").jstree("select_node", node);
    };

    Tree.prototype._getPath = function(parent, nodeName) {
      var name, nodes;
      if (nodeName != null) nodes = [slugify(nodeName)];
      name = "all";
      while (name && parent !== void 0 && parent.children !== void 0) {
        name = parent.children("a:eq(0)").text();
        nodes.unshift(slugify(name));
        parent = parent.parent().parent();
      }
      return nodes;
    };

    Tree.prototype._getStringPath = function(parent, nodeName) {
      return this._getPath(parent, nodeName).join("/");
    };

    Tree.prototype._convertData = function(data) {
      var tree;
      tree = {
        data: {
          data: "all",
          attr: {
            id: "tree-node-all",
            rel: "root"
          },
          children: []
        }
      };
      this._convertNode(tree.data, data.all, "-all");
      if (tree.data.length === 0) tree.data = "loading...";
      return tree;
    };

    Tree.prototype._convertNode = function(parentNode, nodeToConvert, idpath) {
      var newNode, nodeIdPath, property, _results;
      _results = [];
      for (property in nodeToConvert) {
        if (!(property !== "name" && property !== "id")) continue;
        nodeIdPath = "" + idpath + "-" + (property.replace(/_/g, "-"));
        newNode = {
          data: nodeToConvert[property].name,
          metadata: {
            id: nodeToConvert[property].id
          },
          attr: {
            id: "tree-node" + nodeIdPath,
            rel: "default"
          },
          children: []
        };
        if (parentNode.children === void 0) {
          parentNode.data.push(newNode);
        } else {
          parentNode.children.push(newNode);
        }
        _results.push(this._convertNode(newNode, nodeToConvert[property], nodeIdPath));
      }
      return _results;
    };

    return Tree;

  })();

}).call(this);

  }
}));
