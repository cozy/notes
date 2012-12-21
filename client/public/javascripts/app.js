(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    definition(module.exports, localRequire(name), module);
    var exports = cache[name] = module.exports;
    return exports;
  };

  var require = function(name) {
    var path = expand(name, '.');

    if (has(cache, path)) return cache[path];
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex];
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '"');
  };

  var define = function(bundle) {
    for (var key in bundle) {
      if (has(bundle, key)) {
        modules[key] = bundle[key];
      }
    }
  }

  globals.require = require;
  globals.require.define = define;
  globals.require.brunch = true;
})();

window.require.define({"collections/notes": function(exports, require, module) {
  var Note,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

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
  
}});

window.require.define({"helpers": function(exports, require, module) {
  
  exports.BrunchApplication = (function() {

    function BrunchApplication() {
      var _this = this;
      $(function() {
        _this.initialize(_this);
        return Backbone.history.start();
      });
    }

    BrunchApplication.prototype.initializeJQueryExtensions = function() {
      return $.fn.spin = function(opts, color) {
        var presets;
        presets = {
          tiny: {
            lines: 8,
            length: 2,
            width: 1,
            radius: 3
          },
          small: {
            lines: 10,
            length: 2,
            width: 3,
            radius: 5
          },
          large: {
            lines: 10,
            length: 8,
            width: 4,
            radius: 8
          }
        };
        if (Spinner) {
          return this.each(function() {
            var $this, spinner;
            $this = $(this);
            spinner = $this.data("spinner");
            if (spinner != null) {
              spinner.stop();
              return $this.data("spinner", null);
            } else if (opts !== false) {
              if (typeof opts === "string") {
                if (opts in presets) {
                  opts = presets[opts];
                } else {
                  opts = {};
                }
                if (color) {
                  opts.color = color;
                }
              }
              spinner = new Spinner($.extend({
                color: $this.css("color")
              }, opts));
              spinner.spin(this);
              return $this.data("spinner", spinner);
            }
          });
        } else {
          throw "Spinner class not available.";
          return null;
        }
      };
    };

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
  
}});

window.require.define({"initialize": function(exports, require, module) {
  var BrunchApplication, HomeView, MainRouter,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BrunchApplication = require('helpers').BrunchApplication;

  MainRouter = require('routers/main_router').MainRouter;

  HomeView = require('views/home_view').HomeView;

  exports.Application = (function(_super) {

    __extends(Application, _super);

    function Application() {
      return Application.__super__.constructor.apply(this, arguments);
    }

    Application.prototype.initialize = function() {
      this.initializeJQueryExtensions();
      this.homeView = new HomeView;
      this.homeView.render();
      return this.router = new MainRouter;
    };

    return Application;

  })(BrunchApplication);

  window.app = new exports.Application;
  
}});

window.require.define({"lib/request": function(exports, require, module) {
  
  exports.request = function(type, url, data, callback) {
    return $.ajax({
      type: type,
      url: url,
      data: data,
      success: function(data) {
        if (callback != null) {
          return callback(null, data);
        }
      },
      error: function() {
        if ((data.msg != null) && (callback != null)) {
          return callback(new Error(data.msg));
        } else if (callback != null) {
          return callback(new Error("Server error occured"));
        }
      }
    });
  };

  exports.get = function(url, callbacks) {
    return exports.request("GET", url, null, callbacks);
  };

  exports.post = function(url, data, callbacks) {
    return exports.request("POST", url, data, callbacks);
  };

  exports.put = function(url, data, callbacks) {
    return exports.request("PUT", url, data, callbacks);
  };

  exports.del = function(url, callbacks) {
    return exports.request("DELETE", url, null, callbacks);
  };
  
}});

window.require.define({"models/models": function(exports, require, module) {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  exports.BaseModel = (function(_super) {

    __extends(BaseModel, _super);

    function BaseModel() {
      return BaseModel.__super__.constructor.apply(this, arguments);
    }

    BaseModel.prototype.isNew = function() {
      return !(this.id != null);
    };

    return BaseModel;

  })(Backbone.Model);
  
}});

window.require.define({"models/note": function(exports, require, module) {
  var BaseModel, request,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  BaseModel = require("models/models").BaseModel;

  request = require("lib/request");

  exports.Note = (function(_super) {

    __extends(Note, _super);

    Note.prototype.rootUrl = 'notes/';

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
      return request.post("notes", data, callback);
    };

    Note.updateNote = function(id, data, callback) {
      return request.put("notes/" + id, data, callback);
    };

    Note.deleteNote = function(id, callback) {
      return request.del("DELETE", "notes/" + id, callback);
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
  
}});

window.require.define({"routers/main_router": function(exports, require, module) {
  var slugify,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  slugify = require("helpers").slugify;

  exports.MainRouter = (function(_super) {

    __extends(MainRouter, _super);

    function MainRouter() {
      return MainRouter.__super__.constructor.apply(this, arguments);
    }

    /**
    Routes:
    
      * '': home: initialize the app
      * '#note/{note_uuid : 25 char}/slugyPath' : unique url corresponding 
        to a note where note_uuid is the note id and slugyPath the slugified 
        path of a note constituted with the name of its parents.
    */


    MainRouter.prototype.routes = {
      '': 'home',
      'note/all': 'allNotes'
    };

    MainRouter.prototype.initialize = function() {
      return this.route(/^note\/(.*?)\/(.*?)$/, 'note');
    };

    MainRouter.prototype.home = function() {
      this.navigate("note/all", {
        trigger: false
      });
      return this._initializeTree("tree-node-all");
    };

    MainRouter.prototype.note = function(note_uuid, path) {
      if ($("#tree").length > 0) {
        return app.homeView.selectNote(note_uuid);
      } else {
        return this._initializeTree(note_uuid);
      }
    };

    MainRouter.prototype.allNotes = function() {
      if ($('#tree').length > 0) {
        return app.homeView.selectNote("tree-node-all");
      } else {
        return this._initializeTree("tree-node-all");
      }
    };

    MainRouter.prototype._initializeTree = function(note_uuid) {
      $('body').append(app.homeView.el);
      return app.homeView.initContent(note_uuid);
    };

    return MainRouter;

  })(Backbone.Router);
  
}});

window.require.define({"views/home_view": function(exports, require, module) {
  var Note, NoteView, Tree,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  Tree = require("./widgets/tree").Tree;

  NoteView = require("./note_view").NoteView;

  Note = require("../models/note").Note;

  /**
  # Main view that manages interaction between toolprogressBar, navigation and notes
      id : ='home-view'
      @treeCreationCallback 
      @noteFull
      @tree
      @noteView
      @treeLoaded
      @iframeLoaded
  */


  exports.HomeView = (function(_super) {

    __extends(HomeView, _super);

    function HomeView() {
      this.renderNote = __bind(this.renderNote, this);

      this.selectNote = __bind(this.selectNote, this);

      this.onTreeSelectionChg = __bind(this.onTreeSelectionChg, this);

      this.onTreeRemove = __bind(this.onTreeRemove, this);

      this.onNoteTitleChange = __bind(this.onNoteTitleChange, this);

      this.onTreeRename = __bind(this.onTreeRename, this);

      this.onTreeLoaded = __bind(this.onTreeLoaded, this);

      this.onIFrameLoaded = __bind(this.onIFrameLoaded, this);
      return HomeView.__super__.constructor.apply(this, arguments);
    }

    HomeView.prototype.id = 'home-view';

    /**
    # Load the home view and the tree
    # Called once by the main_router
    */


    HomeView.prototype.initContent = function(note_uuid) {
      this.note_uuid = note_uuid;
      this.progressBar = $(".bar");
      this.iframeLoaded = false;
      this.treeLoaded = false;
      this.buildViews();
      this.configureLayoutDrag();
      this.setProgressBar();
      this.loadTree();
      this.configureResize();
      return this.configureSaving();
    };

    HomeView.prototype.buildViews = function() {
      this.$el.html(require('./templates/home'));
      this.noteView = new NoteView(this, this.onIFrameLoaded);
      this.noteFull = this.$("#note-full");
      this.noteFull.hide();
      this.$("#help-info").hide();
      return this.$el.layout({
        size: "250",
        minSize: "250",
        resizable: true,
        spacing_open: 10,
        spacing_closed: 10,
        togglerLength_closed: "100%",
        onresize_end: function() {
          return drag.css("z-index", "-1");
        }
      });
    };

    HomeView.prototype.loadTree = function() {
      var _this = this;
      return $.get("tree/", function(data) {
        window.tree = data;
        _this.tree = new Tree(_this.$("#nav"), data, {
          onCreate: _this.onCreateFolder,
          onRename: _this.onTreeRename,
          onRemove: _this.onTreeRemove,
          onSelect: _this.onTreeSelectionChg,
          onLoaded: _this.onTreeLoaded,
          onDrop: _this.onNoteDropped
        });
        return $("#create-note").click(function() {
          return _this.tree.widget.jstree("create", "#tree-node-all", "first", "A New Note");
        });
      });
    };

    HomeView.prototype.configureLayoutDrag = function() {
      var drag;
      drag = $("#drag");
      return $(".ui-layout-resizer").bind('mousedown', function(e) {
        return drag.css("z-index", "1");
      });
    };

    HomeView.prototype.configureResize = function() {
      this.onWindowResized();
      return $(window).resize(this.onWindowResized);
    };

    HomeView.prototype.configureSaving = function() {
      var _this = this;
      return $(window).unload(function() {
        return _this.noteView.saveEditorContent();
      });
    };

    HomeView.prototype.setProgressBar = function() {
      var progressBarLeftPosition, progressBarTopPosition;
      this.$(".ui-layout-center").append("<div class='progress progress-striped active'>                <div class='bar' style='width: 0%;'></div>            </div>");
      this.progress = this.$el.find(".progress");
      progressBarLeftPosition = this.$(".ui-layout-center").width() / 3 - 77;
      progressBarTopPosition = this.$(".ui-layout-center").height() / 2;
      this.progress.css("left", progressBarLeftPosition);
      return this.progress.css("top", progressBarTopPosition);
    };

    /* Listeners
    */


    HomeView.prototype.onIFrameLoaded = function() {
      var cssLink;
      this.progressBar.css("width", "10%");
      this.iframeLoaded = true;
      if (this.treeLoaded) {
        this.selectNote(note_uuid);
      }
      this.iframe = $("iframe");
      cssLink = document.createElement("link");
      cssLink.href = "stylesheets/app.css";
      cssLink.rel = "stylesheet";
      cssLink.type = "text/css";
      return console.log(this.iframe.get());
    };

    HomeView.prototype.onTreeLoaded = function() {
      this.progressBar.css("width", "30%");
      this.treeLoaded = true;
      if (this.iframeLoaded) {
        return this.selectNote(this.note_uuid);
      }
    };

    HomeView.prototype.onWindowResized = function() {
      var windowHeight;
      windowHeight = $(window).height();
      $("#note-style").height(windowHeight - 160);
      return $("#editor").height(windowHeight - 260);
    };

    /**
    Create a new folder.
    Params :
        fullPath : path of the folder
        newName : name of the folder
    */


    HomeView.prototype.onCreateFolder = function(parentId, newName, data) {
      return Note.createNote({
        title: newName,
        parent_id: parentId
      }, function(err, note) {
        if (err) {
          return alert("Server error occured.");
        } else {
          data.rslt.obj.data("id", note.id);
          data.rslt.obj.prop("id", note.id);
          data.inst.deselect_all();
          return data.inst.select_node(data.rslt.obj);
        }
      });
    };

    /**
    # Only called by jsTree event "rename.jstree" trigered when a node
    # is renamed.
    # May be called by another note than the currently selected node.
    */


    HomeView.prototype.onTreeRename = function(uuid, newName) {
      if (newName != null) {
        if (this.tree.currentNote_uuid === uuid) {
          this.noteView.setTitle(newName);
          this.noteView.updateBreadcrumbOnTitleChange(newName);
        }
        return Note.updateNote(uuid, {
          title: newName
        }, function(err) {
          if (err) {
            return alert("Server error occured");
          }
        });
      }
    };

    /**
    # When note title is changed, the changement is send to backend for
    # persistence.
    */


    HomeView.prototype.onNoteTitleChange = function(uuid, newName) {
      if (newName != null) {
        this.tree.jstreeEl.jstree("rename_node", "#" + uuid, newName);
        return Note.updateNote(uuid, {
          title: newName
        }, function(err) {
          if (err) {
            return alert("Server error occured");
          }
        });
      }
    };

    /**
    # Only called by jsTree event "select_node.jstree"
    # Delete currently selected node.
    */


    HomeView.prototype.onTreeRemove = function(note_uuid) {
      if (this.currentNote && this.currentNote.id === note_uuid) {
        return this.currentNote.destroy();
      } else {
        return Note.deleteNote(note_uuid, function(err) {
          if (err) {
            return alert("Server error occured");
          }
        });
      }
    };

    /**
    # Only called by jsTree event "select_node"
    # When a node is selected, the note_view is displayed and filled with
    # note data.
    */


    HomeView.prototype.onTreeSelectionChg = function(path, id, data) {
      var _this = this;
      this.noteView.saveEditorContent();
      if (id === void 0) {
        this.progress.remove();
      } else {
        this.progressBar.css("width", "70%");
      }
      if (path.indexOf("/")) {
        path = "/" + path;
      }
      app.router.navigate("note" + path, {
        trigger: false
      });
      if (id != null) {
        if (id === "tree-node-all") {
          this.progress.remove();
          this.noteFull.hide();
          return this.$("#help-info").show();
        } else {
          this.$("#help-info").hide();
          return Note.getNote(id, function(note) {
            _this.renderNote(note, data);
            return _this.noteFull.show();
          });
        }
      } else {
        this.progress.remove();
        this.$("#help-info").show();
        return this.noteFull.hide();
      }
    };

    /**
    # Force selection inside tree of note of a given uuid.
    */


    HomeView.prototype.selectNote = function(note_uuid) {
      this.progressBar.css("width", "40%");
      if (!(note_uuid === "all" || note_uuid === 'tree-node-all')) {
        return this.tree.selectNode(note_uuid);
      } else {
        this.$("#help-info").show();
        return this.noteFull.hide();
      }
    };

    /**
    # Fill note widget with note data.
    */


    HomeView.prototype.renderNote = function(note, data) {
      this.progressBar.css("width", "90%");
      note.url = "notes/" + note.id;
      this.currentNote = note;
      this.noteView.setModel(note, data);
      return this.progress.remove();
    };

    /**
    # When note is dropped, its old path and its new path are sent to server
    # for persistence.
    */


    HomeView.prototype.onNoteDropped = function(nodeId, targetNodeId) {
      return Note.updateNote(nodeId, {
        parent_id: targetNodeId
      }, function() {});
    };

    return HomeView;

  })(Backbone.View);
  
}});

window.require.define({"views/note_view": function(exports, require, module) {
  var FileList, Note, TreeInst, helpers, template,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  template = require('./templates/note');

  Note = require('../models/note').Note;

  TreeInst = require('./widgets/tree');

  FileList = require('./widgets/file_list').FileList;

  helpers = require('../helpers');

  exports.NoteView = (function(_super) {

    __extends(NoteView, _super);

    NoteView.prototype.className = "note-full";

    NoteView.prototype.id = "note-full";

    NoteView.prototype.tagName = "div";

    /* Constructor
    */


    NoteView.prototype.remove = function() {
      return this.$el.remove();
    };

    function NoteView(homeView, onIFrameLoaded) {
      this.homeView = homeView;
      this.onIFrameLoaded = onIFrameLoaded;
      this.saveEditorContent = __bind(this.saveEditorContent, this);

      NoteView.__super__.constructor.call(this);
      this.$el = $("#note-full");
      this.$("#editor").html(require('./templates/editor'));
      this.saveTimer = null;
      this.saveButton = this.$('#save-editor-content');
      this.noteFullTitle = this.$('#note-full-title');
      this.breadcrumb = this.$('#note-full-breadcrumb');
      this.editor = new CNeditor(this.$('#editorIframe')[0], this.onIFrameLoaded);
      this.$('#editorIframe').niceScroll({
        cursorcolor: "#CCC"
      });
      this.configureButtons();
      this.configureTitle();
      this.configureIFrame();
      this.fileList = new FileList(this.model, '#file-list');
    }

    /**
    # every keyUp in the note's editor will trigger a countdown of 3s, after
    # 3s and if the user didn't type anything, the content will be saved
    */


    NoteView.prototype.configureIFrame = function() {
      var _this = this;
      this.$("iframe").on("onKeyUp", function() {
        var id;
        clearTimeout(_this.saveTimer);
        if (_this.saveButton.hasClass("active")) {
          _this.saveButton.removeClass("active");
        }
        id = _this.model.id;
        return _this.saveTimer = setTimeout(function() {
          Note.updateNote(id, {
            content: _this.editor.getEditorContent()
          });
          if (!_this.saveButton.hasClass("active")) {
            return _this.saveButton.addClass("active");
          }
        }, 3000);
      });
      return this.saveButton.click(this.saveEditorContent);
    };

    NoteView.prototype.configureTitle = function() {
      var _this = this;
      this.noteFullTitle.live("keypress", function(e) {
        if (e.keyCode === 13) {
          return noteFullTitle.trigger("blur");
        }
      });
      return this.noteFullTitle.blur(function() {
        var newName, oldName;
        newName = _this.noteFullTitle.val();
        oldName = _this.model.title;
        if (newName !== "" && oldName !== newName) {
          _this.homeView.onNoteTitleChange(_this.model.id, newName);
          _this.homeView.tree._updateSuggestionList("rename", newName, oldName);
          return _this.updateBreadcrumbOnTitleChange(newName);
        }
      });
    };

    NoteView.prototype.configureButtons = function() {
      var _this = this;
      this.indentBtn = this.$("#indentBtn");
      this.unIndentBtn = this.$("#unIndentBtn");
      this.markerListBtn = this.$("#markerListBtn");
      this.saveEditorBtn = this.$("#save-editor-content");
      this.titleBtn = this.$("#titleBtn");
      this.indentBtn.tooltip({
        placement: "right",
        title: "Indent the selection"
      });
      this.indentBtn.on("click", function() {
        _this.editor._addHistory();
        return _this.editor.tab();
      });
      this.unIndentBtn.tooltip({
        placement: "right",
        title: "Unindent the selection"
      });
      this.unIndentBtn.on("click", function() {
        _this.editor._addHistory();
        return _this.editor.shiftTab();
      });
      this.markerListBtn.tooltip({
        placement: "right",
        title: "Change selection from titles to marker list"
      });
      this.markerListBtn.on("click", function() {
        _this.editor._addHistory();
        return _this.editor.markerList();
      });
      this.titleBtn.tooltip({
        placement: "right",
        title: "Change selection from marker list to titles"
      });
      this.titleBtn.on("click", function() {
        _this.editor._addHistory();
        return _this.editor.titleList();
      });
      return this.saveEditorBtn.tooltip({
        placement: "right",
        title: "Save the current content"
      });
    };

    /**
    #
    */


    NoteView.prototype.setModel = function(note, data) {
      this.model = note;
      this.setTitle(note.title);
      this.setContent(note.content);
      this.createBreadcrumb(note, data);
      this.fileList.configure(this.model);
      return this.fileList.render();
    };

    /**
    #  Display note title
    */


    NoteView.prototype.setTitle = function(title) {
      return this.noteFullTitle.val(title);
    };

    /**
    # Stop saving timer if any and force saving of editor content.
    */


    NoteView.prototype.saveEditorContent = function() {
      if ((this.model != null) && (this.editor != null) && (this.saveTimer != null)) {
        clearTimeout(this.saveTimer);
        this.saveTimer = null;
        Note.updateNote(this.model.id, {
          content: this.editor.getEditorContent()
        });
        return this.saveButton.addClass("active");
      }
    };

    /**
    #
    */


    NoteView.prototype.setContent = function(content) {
      if (content) {
        return this.editor.setEditorContent(content);
      } else {
        return this.editor.deleteContent();
      }
    };

    /**
    # create a breadcrumb showing a clickable way from the root to the current note
    # input: noteModel, contains the informations of the current note
    #  data, allow to reach the id of the parents of the current note
    # output: the breadcrumb html is modified
    */


    NoteView.prototype.createBreadcrumb = function(noteModel, data) {
      var breadcrumb, currentPath, noteName, parent, path, paths;
      paths = noteModel.path;
      noteName = paths.pop();
      breadcrumb = "";
      parent = this.homeView.tree.jstreeEl.jstree("get_selected");
      while (paths.length > 0) {
        parent = data.inst._get_parent(parent);
        path = "#note/" + parent[0].id + "/";
        currentPath = paths.join("/");
        noteName = paths.pop();
        breadcrumb = "<a href='" + path + currentPath + "'> " + noteName + "</a> >" + breadcrumb;
      }
      breadcrumb = "<a href='#note/all'> All</a> >" + breadcrumb;
      this.breadcrumb.find("a").unbind();
      this.breadcrumb.html(breadcrumb);
      return this.breadcrumb.find("a").click(function(event) {
        var hash, id;
        event.preventDefault();
        hash = event.target.hash.substring(1);
        path = hash.split("/");
        id = path[1];
        return app.homeView.selectNote(id);
      });
    };

    /**
    # in case of renaming a note this function update the breadcrumb in consequences
    */


    NoteView.prototype.updateBreadcrumbOnTitleChange = function(newName) {
      return this.breadcrumb.find(" a:last").text(newName);
    };

    return NoteView;

  })(Backbone.View);
  
}});

window.require.define({"views/templates/content-empty": function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<div id="CNID_1" class="Tu-1"><span></span><br/></div>');
  }
  return buf.join("");
  };
}});

window.require.define({"views/templates/editor": function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<div id="editor-button-bar" class="btn-group btn-group-vertical clearfix"><button id="indentBtn" class="btn btn-small"><i class="icon-indent-left"></i></button><button id="unIndentBtn" class="btn btn-small"><i class="icon-indent-right"></i></button><button id="markerListBtn" class="btn btn-small"><i class="icon-th-list"></i></button><button id="titleBtn" class="btn btn-small"><i class="icon-text-height"></i></button><button id="save-editor-content" class="btn active btn-small"><i class="icon-download-alt"></i></button></div><div class="spacer"></div><div id="note-file-list"><div id="file-number">0 files</div><div id="file-pic"></div><div id="file-list"></div></div><div id="editor-container"><iframe id="editorIframe"></iframe></div>');
  }
  return buf.join("");
  };
}});

window.require.define({"views/templates/home": function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<div id="nav" class="ui-layout-west"><div id="tree"></div></div><div id="note-area" class="ui-layout-center"><div id="help-info">You don\'t have any note selected yet. To select a note use the tree\non your left.</div><div id="note-full" class="note-full"><div id="note-full-breadcrumb">/</div><div id="note-style"><div><input id="note-full-title"/></div><div id="editor"></div></div></div></div><div id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" class="modal hide fade in"><div class="modal-header"><h3 id="myModalLabel">Warning!</h3></div><div class="modal-body"><p>You are about to delete this note and all its children. Do you want to continue?</p></div><div class="modal-footer"><button id="modal-yes" data-dismiss="modal" aria-hidden="true" class="btn">Yes</button><button data-dismiss="modal" aria-hidden="true" class="btn">No</button></div></div>');
  }
  return buf.join("");
  };
}});

window.require.define({"views/templates/note": function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<p>' + escape((interp = note.humanPath.split(",").join(" / ")) == null ? '' : interp) + '</p><h2>' + escape((interp = note.title) == null ? '' : interp) + '</h2><textarea id="note-content"></textarea>');
  }
  return buf.join("");
  };
}});

window.require.define({"views/templates/tree_buttons": function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
  attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<div id="tree-buttons"><div id="tree-create" class="button"><i class="icon-plus"></i></div><div id="tree-remove" class="button"><i class="icon-remove"></i></div><div id="tree-rename" class="button"><i class="icon-pencil"></i></div></div><div id="tree-top-buttons"><input id="tree-search-field" type="text" class="span2"/><i id="suppr-button" style="display: none" class="icon-remove-circle"></i></div><div id="my-notes"><img id="my-notes-pic" src="img/my-notes.png"/><div id="create-note"></div></div>');
  }
  return buf.join("");
  };
}});

window.require.define({"views/widgets/file_list": function(exports, require, module) {
  var helpers;

  helpers = require('../../helpers');

  exports.FileList = (function() {

    function FileList(model, id) {
      var _this = this;
      this.model = model;
      this.id = id;
      this.$el = $(this.id);
      this.uploadButton = $("#file-pic");
      this.uploader = new qq.FileUploaderBasic({
        button: document.getElementById('file-pic'),
        mutliple: false,
        forceMultipart: true,
        onComplete: function(id, filename, response) {
          _this.uploadButton.spin();
          _this.uploadButton.find("i").css('visibility', 'visible');
          _this.$el.slideDown();
          if (!(_this.model._attachments != null)) {
            _this.model._attachments = {};
          }
          _this.model._attachments[filename] = {};
          _this.addFileLine(filename);
          _this.setFileNumber();
          return _this.fileList.slideDown();
        },
        onSubmit: function() {
          _this.uploadButton.find("i").css('visibility', 'hidden');
          return _this.uploadButton.spin('small');
        }
      });
      this.uploadButton.find("input").css("cursor", "pointer !important");
      this.widget = $("#note-file-list");
      this.widget.mouseenter(function() {
        return _this.$el.slideDown();
      });
      this.widget.mouseleave(function() {
        return _this.$el.slideUp();
      });
    }

    FileList.prototype.configure = function(model) {
      this.model = model;
      this.uploader._options.action = "notes/" + this.model.id + "/files/";
      this.uploader._handler._options.action = "notes/" + this.model.id + "/files/";
      return this.setFileNumber();
    };

    /**
    # Display inside dedicated div list of files attached to the current note.
    */


    FileList.prototype.render = function() {
      var file;
      if (this.model != null) {
        $('.note-file button').unbind();
        this.$el.html(null);
        for (file in this.model._attachments) {
          this.addFileLine(file);
        }
        return this.setFileNumber();
      }
    };

    FileList.prototype.addFileLine = function(file) {
      var delButton, line, lineId, path, slug,
        _this = this;
      path = "notes/" + this.model.id + "/files/" + file;
      slug = helpers.slugify(file);
      lineId = "note-" + slug;
      this.$el.append("<div class=\"note-file spacer\" id=\"" + lineId + "\">\n    <a href=\"" + path + "\" target=\"_blank\">" + file + "</a>\n    <button>(x)</button>\n</div>");
      line = this.$el.find("#" + lineId);
      delButton = line.find("button");
      line.hide();
      delButton.click(function(target) {
        delButton.html("&nbsp;&nbsp;&nbsp;");
        delButton.spin('tiny');
        return $.ajax({
          url: path,
          type: "DELETE",
          success: function() {
            delButton.spin();
            delete _this.model._attachments[file];
            _this.setFileNumber();
            return line.fadeOut(function() {
              return line.remove();
            });
          },
          error: function() {
            return alert("Server error occured.");
          }
        });
      });
      return line.fadeIn();
    };

    FileList.prototype.setFileNumber = function() {
      var file, fileNumber;
      fileNumber = 0;
      for (file in this.model._attachments) {
        fileNumber++;
      }
      if (fileNumber > 1) {
        return this.widget.find('#file-number').html("" + fileNumber + " files");
      } else if (fileNumber === 1) {
        return this.widget.find('#file-number').html("" + fileNumber + " file");
      } else {
        return this.widget.find('#file-number').html("no file");
      }
    };

    return FileList;

  })();
  
}});

window.require.define({"views/widgets/tree": function(exports, require, module) {
  var slugify,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  slugify = require("helpers").slugify;

  /* Widget to easily manipulate data tree (navigation for cozy apps)
  Properties :
      currentPath      = ex : /all/coutries/great_britain 
                         ("great_britain" is the uglified name of the note)
      currentData      = data : jstree data obj sent by the select
      currentNote_uuid : uuid of the currently selected note
      widget           = @jstreeEl.jstree
      searchField      = $("#tree-search-field")
      searchButton     = $("#tree-search")
      noteFull
      jstreeEl         = $("#tree")
  */


  exports.Tree = (function() {
    /**
    # suggestionList is a global array containing all the suggestions for the
    # autocompletion plugin
    # this array contains objects with the nature of the suggestion
    # (folder, tag, search string...) and the string corresponding to the suggestion
    */

    var suggestionList;

    suggestionList = [];

    /**
    # Initialize jsTree tree with options : sorting, create/rename/deldarkgrey
    # unique children and json data for loading.
    # params :
    #   navEl : 
    #   data :
    #   homeViewCbk :
    */


    function Tree(navEl, data, homeViewCbk) {
      this._getSlugPath = __bind(this._getSlugPath, this);

      this._updateSuggestionList = __bind(this._updateSuggestionList, this);

      this._recursiveRemoveSuggestionList = __bind(this._recursiveRemoveSuggestionList, this);

      var jstreeEl, supprButton, __initSuggestionList;
      jstreeEl = $("#tree");
      this.jstreeEl = jstreeEl;
      this.supprButton = $("#suppr-button");
      supprButton = this.supprButton;
      this.searchField = $("#tree-search-field");
      navEl.prepend(require('../templates/tree_buttons'));
      /**
      # Creation of the jstree
      # Please visit http://www.jstree.com/ for more information
      */

      data = JSON.parse(data);
      this.widget = this.jstreeEl.jstree({
        plugins: ["themes", "json_data", "ui", "crrm", "unique", "sort", "cookies", "types", "hotkeys", "dnd", "search"],
        json_data: {
          data: data
        },
        types: {
          "default": {
            valid_children: "default",
            icon: {
              image: "test.png"
            }
          },
          folder: {
            icon: {
              image: "test.png"
            }
          },
          root: {
            valid_children: null,
            delete_node: false,
            rename_node: false,
            move_node: false,
            start_drag: false
          }
        },
        crrm: {
          move: {
            check_move: function(data) {
              if (data.r.attr("id") === "tree-node-all") {
                return false;
              } else {
                return true;
              }
            }
          }
        },
        cookies: {
          save_selected: false
        },
        ui: {
          select_limit: 1
        },
        hotkeys: {
          del: false
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
        search: {
          search_method: "jstree_contains_multi",
          show_only_matches: true
        }
      });
      this.setListeners(homeViewCbk);
      this.setSearchField();
      __initSuggestionList = function(node) {
        var child, object, _i, _len, _ref, _results;
        _ref = node.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          object = {
            type: "folder",
            name: child.data
          };
          suggestionList.push(object);
          _results.push(__initSuggestionList(child));
        }
        return _results;
      };
      __initSuggestionList(data);
      suggestionList.sort(this._sortFunction);
    }

    /**
    # Bind listeners given in parameters with comment events (creation,
    # update, deletion, selection). Called by the constructor once.
    */


    Tree.prototype.setListeners = function(homeViewCbk) {
      var jstreeEl, modalAlert, modalYesBtn, supprButton, tree_buttons, tree_buttons_root, tree_buttons_target,
        _this = this;
      jstreeEl = this.jstreeEl;
      supprButton = this.supprButton;
      tree_buttons = $("#tree-buttons");
      modalAlert = $('#myModal');
      modalYesBtn = $("#modal-yes");
      tree_buttons_root = $("#tree-buttons-root");
      $("#tree-create").tooltip({
        placement: "bottom",
        title: "Add a note"
      });
      $("#tree-create").on("click", function(event) {
        var parent;
        parent = this.parentElement.parentElement;
        jstreeEl.jstree("create", parent, 0, "New note");
        $(this).tooltip('hide');
        event.stopPropagation();
        return event.preventDefault();
      });
      $("#tree-create-root").tooltip({
        placement: "bottom",
        title: "Add a note"
      });
      $("#tree-create-root").on("click", function(event) {
        var parent;
        parent = this.parentElement.parentElement;
        jstreeEl.jstree("create", parent, 0, "New note");
        $(this).tooltip('hide');
        event.stopPropagation();
        return event.preventDefault();
      });
      $("#tree-rename").tooltip({
        placement: "bottom",
        title: "Rename a note"
      });
      $("#tree-rename").on("click", function(event) {
        jstreeEl.jstree('rename', this.parentElement.parentElement);
        $(this).tooltip('hide');
        event.preventDefault();
        return event.stopPropagation();
      });
      $("#tree-remove").tooltip({
        placement: "bottom",
        title: "Remove a note"
      });
      $("#tree-remove").on("click", function(event) {
        var nodeToDelete;
        nodeToDelete = event.target.parentElement.parentElement.parentElement.parentElement;
        $(event.target.parentElement).tooltip('hide');
        modalAlert.modal('show');
        modalYesBtn.unbind("click");
        modalYesBtn.on("click", function() {
          _this._recursiveRemoveSuggestionList(nodeToDelete);
          if (nodeToDelete.id !== 'tree-node-all') {
            jstreeEl.jstree("remove", nodeToDelete);
            return homeViewCbk.onRemove(nodeToDelete.id);
          }
        });
        event.preventDefault();
        return event.stopPropagation();
      });
      tree_buttons_target = $("#nav");
      this.widget.on("hover_node.jstree", function(event, data) {
        if (data.rslt.obj[0].id === "tree-node-all") {
          tree_buttons_root.appendTo(data.args[0]);
          return tree_buttons_root.css("display", "block");
        } else {
          tree_buttons.appendTo(data.args[0]);
          return tree_buttons.css("display", "block");
        }
      });
      this.widget.on("dehover_node.jstree", function(event, data) {
        if (data.rslt.obj[0].id === "tree-node-all") {
          tree_buttons_root.css("display", "none");
          return tree_buttons_root.appendTo(tree_buttons_target);
        } else {
          tree_buttons.css("display", "none");
          return tree_buttons.appendTo(tree_buttons_target);
        }
      });
      this.widget.on("create.jstree", function(e, data) {
        var nodeName, parentId;
        nodeName = data.inst.get_text(data.rslt.obj);
        parentId = data.rslt.parent[0].id;
        _this._updateSuggestionList("create", nodeName, null);
        return homeViewCbk.onCreate(parentId, data.rslt.name, data);
      });
      this.widget.on("rename.jstree", function(e, data) {
        var newNodeName, oldNodeName;
        newNodeName = data.rslt.new_name;
        oldNodeName = data.rslt.old_name;
        _this._updateSuggestionList("rename", newNodeName, oldNodeName);
        if (oldNodeName !== newNodeName) {
          return homeViewCbk.onRename(data.rslt.obj[0].id, newNodeName);
        }
      });
      this.widget.on("select_node.jstree", function(e, data) {
        var nodeName, note_uuid, parent, path;
        note_uuid = data.rslt.obj[0].id;
        if (note_uuid === "tree-node-all") {
          path = "/all";
        } else {
          nodeName = data.inst.get_text(data.rslt.obj);
          parent = data.inst._get_parent();
          path = "/" + data.rslt.obj[0].id + _this._getSlugPath(parent, nodeName);
        }
        _this.currentPath = path;
        _this.currentData = data;
        _this.currentNote_uuid = note_uuid;
        _this.jstreeEl[0].focus();
        return homeViewCbk.onSelect(path, note_uuid, data);
      });
      this.widget.on("move_node.jstree", function(e, data) {
        var nodeId, targetNodeId;
        nodeId = data.rslt.o[0].id;
        targetNodeId = data.rslt.o[0].parentElement.parentElement.id;
        return homeViewCbk.onDrop(nodeId, targetNodeId);
      });
      return this.widget.on("loaded.jstree", function(e, data) {
        return homeViewCbk.onLoaded();
      });
    };

    Tree.prototype.setSearchField = function() {
      /**
      #Autocompletion
      */

      var jstreeEl, searchField, searchFunction, supprButton, textextWidget, _filterAutocomplete, _selectIcon,
        _this = this;
      this.searchField = $("#tree-search-field");
      searchField = this.searchField;
      supprButton = this.supprButton;
      jstreeEl = this.jstreeEl;
      this.searchField.blur(function() {
        return jstreeEl.css("margin-top", 10);
      });
      supprButton.click(function() {
        var textPrompt;
        textPrompt = $(".text-prompt");
        $(".text-tags").empty();
        searchField.css("padding-left", "5px");
        searchField.css("padding-top", "3px");
        textPrompt.css("padding-left", "5px");
        textPrompt.css("padding-top", "3px");
        $(".text-wrap").css("height", "22px");
        $(".text-core").css("height", "22px");
        $(".text-dropdown").css("top", "22px");
        supprButton.css("display", "none");
        return jstreeEl.jstree("search", "");
      });
      /*
              # this function allow to select what appears in the suggestion list
              # while the user type something in the search input
              # input : array of suggestions, current string in the search input
              # outputs : an array containing strings corresponding to suggestions 
              # depending on the searchstring
      */

      _filterAutocomplete = function(array, searchString) {
        var char, exp, expBold, expFirst, filtered, filteredFirst, name, nameBold, regSentence, _i, _j, _len, _len1;
        filteredFirst = [];
        filtered = [];
        regSentence = "";
        for (_i = 0, _len = searchString.length; _i < _len; _i++) {
          char = searchString[_i];
          regSentence += ".*(" + char + ")";
          expFirst = new RegExp("^" + searchString, "i");
          expBold = new RegExp("([" + searchString + "])", "gi");
          exp = new RegExp(regSentence, "i");
          for (_j = 0, _len1 = array.length; _j < _len1; _j++) {
            name = array[_j];
            if (expFirst.test(name)) {
              nameBold = name.replace(expBold, function(match, pattern) {
                "<span class='bold-name'>" + pattern + "</span>";
                return filteredFirst.push(nameBold);
              });
            }
            if (exp.test(name)) {
              nameBold = name.replace(expBold, function(match, pattern) {
                return "<span class='bold-name'>" + pattern + "</span>";
              });
              if (!(__indexOf.call(filteredFirst, nameBold) >= 0) && !(__indexOf.call(filtered, nameBold) >= 0)) {
                filtered.push(nameBold);
              }
            }
          }
        }
        return filteredFirst.concat(filtered);
      };
      /**
      #used by textext to change the render of the suggestion list
      #attach an icon to a certain type in the autocomplete list
      #input : suggestion : a string which is the suggestion, 
      #array : the array is suggestionList containing all the suggestions
      # possible and their nature
      */

      _selectIcon = function(suggestion, array) {
        var i, suggestion2;
        if (suggestion === ("\"" + (searchField.val()) + "\"")) {
          return "<i class='icon-search icon-suggestion'></i>";
        } else {
          i = 0;
          suggestion2 = suggestion.replace(/<.*?>/g, "");
          while (suggestion2 !== array[i].name) {
            i++;
          }
          if (array[i].type === "folder") {
            return "<i class='icon-folder-open icon-suggestion'></i>";
          }
        }
      };
      /**
      # treat the content of the input and launch the jstree search function
      */

      searchFunction = function(searchString) {
        var string, _i, _len, _ref;
        _ref = $(".text-tag .text-label");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          string = _ref[_i];
          searchString += "_" + string.innerHTML;
        }
        return _this.jstreeEl.jstree("search", searchString);
      };
      /**
      # Textext plugin is used to implement the autocomplete plugin Please
      # visit http://textextjs.com/ for more information about this plugin
      */

      textextWidget = searchField.textext({
        /**
        #tags: add tags to the input
        #prompt: print Search... in the input
        #focus: change CSS when the input has the focus
        #autocomplete: add a suggestion list to the input
        */

        plugins: 'tags prompt focus autocomplete',
        prompt: 'Search...',
        autocomplete: {
          dropdownMaxHeight: '200px',
          render: function(suggestion) {
            return _selectIcon(suggestion, suggestionList) + suggestion;
          }
        },
        /**
        # ext allows to rewrite a textext functionality
        */

        ext: {
          core: {
            /**
            # event that trigger when the content of the input is
            # changing
            */

            onGetFormData: function(e, data, keyCode) {
              var textInput;
              textInput = this.input().val();
              data[0] = {
                'input': textInput,
                'form': textInput
              };
              if (textInput === "") {
                searchFunction("");
                if ($(".text-tag .text-label")[0] === void 0) {
                  return supprButton.css("display", "none");
                }
              }
            }
          },
          autocomplete: {
            /**
            # when the user click on a suggestion (text, bold, icon or
            # blank spot) it adds a tag in the input
            */

            onClick: function(e) {
              var self, target;
              self = this;
              target = $(e.target);
              if (target.is('.text-suggestion') || target.is('.text-label') || target.is('.icon-suggestion') || target.is('.bold-name')) {
                self.trigger('enterKeyPress');
              }
              if (self.core().hasPlugin('tags')) {
                return self.val('');
              }
            }
          },
          itemManager: {
            /**
            #create an array with the "name" field of a suggestion list
            */

            nameField: function(array) {
              var i, retArray, _i, _len;
              retArray = [];
              for (_i = 0, _len = array.length; _i < _len; _i++) {
                i = array[_i];
                retArray.push(i.name);
              }
              return retArray;
            },
            /**
            # changing the content of a tag to avoid the view of 
            # balises in it
            */

            itemToString: function(item) {
              if (/".*"/.test(item)) {
                return item = item.replace(/"(.*)"/, function(str, p1) {
                  return p1;
                });
              } else {
                return item = item.replace(/<.*?>/g, "");
              }
            }
          },
          tags: {
            /**
            # change the render of a tag in case the tag is referring
            # to what the user is typing
            */

            renderTag: function(tag) {
              var node;
              node = $(this.opts('html.tag'));
              node.find('.text-label').text(this.itemManager().itemToString(tag));
              if (/icon-search/.test($(".text-selected")[0].innerHTML)) {
                node.find('.text-button').addClass("tag-special");
                node.find('.text-button').removeClass("text-button");
                node.data('text-tag', tag);
              } else {
                node.data('text-tag', tag);
              }
              return node;
            }
          }
        }
      });
      textextWidget.bind('getSuggestions', function(e, data) {
        var list, query, textext, treeHeight;
        textext = $(e.target).textext()[0];
        query = (data ? data.query : "") || "";
        list = textext.itemManager().nameField(suggestionList);
        list = _filterAutocomplete(list, query);
        list = ["\"" + (searchField.val()) + "\""].concat(list);
        treeHeight = list.length * 22 + 10;
        jstreeEl.css("margin-top", treeHeight);
        return $(this).trigger("setSuggestions", {
          result: list
        });
      });
      return textextWidget.bind('isTagAllowed', function(e, data) {
        jstreeEl.css("margin-top", 10);
        supprButton.css("display", "block");
        return searchFunction(data.tag);
      });
    };

    /**
    #Select node corresponding to given path
    #if note_uuid exists in the jstree it is selected
    #otherwise if there is no seleted node, we select the root
    */


    Tree.prototype.selectNode = function(note_uuid) {
      var node, tree;
      node = $("#" + note_uuid);
      if (node[0]) {
        tree = this.jstreeEl.jstree("deselect_all", null);
        return tree = this.jstreeEl.jstree("select_node", node);
      } else if (!this.widget.jstree("get_selected")[0]) {
        return tree = this.jstreeEl.jstree("select_node", "#tree-node-all");
      }
    };

    /**
    # used by the .sort() method to be efficient with our structure
    */


    Tree.prototype._sortFunction = function(a, b) {
      if (a.name > b.name) {
        return 1;
      } else if (a.name === b.name) {
        return 0;
      } else if (a.name < b.name) {
        return -1;
      }
    };

    /**
    # this function remove the sons of a removed node in the suggestion list
    */


    Tree.prototype._recursiveRemoveSuggestionList = function(nodeToDelete) {
      var node, _i, _len, _ref;
      if (nodeToDelete.children[2] === void 0) {
        console.log(nodeToDelete.children);
      } else {
        _ref = nodeToDelete.children[2].children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          node = _ref[_i];
          this._recursiveRemoveSuggestionList(node);
        }
      }
      return this._updateSuggestionList("remove", nodeToDelete.children[1].text.replace(/\s/, ""), null);
    };

    /**
    # this method update the array suggestionList when the user add, rename or remove
    # a node
    # input: action : neither create, rename or remove,
    # nodeName : in case of create and remove : the name of the new note or the note to remove
    # in case of rename : the new name of the note
    # oldName : only for rename : the name that will be replaced in the note
    # output : suggestionList updated
    */


    Tree.prototype._updateSuggestionList = function(action, newName, oldName) {
      var i, object;
      if (action === "create") {
        object = {
          type: "folder",
          name: newName
        };
        suggestionList.push(object);
        return suggestionList.sort(this._sortFunction);
      } else if (action === "rename") {
        i = 0;
        while (i < suggestionList.length && suggestionList[i].name !== newName) {
          i++;
        }
        if (suggestionList.length > i) {
          suggestionList[i].name = newName;
          return suggestionList.sort(this._sortFunction);
        }
      } else if (action === "remove") {
        i = 0;
        while (i < suggestionList.length && suggestionList[i].name !== newName) {
          i++;
        }
        if (suggestionList.length > i) {
          return suggestionList.splice(i, 1);
        }
      }
    };

    Tree.prototype._getPath = function(parent, nodeName) {
      var name, nodes;
      if (nodeName != null) {
        nodes = [slugify(nodeName)];
      }
      name = "all";
      while (name && parent !== void 0 && parent.children !== void 0) {
        name = parent.children("a:eq(0)").text();
        nodes.unshift(slugify(name));
        parent = parent.parent().parent();
      }
      return nodes;
    };

    Tree.prototype._getSlugPath = function(parent, nodeName) {
      return this._getPath(parent, nodeName).join("/");
    };

    return Tree;

  })();
  
}});

