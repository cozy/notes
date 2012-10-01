(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return hasOwnProperty.call(object, name);
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
      return require(absolute);
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
      var _this = this;
      $(function() {
        _this.initialize();
        return Backbone.history.start();
      });
    }

    Application.prototype.initialize = function() {
      this.homeView = new HomeView;
      this.homeView.render();
      return this.router = new MainRouter;
    };

    return Application;

  })(BrunchApplication);

  window.app = new exports.Application;
  
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
      return request("POST", "notes", data, callback);
    };

    Note.updateNote = function(id, data, callback) {
      return request("PUT", "notes/" + id, data, callback);
    };

    Note.deleteNote = function(id, callback) {
      return request("DELETE", "notes/" + id, callback);
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
    Routes : 2 types : 
    
      * '' : home : only for the initialization of the app
      * '#note/{note_uuid : 25 char}/slugyPath' : unique url corresponding 
        to a note where note_uuid is the note id and slugyPath the slugified 
        path of a note constituted with the name of its parents.
    */


    MainRouter.prototype.routes = {
      '': 'home',
      'note/all': "allNotes"
    };

    MainRouter.prototype.initialize = function() {
      return this.route(/^note\/(.*?)\/(.*?)$/, 'note');
    };

    MainRouter.prototype.home = function() {
      console.log("event : router.home");
      this.navigate("note/all", {
        trigger: false
      });
      return this._initializeTree("tree-node-all");
    };

    MainRouter.prototype.note = function(note_uuid, path) {
      console.log("event : routeur.note path=" + path);
      if ($("#tree-create").length > 0) {
        return app.homeView.selectNote(note_uuid);
      } else {
        return this.allNotes();
      }
    };

    MainRouter.prototype.allNotes = function() {
      if ($('#tree').length > 0) {
        return app.homeView.selectNote("tree-node-all");
      } else {
        return this._initializeTree("tree-node-all");
      }
    };

    MainRouter.prototype._initializeTree = function(initPath) {
      console.log("routeur._initializeTree( " + initPath + " )");
      $('body').append(app.homeView.el);
      return app.homeView.initContent(initPath);
    };

    return MainRouter;

  })(Backbone.Router);
  
}});

window.require.define({"views/editor": function(exports, require, module) {
  /* ------------------------------------------------------------------------
  # CLASS FOR THE COZY NOTE EDITOR
  #
  # usage : 
  #
  # newEditor = new CNEditor( iframeTarget,callBack )
  #   iframeTarget = iframe where the editor will be nested
  #   callBack     = launched when editor ready, the context 
  #                  is set to the editorCtrl (callBack.call(this))
  # properties & methods :
  #   replaceContent    : (htmlContent) ->  # TODO: replace with markdown
  #   _keyPressListener : (e) =>
  #   _insertLineAfter  : (param) ->
  #   _insertLineBefore : (param) ->
  #   
  #   editorIframe      : the iframe element where is nested the editor
  #   editorBody$       : the jquery pointer on the body of the iframe
  #   _lines            : {} an objet, each property refers a line
  #   _highestId        : 
  #   _firstLine        : pointes the first line : TODO : not taken into account
  */

  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  exports.CNEditor = (function(_super) {

    __extends(CNEditor, _super);

    /*
        #   Constructor : newEditor = new CNEditor( iframeTarget,callBack )
        #       iframeTarget = iframe where the editor will be nested
        #       callBack     = launched when editor ready, the context 
        #                      is set to the editorCtrl (callBack.call(this))
    */


    function CNEditor(elementTarget, callBack) {
      this._keyPressListener = __bind(this._keyPressListener, this);

      var allSetter, iframe$, node$,
        _this = this;
      if (elementTarget.nodeName === "IFRAME") {
        this.getEditorSelection = function() {
          return rangy.getIframeSelection(elementTarget);
        };
        this.saveEditorSelection = function() {
          return rangy.saveSelection(rangy.dom.getIframeWindow(elementTarget));
        };
        iframe$ = $(elementTarget);
        iframe$.on('load', function() {
          var editorBody$, editor_css$, editor_head$, editor_html$;
          editor_html$ = iframe$.contents().find("html");
          editorBody$ = editor_html$.find("body");
          editorBody$.parent().attr('id', '__ed-iframe-html');
          editorBody$.attr("contenteditable", "true");
          editorBody$.attr("id", "__ed-iframe-body");
          editor_head$ = editor_html$.find("head");
          editor_css$ = editor_head$.html('<link href="stylesheets/app.css" rel="stylesheet">');
          _this.editorBody$ = editorBody$;
          _this.editorTarget = elementTarget;
          _this._lines = {};
          _this.newPosition = true;
          _this._highestId = 0;
          _this._deepest = 1;
          _this._firstLine = null;
          _this._history = {
            index: 0,
            history: [null],
            historySelect: [null],
            historyScroll: [null],
            historyLines: [null]
          };
          _this._lastKey = null;
          editorBody$.prop('__editorCtl', _this);
          editorBody$.on('mouseup', function() {
            return _this.newPosition = true;
          });
          editorBody$.on('keypress', _this._keyPressListener);
          editorBody$.on('keyup', function() {
            return iframe$.trigger(jQuery.Event("onKeyUp"));
          });
          editorBody$.on('paste', function(e) {
            console.log("pasting...");
            return _this.paste(e);
          });
          callBack.call(_this);
          return _this;
        });
      } else {
        console.log("target is not an iframe...");
        this.getEditorSelection = function() {
          return rangy.getSelection();
        };
        this.saveEditorSelection = function() {
          return rangy.saveSelection();
        };
        node$ = $(elementTarget);
        allSetter = function() {
          var editorBody$;
          editorBody$ = node$;
          editorBody$.attr("contenteditable", "true");
          editorBody$.attr("id", "__ed-iframe-body");
          _this.editorBody$ = editorBody$;
          _this.editorTarget = elementTarget;
          _this._lines = {};
          _this.newPosition = true;
          _this._highestId = 0;
          _this._deepest = 1;
          _this._firstLine = null;
          _this._history = {
            index: 0,
            history: [null],
            historySelect: [null],
            historyScroll: [null]
          };
          _this._lastKey = null;
          editorBody$.prop('__editorCtl', _this);
          editorBody$.on('keypress', _this._keyPressListener);
          editorBody$.on('mouseup', function() {
            return _this.newPosition = true;
          });
          editorBody$.on('keyup', function() {
            return node$.trigger(jQuery.Event("onKeyUp"));
          });
          editorBody$.on('paste', function(e) {
            console.log("pasting...");
            return _this.paste(e);
          });
          callBack.call(_this);
          return _this;
        };
        allSetter();
      }
    }

    /* ------------------------------------------------------------------------
    # Find the maximal deep (thus the deepest line) of the text
    # TODO: improve it so it only calculates the new depth from the modified
    #       lines (not all of them)
    # TODO: set a class system rather than multiple CSS files. Thus titles
    #       classes look like "Th-n depth3" for instance if max depth is 3
    # note: These todos arent our priority for now
    */


    CNEditor.prototype._updateDeepest = function() {
      var c, lines, max;
      max = 1;
      lines = this._lines;
      for (c in lines) {
        if (this.editorBody$.children("#" + ("" + lines[c].lineID)).length > 0 && lines[c].lineType === "Th" && lines[c].lineDepthAbs > max) {
          max = this._lines[c].lineDepthAbs;
        }
      }
      if (max !== this._deepest) {
        this._deepest = max;
        if (max < 4) {
          return this.replaceCSS("stylesheets/app-deep-" + max + ".css");
        } else {
          return this.replaceCSS("stylesheets/app-deep-4.css");
        }
      }
    };

    /* ------------------------------------------------------------------------
    # Initialize the editor content from a html string
    */


    CNEditor.prototype.replaceContent = function(htmlContent) {
      this.editorBody$.html(htmlContent);
      return this._readHtml();
    };

    /* ------------------------------------------------------------------------
    # Clear editor content
    */


    CNEditor.prototype.deleteContent = function() {
      this.editorBody$.html('<div id="CNID_1" class="Tu-1"><span></span><br></div>');
      return this._readHtml();
    };

    /* ------------------------------------------------------------------------
    # Returns a markdown string representing the editor content
    */


    CNEditor.prototype.getEditorContent = function() {
      var cozyContent;
      cozyContent = this.editorBody$.html();
      return this._cozy2md(cozyContent);
    };

    /* ------------------------------------------------------------------------
    # Sets the editor content from a markdown string
    */


    CNEditor.prototype.setEditorContent = function(mdContent) {
      var cozyContent;
      cozyContent = this._md2cozy(mdContent);
      this.editorBody$.html(cozyContent);
      return this._readHtml();
    };

    /*
        # Change the path of the css applied to the editor iframe
    */


    CNEditor.prototype.replaceCSS = function(path) {
      return $(this.editorTarget).contents().find("link[rel=stylesheet]").attr({
        href: path
      });
    };

    /* ------------------------------------------------------------------------
    # UTILITY FUNCTIONS
    # used to set ranges and normalize selection
    # 
    # parameters: elt  :  a dom object with only textNode children
    */


    CNEditor.prototype._putEndOnEnd = function(range, elt) {
      var offset;
      if (elt.lastChild != null) {
        offset = elt.lastChild.textContent.length;
        return range.setEnd(elt.lastChild, offset);
      } else {
        return range.setEnd(elt, 0);
      }
    };

    CNEditor.prototype._putStartOnEnd = function(range, elt) {
      var offset;
      if (elt.lastChild != null) {
        offset = elt.lastChild.textContent.length;
        return range.setStart(elt.lastChild, offset);
      } else {
        return range.setStart(elt, 0);
      }
    };

    CNEditor.prototype._putEndOnStart = function(range, elt) {
      if (elt.firstChild != null) {
        return range.setEnd(elt.firstChild, 0);
      } else {
        return range.setEnd(elt, 0);
      }
    };

    CNEditor.prototype._putStartOnStart = function(range, elt) {
      if (elt.firstChild != null) {
        return range.setStart(elt.firstChild, 0);
      } else {
        return range.setStart(elt, 0);
      }
    };

    CNEditor.prototype._normalize = function(range) {
      var elt, endContainer, startContainer, _ref, _ref1;
      startContainer = range.startContainer;
      if (startContainer.nodeName === "DIV") {
        if (range.startOffset < startContainer.childNodes.length - 1) {
          elt = startContainer.childNodes[range.startOffset];
          this._putStartOnStart(range, elt);
        } else {
          elt = startContainer.lastChild.previousElementSibling;
          this._putStartOnEnd(range, elt);
        }
      } else if ((_ref = startContainer.nodeName) === "SPAN" || _ref === "IMG" || _ref === "A") {
        if (range.startOffset < startContainer.childNodes.length) {
          elt = startContainer.childNodes[range.startOffset];
          this._putStartOnStart(range, elt);
        } else {
          elt = startContainer.lastChild;
          this.putStartOnEnd(range, elt);
        }
      }
      endContainer = range.endContainer;
      if (endContainer.nodeName === "DIV") {
        if (range.endOffset < endContainer.childNodes.length - 1) {
          elt = endContainer.chilNodes[range.endOffset];
          this._putEndOnStart(range, elt);
        } else {
          elt = endContainer.lastChild.previousElementSibling;
          this._putEndOnEnd(range, elt);
        }
      } else if ((_ref1 = endContainer.nodeName) === "SPAN" || _ref1 === "IMG" || _ref1 === "A") {
        if (range.endOffset < endContainer.childNodes.length) {
          elt = endContainer.childNodes[range.endOffset];
          this._putEndOnStart(range, elt);
        } else {
          elt = endContainer.lastChild;
          this.putEndOnEnd(range, elt);
        }
      }
      return range;
    };

    /* ------------------------------------------------------------------------
    #    The listener of keyPress event on the editor's iframe... the king !
    */


    /*
        # SHORTCUT  |-----------------------> (suggestion: see jquery.hotkeys.js ? )
        #
        # Definition of a shortcut : 
        #   a combination alt,ctrl,shift,meta
        #   + one caracter(.which) 
        #   or 
        #     arrow (.keyCode=dghb:) or 
        #     return(keyCode:13) or 
        #     bckspace (which:8) or 
        #     tab(keyCode:9)
        #   ex : shortcut = 'CtrlShift-up', 'Ctrl-115' (ctrl+s), '-115' (s),
        #                   'Ctrl-'
    */


    CNEditor.prototype._keyPressListener = function(e) {
      var keyStrokesCode, metaKeyStrokesCode, normalizedRange, normalizedSel, range, sel, shortcut;
      metaKeyStrokesCode = (e.altKey ? "Alt" : "") + 
                                (e.ctrlKey ? "Ctrl" : "") + 
                                (e.shiftKey ? "Shift" : "");
      switch (e.keyCode) {
        case 13:
          keyStrokesCode = "return";
          break;
        case 35:
          keyStrokesCode = "end";
          break;
        case 36:
          keyStrokesCode = "home";
          break;
        case 33:
          keyStrokesCode = "pgUp";
          break;
        case 34:
          keyStrokesCode = "pgDwn";
          break;
        case 37:
          keyStrokesCode = "left";
          break;
        case 38:
          keyStrokesCode = "up";
          break;
        case 39:
          keyStrokesCode = "right";
          break;
        case 40:
          keyStrokesCode = "down";
          break;
        case 9:
          keyStrokesCode = "tab";
          break;
        case 8:
          keyStrokesCode = "backspace";
          break;
        case 32:
          keyStrokesCode = "space";
          break;
        case 27:
          keyStrokesCode = "esc";
          break;
        case 46:
          keyStrokesCode = "suppr";
          break;
        default:
          switch (e.which) {
            case 32:
              keyStrokesCode = "space";
              break;
            case 8:
              keyStrokesCode = "backspace";
              break;
            case 97:
              keyStrokesCode = "A";
              break;
            case 115:
              keyStrokesCode = "S";
              break;
            case 118:
              keyStrokesCode = "V";
              break;
            case 121:
              keyStrokesCode = "Y";
              break;
            case 122:
              keyStrokesCode = "Z";
              break;
            default:
              keyStrokesCode = "other";
          }
      }
      shortcut = metaKeyStrokesCode + '-' + keyStrokesCode;
      if (shortcut === "-A" || shortcut === "-S" || shortcut === "-V" || shortcut === "-Y" || shortcut === "-Z") {
        shortcut = "-other";
      }
      if ((keyStrokesCode === "left" || keyStrokesCode === "up" || keyStrokesCode === "right" || keyStrokesCode === "down" || keyStrokesCode === "pgUp" || keyStrokesCode === "pgDwn" || keyStrokesCode === "end" || keyStrokesCode === "home") && (shortcut !== 'CtrlShift-down' && shortcut !== 'CtrlShift-up')) {
        this.newPosition = true;
        $("#editorPropertiesDisplay").text("newPosition = true");
      } else {
        if (this.newPosition) {
          this.newPosition = false;
          $("#editorPropertiesDisplay").text("newPosition = false");
          sel = this.getEditorSelection();
          range = sel.getRangeAt(0);
          normalizedRange = rangy.createRange();
          normalizedRange = this._normalize(range);
          normalizedSel = this.getEditorSelection();
          normalizedSel._ranges[0] = normalizedRange;
          normalizedSel.setSingleRange(normalizedRange);
        }
      }
      this.currentSel = null;
      if (this._lastKey !== shortcut && (shortcut === "-tab" || shortcut === "-return" || shortcut === "-backspace" || shortcut === "-suppr" || shortcut === "CtrlShift-down" || shortcut === "CtrlShift-up" || shortcut === "Ctrl-C" || shortcut === "Shift-tab" || shortcut === "-space" || shortcut === "-other")) {
        this._addHistory();
      }
      this._lastKey = shortcut;
      switch (shortcut) {
        case "-return":
          this._return();
          return e.preventDefault();
        case "-tab":
          this.tab();
          return e.preventDefault();
        case "-backspace":
          return this._backspace(e);
        case "-suppr":
          return this._suppr(e);
        case "CtrlShift-down":
          this._moveLinesDown();
          return e.preventDefault();
        case "CtrlShift-up":
          this._moveLinesUp();
          return e.preventDefault();
        case "Shift-tab":
          this.shiftTab();
          return e.preventDefault();
        case "Alt-A":
          this._toggleLineType();
          return e.preventDefault();
        case "Ctrl-V":
          return true;
        case "Ctrl-S":
          return e.preventDefault();
        case "Ctrl-Z":
          e.preventDefault();
          return this.unDo();
        case "Ctrl-Y":
          e.preventDefault();
          return this.reDo();
      }
    };

    /* ------------------------------------------------------------------------
    # Manage deletions when suppr key is pressed
    */


    CNEditor.prototype._suppr = function(e) {
      var sel, startLine;
      this._findLinesAndIsStartIsEnd();
      sel = this.currentSel;
      startLine = sel.startLine;
      if (sel.range.collapsed) {
        if (sel.rangeIsEndLine) {
          if (startLine.lineNext !== null) {
            sel.range.setEndBefore(startLine.lineNext.line$[0].firstChild);
            sel.endLine = startLine.lineNext;
            this._deleteMultiLinesSelections();
            return e.preventDefault();
          } else {
            return e.preventDefault();
          }
        }
      } else if (sel.endLine === startLine) {
        sel.range.deleteContents();
        return e.preventDefault();
      } else {
        this._deleteMultiLinesSelections();
        return e.preventDefault();
      }
    };

    /* ------------------------------------------------------------------------
    #  Manage deletions when backspace key is pressed
    */


    CNEditor.prototype._backspace = function(e) {
      var sel, startLine;
      this._findLinesAndIsStartIsEnd();
      sel = this.currentSel;
      startLine = sel.startLine;
      if (sel.range.collapsed) {
        if (sel.rangeIsStartLine) {
          if (startLine.linePrev !== null) {
            sel.range.setStartBefore(startLine.linePrev.line$[0].lastChild);
            sel.startLine = startLine.linePrev;
            this._deleteMultiLinesSelections();
            return e.preventDefault();
          } else {
            return e.preventDefault();
          }
        }
      } else if (sel.endLine === startLine) {
        sel.range.deleteContents();
        return e.preventDefault();
      } else {
        this._deleteMultiLinesSelections();
        return e.preventDefault();
      }
    };

    /* ------------------------------------------------------------------------
    #  Turn selected lines in a title List (Th)
    */


    CNEditor.prototype.titleList = function() {
      var endContainer, endDiv, endDivID, endLineID, initialEndOffset, initialStartOffset, line, range, sel, startContainer, startDiv, _results;
      sel = this.getEditorSelection();
      range = sel.getRangeAt(0);
      startContainer = range.startContainer;
      endContainer = range.endContainer;
      initialStartOffset = range.startOffset;
      initialEndOffset = range.endOffset;
      startDiv = startContainer;
      if (startDiv.nodeName !== "DIV") {
        startDiv = $(startDiv).parents("div")[0];
      }
      endDiv = endContainer;
      if (endDiv.nodeName !== "DIV") {
        endDiv = $(endDiv).parents("div")[0];
      }
      endLineID = endDiv.id;
      line = this._lines[startDiv.id];
      endDivID = endDiv.id;
      _results = [];
      while (true) {
        this._line2titleList(line);
        if (line.lineID === endDivID) {
          break;
        } else {
          _results.push(line = line.lineNext);
        }
      }
      return _results;
    };

    /* ------------------------------------------------------------------------
    #  Turn a given line in a title List Line (Th)
    */


    CNEditor.prototype._line2titleList = function(line) {
      var parent1stSibling, _results;
      if (line.lineType !== 'Th') {
        if (line.lineType[0] === 'L') {
          line.lineType = 'Tu';
          line.lineDepthAbs += 1;
        }
        this._titilizeSiblings(line);
        parent1stSibling = this._findParent1stSibling(line);
        _results = [];
        while (parent1stSibling !== null && parent1stSibling.lineType !== 'Th') {
          this._titilizeSiblings(parent1stSibling);
          _results.push(parent1stSibling = this._findParent1stSibling(parent1stSibling));
        }
        return _results;
      }
    };

    /* ------------------------------------------------------------------------
    #  Turn selected lines in a Marker List
    */


    CNEditor.prototype.markerList = function(l) {
      var endDiv, endLineID, initialEndOffset, initialStartOffset, line, lineTypeTarget, range, startDiv, startDivID, _results;
      if (l != null) {
        startDivID = l.lineID;
        endLineID = startDivID;
      } else {
        range = this.getEditorSelection().getRangeAt(0);
        initialStartOffset = range.startOffset;
        initialEndOffset = range.endOffset;
        startDiv = range.startContainer;
        if (startDiv.nodeName !== "DIV") {
          startDiv = $(startDiv).parents("div")[0];
        }
        startDivID = startDiv.id;
        endDiv = range.endContainer;
        if (endDiv.nodeName !== "DIV") {
          endDiv = $(endDiv).parents("div")[0];
        }
        endLineID = endDiv.id;
      }
      line = this._lines[startDivID];
      _results = [];
      while (true) {
        switch (line.lineType) {
          case 'Th':
            lineTypeTarget = 'Tu';
            l = line.lineNext;
            while (l !== null && l.lineDepthAbs >= line.lineDepthAbs) {
              switch (l.lineType) {
                case 'Th':
                  l.line$.prop("class", "Tu-" + l.lineDepthAbs);
                  l.lineType = 'Tu';
                  l.lineDepthRel = this._findDepthRel(l);
                  break;
                case 'Lh':
                  l.line$.prop("class", "Lu-" + l.lineDepthAbs);
                  l.lineType = 'Lu';
                  l.lineDepthRel = this._findDepthRel(l);
              }
              l = l.lineNext;
            }
            l = line.linePrev;
            while (l !== null && l.lineDepthAbs >= line.lineDepthAbs) {
              switch (l.lineType) {
                case 'Th':
                  l.line$.prop("class", "Tu-" + l.lineDepthAbs);
                  l.lineType = 'Tu';
                  l.lineDepthRel = this._findDepthRel(l);
                  break;
                case 'Lh':
                  l.line$.prop("class", "Lu-" + l.lineDepthAbs);
                  l.lineType = 'Lu';
                  l.lineDepthRel = this._findDepthRel(l);
              }
              l = l.linePrev;
            }
            break;
          case 'Lh':
          case 'Lu':
            this.tab(line);
            break;
          default:
            lineTypeTarget = false;
        }
        if (lineTypeTarget) {
          line.line$.prop("class", "" + lineTypeTarget + "-" + line.lineDepthAbs);
          line.lineType = lineTypeTarget;
        }
        if (line.lineID === endLineID) {
          break;
        } else {
          _results.push(line = line.lineNext);
        }
      }
      return _results;
    };

    /* ------------------------------------------------------------------------
    # Calculates the relative depth of the line
    #   usage   : cycle : Tu => To => Lx => Th
    #   param   : line : the line we want to find the relative depth
    #   returns : a number
    #
    */


    CNEditor.prototype._findDepthRel = function(line) {
      var linePrev;
      if (line.lineDepthAbs === 1) {
        if (line.lineType[1] === "h") {
          return 0;
        } else {
          return 1;
        }
      } else {
        linePrev = line.linePrev;
        while (linePrev !== null && linePrev.lineDepthAbs >= line.lineDepthAbs) {
          linePrev = linePrev.linePrev;
        }
        if (linePrev !== null) {
          return linePrev.lineDepthRel + 1;
        } else {
          return 0;
        }
      }
    };

    /* ------------------------------------------------------------------------
    # Toggle line type
    #   usage : cycle : Tu => To => Lx => Th
    #   param :
    #       e = event
    */


    CNEditor.prototype._toggleLineType = function() {
      var endContainer, endDiv, endLineID, initialEndOffset, initialStartOffset, l, line, lineTypeTarget, range, sel, startContainer, startDiv, _results;
      sel = this.getEditorSelection();
      range = sel.getRangeAt(0);
      startContainer = range.startContainer;
      endContainer = range.endContainer;
      initialStartOffset = range.startOffset;
      initialEndOffset = range.endOffset;
      startDiv = startContainer;
      if (startDiv.nodeName !== "DIV") {
        startDiv = $(startDiv).parents("div")[0];
      }
      endDiv = endContainer;
      if (endDiv.nodeName !== "DIV") {
        endDiv = $(endDiv).parents("div")[0];
      }
      endLineID = endDiv.id;
      line = this._lines[startDiv.id];
      _results = [];
      while (true) {
        switch (line.lineType) {
          case 'Tu':
            lineTypeTarget = 'Th';
            l = line.lineNext;
            while (l !== null && l.lineDepthAbs >= line.lineDepthAbs) {
              if (l.lineDepthAbs === line.lineDepthAbs) {
                if (l.lineType === 'Tu') {
                  l.line$.prop("class", "Th-" + line.lineDepthAbs);
                  l.lineType = 'Th';
                } else {
                  l.line$.prop("class", "Lh-" + line.lineDepthAbs);
                  l.lineType = 'Lh';
                }
              }
              l = l.lineNext;
            }
            l = line.linePrev;
            while (l !== null && l.lineDepthAbs >= line.lineDepthAbs) {
              if (l.lineDepthAbs === line.lineDepthAbs) {
                if (l.lineType === 'Tu') {
                  l.line$.prop("class", "Th-" + line.lineDepthAbs);
                  l.lineType = 'Th';
                } else {
                  l.line$.prop("class", "Lh-" + line.lineDepthAbs);
                  l.lineType = 'Lh';
                }
              }
              l = l.linePrev;
            }
            break;
          case 'Th':
            lineTypeTarget = 'Tu';
            l = line.lineNext;
            while (l !== null && l.lineDepthAbs >= line.lineDepthAbs) {
              if (l.lineDepthAbs === line.lineDepthAbs) {
                if (l.lineType === 'Th') {
                  l.line$.prop("class", "Tu-" + line.lineDepthAbs);
                  l.lineType = 'Tu';
                } else {
                  l.line$.prop("class", "Lu-" + line.lineDepthAbs);
                  l.lineType = 'Lu';
                }
              }
              l = l.lineNext;
            }
            l = line.linePrev;
            while (l !== null && l.lineDepthAbs >= line.lineDepthAbs) {
              if (l.lineDepthAbs === line.lineDepthAbs) {
                if (l.lineType === 'Th') {
                  l.line$.prop("class", "Tu-" + line.lineDepthAbs);
                  l.lineType = 'Tu';
                } else {
                  l.line$.prop("class", "Lu-" + line.lineDepthAbs);
                  l.lineType = 'Lu';
                }
              }
              l = l.linePrev;
            }
            break;
          default:
            lineTypeTarget = false;
        }
        if (lineTypeTarget) {
          line.line$.prop("class", "" + lineTypeTarget + "-" + line.lineDepthAbs);
          line.lineType = lineTypeTarget;
        }
        if (line.lineID === endDiv.id) {
          break;
        } else {
          _results.push(line = line.lineNext);
        }
      }
      return _results;
    };

    /* ------------------------------------------------------------------------
    # tab keypress
    #   l = optional : a line to indent. If none, the selection will be indented
    */


    CNEditor.prototype.tab = function(l) {
      var endDiv, endLineID, isTabAllowed, line, lineNext, linePrev, linePrevSibling, lineTypeTarget, nextLineType, range, sel, startDiv, _results;
      if (l != null) {
        startDiv = l.line$[0];
        endDiv = startDiv;
      } else {
        sel = this.getEditorSelection();
        range = sel.getRangeAt(0);
        startDiv = range.startContainer;
        endDiv = range.endContainer;
      }
      if (startDiv.nodeName !== "DIV") {
        startDiv = $(startDiv).parents("div")[0];
      }
      if (endDiv.nodeName !== "DIV") {
        endDiv = $(endDiv).parents("div")[0];
      }
      endLineID = endDiv.id;
      line = this._lines[startDiv.id];
      _results = [];
      while (true) {
        switch (line.lineType) {
          case 'Tu':
          case 'Th':
            linePrevSibling = this._findPrevSibling(line);
            if (linePrevSibling === null) {
              isTabAllowed = false;
            } else {
              isTabAllowed = true;
              if (linePrevSibling.lineType === 'Th') {
                lineTypeTarget = 'Lh';
              } else {
                if (linePrevSibling.lineType === 'Tu') {
                  lineTypeTarget = 'Lu';
                } else {
                  lineTypeTarget = 'Lo';
                }
                if (line.lineType === 'Th') {
                  lineNext = line.lineNext;
                  while (lineNext !== null && lineNext.lineDepthAbs > line.lineDepthAbs) {
                    switch (lineNext.lineType) {
                      case 'Th':
                        lineNext.lineType = 'Tu';
                        line.line$.prop("class", "Tu-" + lineNext.lineDepthAbs);
                        nextLineType = prevTxType;
                        break;
                      case 'Tu':
                        nextLineType = 'Lu';
                        break;
                      case 'To':
                        nextLineType = 'Lo';
                        break;
                      case 'Lh':
                        lineNext.lineType = nextLineType;
                        line.line$.prop("class", "" + nextLineType + "-" + lineNext.lineDepthAbs);
                    }
                  }
                }
              }
            }
            break;
          case 'Lh':
          case 'Lu':
          case 'Lo':
            lineNext = line.lineNext;
            lineTypeTarget = null;
            while (lineNext !== null && lineNext.lineDepthAbs >= line.lineDepthAbs) {
              if (lineNext.lineDepthAbs !== line.lineDepthAbs + 1) {
                lineNext = lineNext.lineNext;
              } else {
                lineTypeTarget = lineNext.lineType;
                lineNext = null;
              }
            }
            if (lineTypeTarget === null) {
              linePrev = line.linePrev;
              while (linePrev !== null && linePrev.lineDepthAbs >= line.lineDepthAbs) {
                if (linePrev.lineDepthAbs === line.lineDepthAbs + 1) {
                  lineTypeTarget = linePrev.lineType;
                  linePrev = null;
                } else {
                  linePrev = linePrev.linePrev;
                }
              }
            }
            if (lineTypeTarget === null) {
              isTabAllowed = true;
              lineTypeTarget = 'Tu';
              line.lineDepthAbs += 1;
              line.lineDepthRel += 1;
            } else {
              if (lineTypeTarget === 'Th') {
                isTabAllowed = true;
                line.lineDepthAbs += 1;
                line.lineDepthRel = 0;
              }
              if (lineTypeTarget === 'Tu' || lineTypeTarget === 'To') {
                isTabAllowed = true;
                line.lineDepthAbs += 1;
                line.lineDepthRel += 1;
              }
            }
        }
        if (isTabAllowed) {
          line.line$.prop("class", "" + lineTypeTarget + "-" + line.lineDepthAbs);
          line.lineType = lineTypeTarget;
        }
        if (line.lineID === endLineID) {
          break;
        } else {
          _results.push(line = line.lineNext);
        }
      }
      return _results;
    };

    /* ------------------------------------------------------------------------
    # shift + tab keypress
    #   myRange = if defined, refers to a specific region to untab
    */


    CNEditor.prototype.shiftTab = function(myRange) {
      var endDiv, endLineID, initialEndOffset, initialStartOffset, isTabAllowed, line, lineTypeTarget, nextL, parent, range, sel, startDiv, _results;
      if (myRange != null) {
        range = myRange;
      } else {
        sel = this.getEditorSelection();
        range = sel.getRangeAt(0);
      }
      startDiv = range.startContainer;
      endDiv = range.endContainer;
      initialStartOffset = range.startOffset;
      initialEndOffset = range.endOffset;
      if (startDiv.nodeName !== "DIV") {
        startDiv = $(startDiv).parents("div")[0];
      }
      if (endDiv.nodeName !== "DIV") {
        endDiv = $(endDiv).parents("div")[0];
      }
      endLineID = endDiv.id;
      line = this._lines[startDiv.id];
      _results = [];
      while (true) {
        switch (line.lineType) {
          case 'Tu':
          case 'Th':
          case 'To':
            parent = line.linePrev;
            while (parent !== null && parent.lineDepthAbs >= line.lineDepthAbs) {
              parent = parent.linePrev;
            }
            if (parent !== null) {
              isTabAllowed = true;
              lineTypeTarget = parent.lineType;
              lineTypeTarget = "L" + lineTypeTarget.charAt(1);
              line.lineDepthAbs -= 1;
              line.lineDepthRel -= parent.lineDepthRel;
              if ((line.lineNext != null) && line.lineNext.lineType[0] === 'L') {
                nextL = line.lineNext;
                nextL.lineType = 'T' + nextL.lineType[1];
                nextL.line$.prop('class', "" + nextL.lineType + "-" + nextL.lineDepthAbs);
              }
            } else {
              isTabAllowed = false;
            }
            break;
          case 'Lh':
            isTabAllowed = true;
            lineTypeTarget = 'Th';
            break;
          case 'Lu':
            isTabAllowed = true;
            lineTypeTarget = 'Tu';
            break;
          case 'Lo':
            isTabAllowed = true;
            lineTypeTarget = 'To';
        }
        if (isTabAllowed) {
          line.line$.prop("class", "" + lineTypeTarget + "-" + line.lineDepthAbs);
          line.lineType = lineTypeTarget;
        }
        if (line.lineID === endDiv.id) {
          break;
        } else {
          _results.push(line = line.lineNext);
        }
      }
      return _results;
    };

    /* ------------------------------------------------------------------------
    # return keypress
    #   e = event
    */


    CNEditor.prototype._return = function() {
      var currSel, endLine, endOfLineFragment, newLine, range4sel, startLine;
      this._findLinesAndIsStartIsEnd();
      currSel = this.currentSel;
      startLine = currSel.startLine;
      endLine = currSel.endLine;
      if (currSel.range.collapsed) {

      } else if (endLine === startLine) {
        currSel.range.deleteContents();
      } else {
        this._deleteMultiLinesSelections();
        this._findLinesAndIsStartIsEnd();
        currSel = this.currentSel;
        startLine = currSel.startLine;
      }
      if (currSel.rangeIsEndLine) {
        newLine = this._insertLineAfter({
          sourceLineID: startLine.lineID,
          targetLineType: startLine.lineType,
          targetLineDepthAbs: startLine.lineDepthAbs,
          targetLineDepthRel: startLine.lineDepthRel
        });
        range4sel = rangy.createRange();
        range4sel.collapseToPoint(newLine.line$[0].firstChild, 0);
        return currSel.sel.setSingleRange(range4sel);
      } else if (currSel.rangeIsStartLine) {
        newLine = this._insertLineBefore({
          sourceLineID: startLine.lineID,
          targetLineType: startLine.lineType,
          targetLineDepthAbs: startLine.lineDepthAbs,
          targetLineDepthRel: startLine.lineDepthRel
        });
        range4sel = rangy.createRange();
        range4sel.collapseToPoint(startLine.line$[0].firstChild, 0);
        return currSel.sel.setSingleRange(range4sel);
      } else {
        currSel.range.setEndBefore(startLine.line$[0].lastChild);
        endOfLineFragment = currSel.range.extractContents();
        currSel.range.deleteContents();
        newLine = this._insertLineAfter({
          sourceLineID: startLine.lineID,
          targetLineType: startLine.lineType,
          targetLineDepthAbs: startLine.lineDepthAbs,
          targetLineDepthRel: startLine.lineDepthRel,
          fragment: endOfLineFragment
        });
        range4sel = rangy.createRange();
        range4sel.collapseToPoint(newLine.line$[0].firstChild, 0);
        currSel.sel.setSingleRange(range4sel);
        return this.currentSel = null;
      }
    };

    /* ------------------------------------------------------------------------
    # turn in Th or Lh of the siblings of line (and line itself of course)
    # the children are note modified
    */


    CNEditor.prototype._titilizeSiblings = function(line) {
      var l, lineDepthAbs;
      lineDepthAbs = line.lineDepthAbs;
      l = line;
      while (l !== null && l.lineDepthAbs >= lineDepthAbs) {
        if (l.lineDepthAbs === lineDepthAbs) {
          switch (l.lineType) {
            case 'Tu':
            case 'To':
              l.line$.prop("class", "Th-" + lineDepthAbs);
              l.lineType = 'Th';
              l.lineDepthRel = 0;
              break;
            case 'Lu':
            case 'Lo':
              l.line$.prop("class", "Lh-" + lineDepthAbs);
              l.lineType = 'Lh';
              l.lineDepthRel = 0;
          }
        }
        l = l.lineNext;
      }
      l = line.linePrev;
      while (l !== null && l.lineDepthAbs >= lineDepthAbs) {
        if (l.lineDepthAbs === lineDepthAbs) {
          switch (l.lineType) {
            case 'Tu':
            case 'To':
              l.line$.prop("class", "Th-" + lineDepthAbs);
              l.lineType = 'Th';
              l.lineDepthRel = 0;
              break;
            case 'Lu':
            case 'Lo':
              l.line$.prop("class", "Lh-" + lineDepthAbs);
              l.lineType = 'Lh';
              l.lineDepthRel = 0;
          }
        }
        l = l.linePrev;
      }
      return true;
    };

    /* ------------------------------------------------------------------------
    # find the sibling line of the parent of line that is the first of the list
    # ex :
    #   . Sibling1 <= _findParent1stSibling(line)
    #   . Sibling2
    #   . Parent
    #      . child1
    #      . line     : the line in argument
    # returns null if no previous sibling, the line otherwise
    # the sibling is a title (Th, Tu or To), not a line (Lh nor Lu nor Lo)
    */


    CNEditor.prototype._findParent1stSibling = function(line) {
      var lineDepthAbs, linePrev;
      lineDepthAbs = line.lineDepthAbs;
      linePrev = line.linePrev;
      if (linePrev === null) {
        return line;
      }
      if (lineDepthAbs <= 2) {
        while (linePrev.linePrev !== null) {
          linePrev = linePrev.linePrev;
        }
        return linePrev;
      } else {
        while (linePrev !== null && linePrev.lineDepthAbs > (lineDepthAbs - 2)) {
          linePrev = linePrev.linePrev;
        }
        return linePrev.lineNext;
      }
    };

    /* ------------------------------------------------------------------------
    # find the previous sibling line.
    # returns null if no previous sibling, the line otherwise
    # the sibling is a title (Th, Tu or To), not a line (Lh nor Lu nor Lo)
    */


    CNEditor.prototype._findPrevSibling = function(line) {
      var lineDepthAbs, linePrevSibling;
      lineDepthAbs = line.lineDepthAbs;
      linePrevSibling = line.linePrev;
      if (linePrevSibling === null) {
        return null;
      } else if (linePrevSibling.lineDepthAbs < lineDepthAbs) {
        return null;
      } else {
        while (linePrevSibling.lineDepthAbs > lineDepthAbs) {
          linePrevSibling = linePrevSibling.linePrev;
        }
        while (linePrevSibling.lineType[0] === 'L') {
          linePrevSibling = linePrevSibling.linePrev;
        }
        return linePrevSibling;
      }
    };

    /* ------------------------------------------------------------------------
    # Delete the user multi line selection
    #
    # prerequisite : at least 2 lines must be selected
    # parameters : startLine = first line to be deleted
    #              endLine   = last line to be deleted
    */


    CNEditor.prototype._deleteMultiLinesSelections = function(startLine, endLine) {
      var deltaDepth, deltaDepth1stLine, depthSibling, endLineDepthAbs, endNode, endOfLineFragment, firstLineAfterSiblingsOfDeleted, l, line, myEndLine, newDepth, newText, prevSiblingType, range, range4caret, range4fragment, replaceCaret, startContainer, startFrag, startLineDepthAbs, startNode, startOffset, _ref;
      replaceCaret = true;
      if (startLine !== void 0) {
        replaceCaret = false;
        range = rangy.createRange();
        if (startLine === null) {
          startLine = endLine;
          endLine = endLine.lineNext;
          this._putStartOnStart(range, startLine.line$[0].firstElementChild);
          endLine.line$.prepend('<span></span>');
          this._putEndOnStart(range, endLine.line$[0].firstElementChild);
        } else {
          startNode = startLine.line$[0].lastElementChild.previousElementSibling;
          endNode = endLine.line$[0].lastElementChild.previousElementSibling;
          range.setStartAfter(startNode, 0);
          range.setEndAfter(endNode, 0);
        }
      } else {
        this._findLines();
        range = this.currentSel.range;
        startContainer = range.startContainer;
        startOffset = range.startOffset;
        startLine = this.currentSel.startLine;
        endLine = this.currentSel.endLine;
      }
      endLineDepthAbs = endLine.lineDepthAbs;
      startLineDepthAbs = startLine.lineDepthAbs;
      deltaDepth = endLineDepthAbs - startLineDepthAbs;
      range4fragment = rangy.createRangyRange();
      range4fragment.setStart(range.endContainer, range.endOffset);
      range4fragment.setEndAfter(endLine.line$[0].lastChild);
      endOfLineFragment = range4fragment.cloneContents();
      if (endLine.lineType[1] === 'h' && startLine.lineType[1] !== 'h') {
        if (endLine.lineType[0] === 'L') {
          endLine.lineType = 'T' + endLine.lineType[1];
          endLine.line$.prop("class", "" + endLine.lineType + "-" + endLine.lineDepthAbs);
        }
        this.markerList(endLine);
      }
      range.deleteContents();
      if (startLine.line$[0].lastChild.nodeName === 'BR') {
        startLine.line$[0].removeChild(startLine.line$[0].lastChild);
      }
      startFrag = endOfLineFragment.childNodes[0];
      myEndLine = startLine.line$[0].lastElementChild;
      if (((startFrag.tagName === (_ref = myEndLine.tagName) && _ref === 'SPAN')) && ((!($(startFrag).attr("class") != null) && !($(myEndLine).attr("class") != null)) || ($(startFrag).attr("class") === $(myEndLine).attr("class")))) {
        startOffset = $(myEndLine).text().length;
        newText = $(myEndLine).text() + $(startFrag).text();
        $(myEndLine).text(newText);
        startContainer = myEndLine.firstChild;
        l = 1;
        while (l < endOfLineFragment.childNodes.length) {
          $(endOfLineFragment.childNodes[l]).appendTo(startLine.line$);
          l++;
        }
      } else {
        startLine.line$.append(endOfLineFragment);
      }
      startLine.lineNext = endLine.lineNext;
      if (endLine.lineNext !== null) {
        endLine.lineNext.linePrev = startLine;
      }
      endLine.line$.remove();
      delete this._lines[endLine.lineID];
      line = startLine.lineNext;
      if (line !== null) {
        deltaDepth1stLine = line.lineDepthAbs - startLineDepthAbs;
        if (deltaDepth1stLine >= 1) {
          while (line !== null && line.lineDepthAbs >= endLineDepthAbs) {
            newDepth = line.lineDepthAbs - deltaDepth;
            line.lineDepthAbs = newDepth;
            line.line$.prop("class", "" + line.lineType + "-" + newDepth);
            line = line.lineNext;
          }
        }
      }
      if (line !== null) {
        if (line.lineType[0] === 'L') {
          line.lineType = 'T' + line.lineType[1];
          line.line$.prop("class", "" + line.lineType + "-" + line.lineDepthAbs);
        }
        firstLineAfterSiblingsOfDeleted = line;
        depthSibling = line.lineDepthAbs;
        line = line.linePrev;
        while (line !== null && line.lineDepthAbs > depthSibling) {
          line = line.linePrev;
        }
        if (line !== null) {
          prevSiblingType = line.lineType;
          if (firstLineAfterSiblingsOfDeleted.lineType !== prevSiblingType) {
            if (prevSiblingType[1] === 'h') {
              this._line2titleList(firstLineAfterSiblingsOfDeleted);
            } else {
              this.markerList(firstLineAfterSiblingsOfDeleted);
            }
          }
        }
      }
      if (replaceCaret) {
        range4caret = rangy.createRange();
        range4caret.collapseToPoint(startContainer, startOffset);
        this.currentSel.sel.setSingleRange(range4caret);
        return this.currentSel = null;
      }
    };

    /* ------------------------------------------------------------------------
    # Insert a line after a source line
    # p = 
    #     sourceLineID       : ID of the line after which the line will be added
    #     fragment           : [optionnal] - an html fragment that will be added
    #     targetLineType     : type of the line to add
    #     targetLineDepthAbs : absolute depth of the line to add
    #     targetLineDepthRel : relative depth of the line to add
    */


    CNEditor.prototype._insertLineAfter = function(p) {
      var lineID, newLine, newLine$, sourceLine;
      this._highestId += 1;
      lineID = 'CNID_' + this._highestId;
      newLine$ = $("<div id='" + lineID + "' class='" + p.targetLineType + "-" + p.targetLineDepthAbs + "'></div>");
      if (p.fragment != null) {
        newLine$.append(p.fragment);
        newLine$.append('<br>');
      } else {
        newLine$.append($('<span></span><br>'));
      }
      sourceLine = this._lines[p.sourceLineID];
      newLine$ = newLine$.insertAfter(sourceLine.line$);
      newLine = {
        line$: newLine$,
        lineID: lineID,
        lineType: p.targetLineType,
        lineDepthAbs: p.targetLineDepthAbs,
        lineDepthRel: p.targetLineDepthRel,
        lineNext: sourceLine.lineNext,
        linePrev: sourceLine
      };
      this._lines[lineID] = newLine;
      if (sourceLine.lineNext !== null) {
        sourceLine.lineNext.linePrev = newLine;
      }
      sourceLine.lineNext = newLine;
      return newLine;
    };

    /* ------------------------------------------------------------------------
    # Insert a line before a source line
    # p = 
    #     sourceLineID       : ID of the line before which a line will be added
    #     fragment           : [optionnal] - an html fragment that will be added
    #     targetLineType     : type of the line to add
    #     targetLineDepthAbs : absolute depth of the line to add
    #     targetLineDepthRel : relative depth of the line to add
    */


    CNEditor.prototype._insertLineBefore = function(p) {
      var lineID, newLine, newLine$, sourceLine;
      this._highestId += 1;
      lineID = 'CNID_' + this._highestId;
      newLine$ = $("<div id='" + lineID + "' class='" + p.targetLineType + "-" + p.targetLineDepthAbs + "'></div>");
      if (p.fragment != null) {
        newLine$.append(p.fragment);
        newLine$.append($('<br>'));
      } else {
        newLine$.append($('<span></span><br>'));
      }
      sourceLine = this._lines[p.sourceLineID];
      newLine$ = newLine$.insertBefore(sourceLine.line$);
      newLine = {
        line$: newLine$,
        lineID: lineID,
        lineType: p.targetLineType,
        lineDepthAbs: p.targetLineDepthAbs,
        lineDepthRel: p.targetLineDepthRel,
        lineNext: sourceLine,
        linePrev: sourceLine.linePrev
      };
      this._lines[lineID] = newLine;
      if (sourceLine.linePrev !== null) {
        sourceLine.linePrev.lineNext = newLine;
      }
      sourceLine.linePrev = newLine;
      return newLine;
    };

    /* ------------------------------------------------------------------------
    # Finds :
    #   First and last line of selection. 
    # Remark :
    #   Only the first range of the selections is taken into account.
    # Returns : 
    #   sel : the selection
    #   range : the 1st range of the selections
    #   startLine : the 1st line of the range
    #   endLine : the last line of the range
    */


    CNEditor.prototype._findLines = function() {
      var endContainer, endLine, initialEndOffset, initialStartOffset, range, sel, startContainer, startLine;
      if (this.currentSel === null) {
        sel = this.getEditorSelection();
        range = sel.getRangeAt(0);
        startContainer = range.startContainer;
        endContainer = range.endContainer;
        initialStartOffset = range.startOffset;
        initialEndOffset = range.endOffset;
        if ((endContainer.id != null) && endContainer.id.substr(0, 5) === 'CNID_') {
          endLine = this._lines[endContainer.id];
        } else {
          endLine = this._lines[$(endContainer).parents("div")[0].id];
        }
        if (startContainer.nodeName === 'DIV') {
          startLine = this._lines[startContainer.id];
        } else {
          startLine = this._lines[$(startContainer).parents("div")[0].id];
        }
        return this.currentSel = {
          sel: sel,
          range: range,
          startLine: startLine,
          endLine: endLine,
          rangeIsStartLine: null,
          rangeIsEndLine: null
        };
      }
    };

    /* ------------------------------------------------------------------------
    # Finds :
    #   first and last line of selection 
    #   wheter the selection starts at the beginning of startLine or not
    #   wheter the selection ends at the end of endLine or not
    # 
    # Remark :
    #   Only the first range of the selections is taken into account.
    #
    # Returns : 
    #   sel : the selection
    #   range : the 1st range of the selections
    #   startLine : the 1st line of the range
    #   endLine : the last line of the range
    #   rangeIsEndLine : true if the range ends at the end of the last line
    #   rangeIsStartLine : true if the range starts at the start of 1st line
    */


    CNEditor.prototype._findLinesAndIsStartIsEnd = function() {
      var endContainer, endLine, initialEndOffset, initialStartOffset, nextSibling, parentEndContainer, range, rangeIsEndLine, rangeIsStartLine, sel, startContainer, startLine;
      if (this.currentSel === null) {
        sel = this.getEditorSelection();
        range = sel.getRangeAt(0);
        startContainer = range.startContainer;
        endContainer = range.endContainer;
        initialStartOffset = range.startOffset;
        initialEndOffset = range.endOffset;
        if ((endContainer.id != null) && endContainer.id.substr(0, 5) === 'CNID_') {
          endLine = this._lines[endContainer.id];
          rangeIsEndLine = (endContainer.children.length - 1 === initialEndOffset) || (endContainer.children[initialEndOffset].nodeName === "BR");
        } else {
          endLine = this._lines[$(endContainer).parents("div")[0].id];
          parentEndContainer = endContainer;
          rangeIsEndLine = false;
          if (endContainer.nodeType === Node.TEXT_NODE) {
            rangeIsEndLine = endContainer.nextSibling === void 0 && initialEndOffset === endContainer.textContent.length;
          } else {
            nextSibling = endContainer.nextSibling;
            rangeIsEndLine = endContainer.nodeName === 'BR' || (nextSibling.nodeName === 'BR' && endContainer.childNodes.length === initialEndOffset);
          }
          parentEndContainer = endContainer.parentNode;
          while (rangeIsEndLine && parentEndContainer.nodeName !== "DIV") {
            nextSibling = parentEndContainer.nextSibling;
            rangeIsEndLine = endContainer.nodeName === 'BR' || (nextSibling.nodeName === 'BR' && endContainer.childNodes.length === initialEndOffset);
            parentEndContainer = parentEndContainer.parentNode;
          }
        }
        if (startContainer.nodeName === 'DIV') {
          startLine = this._lines[startContainer.id];
          rangeIsStartLine = initialStartOffset === 0;
        } else {
          startLine = this._lines[$(startContainer).parents("div")[0].id];
          rangeIsStartLine = initialStartOffset === 0;
          while (rangeIsStartLine && parentEndContainer.nodeName !== "DIV") {
            rangeIsStartLine = parentEndContainer.previousSibling === null;
            parentEndContainer = parentEndContainer.parentNode;
          }
        }
        if (endLine.line$[0].innerHTML === "<span></span><br>") {
          rangeIsEndLine = true;
        }
        if (startLine.line$[0].innerHTML === "<span></span><br>") {
          rangeIsStartLine = true;
        }
        return this.currentSel = {
          sel: sel,
          range: range,
          startLine: startLine,
          endLine: endLine,
          rangeIsStartLine: rangeIsStartLine,
          rangeIsEndLine: rangeIsEndLine
        };
      }
    };

    /*  -----------------------------------------------------------------------
    # Parse a raw html inserted in the iframe in order to update the controler
    */


    CNEditor.prototype._readHtml = function() {
      var DeltaDepthAbs, htmlLine, htmlLine$, lineClass, lineDepthAbs, lineDepthAbs_old, lineDepthRel, lineDepthRel_old, lineID, lineID_st, lineNew, lineNext, linePrev, lineType, linesDiv$, _i, _len, _ref;
      linesDiv$ = this.editorBody$.children();
      lineDepthAbs = 0;
      lineDepthRel = 0;
      lineID = 0;
      this._lines = {};
      linePrev = null;
      lineNext = null;
      for (_i = 0, _len = linesDiv$.length; _i < _len; _i++) {
        htmlLine = linesDiv$[_i];
        htmlLine$ = $(htmlLine);
        lineClass = (_ref = htmlLine$.attr('class')) != null ? _ref : "";
        lineClass = lineClass.split('-');
        lineType = lineClass[0];
        if (lineType !== "") {
          lineDepthAbs_old = lineDepthAbs;
          lineDepthAbs = +lineClass[1];
          DeltaDepthAbs = lineDepthAbs - lineDepthAbs_old;
          lineDepthRel_old = lineDepthRel;
          if (lineType === "Th") {
            lineDepthRel = 0;
          } else {
            lineDepthRel = lineDepthRel_old + DeltaDepthAbs;
          }
          lineID = parseInt(lineID, 10) + 1;
          lineID_st = "CNID_" + lineID;
          htmlLine$.prop("id", lineID_st);
          lineNew = {
            line$: htmlLine$,
            lineID: lineID_st,
            lineType: lineType,
            lineDepthAbs: lineDepthAbs,
            lineDepthRel: lineDepthRel,
            lineNext: null,
            linePrev: linePrev
          };
          if (linePrev !== null) {
            linePrev.lineNext = lineNew;
          }
          linePrev = lineNew;
          this._lines[lineID_st] = lineNew;
        }
      }
      return this._highestId = lineID;
    };

    /* ------------------------------------------------------------------------
    # LINES MOTION MANAGEMENT
    # 
    # Functions to perform the motion of an entire block of lines
    # TODO: bug: wrong selection restorations when moving the second line up
    # TODO: correct re-insertion of the line swapped with the block
    */


    CNEditor.prototype._moveLinesDown = function() {
      var cloneLine, line, lineEnd, lineNext, linePrev, lineStart, myRange, numOfUntab, savedSel, sel, _results, _results1;
      this._findLines();
      sel = this.currentSel;
      lineStart = sel.startLine;
      lineEnd = sel.endLine;
      linePrev = lineStart.linePrev;
      lineNext = lineEnd.lineNext;
      if (lineNext !== null) {
        cloneLine = {
          line$: lineNext.line$.clone(),
          lineID: lineNext.lineID,
          lineType: lineNext.lineType,
          lineDepthAbs: lineNext.lineDepthAbs,
          lineDepthRel: lineNext.lineDepthRel,
          linePrev: lineNext.linePrev,
          lineNext: lineNext.lineNext
        };
        savedSel = this.saveEditorSelection();
        this._deleteMultiLinesSelections(lineEnd, lineNext);
        rangy.restoreSelection(savedSel);
        lineNext = cloneLine;
        this._lines[lineNext.lineID] = lineNext;
        lineNext.linePrev = linePrev;
        lineStart.linePrev = lineNext;
        if (lineNext.lineNext !== null) {
          lineNext.lineNext.linePrev = lineEnd;
        }
        lineEnd.lineNext = lineNext.lineNext;
        lineNext.lineNext = lineStart;
        if (linePrev !== null) {
          linePrev.lineNext = lineNext;
        }
        lineStart.line$.before(lineNext.line$);
        if (linePrev === null) {
          return;
        }
        if (lineNext.lineDepthAbs <= linePrev.lineDepthAbs) {
          line = lineNext;
          while (line.lineNext !== null && line.lineNext.lineDepthAbs > lineNext.lineDepthAbs) {
            line = line.lineNext;
          }
          if (line.lineNext !== null) {
            line = line.lineNext;
          }
          myRange = rangy.createRange();
          myRange.setStart(lineNext.lineNext.line$[0], 0);
          myRange.setEnd(line.line$[0], 0);
          numOfUntab = lineNext.lineNext.lineDepthAbs - lineStart.lineDepthAbs;
          if (lineNext.lineNext.lineType[0] === 'T') {
            if (lineStart.lineType[0] === 'T') {
              numOfUntab -= 1;
            } else {
              numOfUntab += 1;
            }
          }
          _results = [];
          while (numOfUntab >= 0) {
            this.shiftTab(myRange);
            _results.push(numOfUntab -= 1);
          }
          return _results;
        } else {
          myRange = rangy.createRange();
          myRange.setStart(lineNext.line$[0], 0);
          myRange.setEnd(lineNext.line$[0], 0);
          numOfUntab = lineStart.lineDepthAbs - lineNext.lineDepthAbs;
          if (lineStart.lineType[0] === 'T') {
            if (linePrev.lineType[0] === 'T') {
              numOfUntab -= 1;
            } else {
              numOfUntab += 1;
            }
          }
          _results1 = [];
          while (numOfUntab >= 0) {
            this.shiftTab(myRange);
            _results1.push(numOfUntab -= 1);
          }
          return _results1;
        }
      }
    };

    /* ------------------------------------------------------------------------
    # _moveLinesUp:
    #
    # -variables:
    #    linePrev
    #    lineStart___________
    #    |.                   The block
    #    |.                   to move up
    #    lineEnd_____________     
    #    lineNext
    #
    # -algorithm:
    #    1.delete linePrev with _deleteMultilinesSelections()
    #    2.insert linePrev between lineEnd and lineNext
    #    3.if linePrev is more indented than lineNext, untab linePrev
    #      until it is ok
    #    4.else (linePrev less indented than lineNext), select the block
    #      (lineNext and some lines below) that is more indented than linePrev
    #      and untab it until it is ok
    */


    CNEditor.prototype._moveLinesUp = function() {
      var cloneLine, isSecondLine, line, lineEnd, lineNext, linePrev, lineStart, myRange, numOfUntab, savedSel, sel, _results, _results1;
      this._findLines();
      sel = this.currentSel;
      lineStart = sel.startLine;
      lineEnd = sel.endLine;
      linePrev = lineStart.linePrev;
      lineNext = lineEnd.lineNext;
      if (linePrev !== null) {
        isSecondLine = linePrev.linePrev === null;
        cloneLine = {
          line$: linePrev.line$.clone(),
          lineID: linePrev.lineID,
          lineType: linePrev.lineType,
          lineDepthAbs: linePrev.lineDepthAbs,
          lineDepthRel: linePrev.lineDepthRel,
          linePrev: linePrev.linePrev,
          lineNext: linePrev.lineNext
        };
        savedSel = this.saveEditorSelection();
        this._deleteMultiLinesSelections(linePrev.linePrev, linePrev);
        rangy.restoreSelection(savedSel);
        if (isSecondLine) {
          $(linePrev.line$[0].firstElementChild).remove();
          linePrev.line$.append('<br>');
          lineStart.line$ = linePrev.line$;
          lineStart.line$.attr('id', lineStart.lineID);
          this._lines[lineStart.lineID] = lineStart;
        }
        linePrev = cloneLine;
        this._lines[linePrev.lineID] = linePrev;
        linePrev.lineNext = lineNext;
        lineEnd.lineNext = linePrev;
        if (linePrev.linePrev !== null) {
          linePrev.linePrev.lineNext = lineStart;
        }
        lineStart.linePrev = linePrev.linePrev;
        linePrev.linePrev = lineEnd;
        if (lineNext !== null) {
          lineNext.linePrev = linePrev;
        }
        lineEnd.line$.after(linePrev.line$);
        if (linePrev.lineDepthAbs <= lineEnd.lineDepthAbs) {
          line = linePrev;
          while (line.lineNext !== null && line.lineNext.lineDepthAbs > linePrev.lineDepthAbs) {
            line = line.lineNext;
          }
          if (line.lineNext !== null) {
            line = line.lineNext;
          }
          myRange = rangy.createRange();
          myRange.setStart(linePrev.lineNext.line$[0], 0);
          myRange.setEnd(line.line$[0], 0);
          numOfUntab = linePrev.lineNext.lineDepthAbs - linePrev.lineDepthAbs;
          if (linePrev.lineNext.lineType[0] === 'T') {
            if (linePrev.lineType[0] === 'T') {
              numOfUntab -= 1;
            } else {
              numOfUntab += 1;
            }
          }
          _results = [];
          while (numOfUntab >= 0) {
            this.shiftTab(myRange);
            _results.push(numOfUntab -= 1);
          }
          return _results;
        } else {
          myRange = rangy.createRange();
          myRange.setStart(linePrev.line$[0], 0);
          myRange.setEnd(linePrev.line$[0], 0);
          numOfUntab = linePrev.lineDepthAbs - lineEnd.lineDepthAbs;
          if (linePrev.lineType[0] === 'T') {
            if (lineEnd.lineType[0] === 'T') {
              numOfUntab -= 1;
            } else {
              numOfUntab += 1;
            }
          }
          _results1 = [];
          while (numOfUntab >= 0) {
            this.shiftTab(myRange);
            _results1.push(numOfUntab -= 1);
          }
          return _results1;
        }
      }
    };

    /* ------------------------------------------------------------------------
    #  HISTORY MANAGEMENT:
    # 1. _addHistory (Add html code and selection markers to the history)
    # 2. undoPossible (Return true only if unDo can be called)
    # 3. redoPossible (Return true only if reDo can be called)
    # 4. unDo (Undo the previous action)
    # 5. reDo ( Redo a undo-ed action)
    #
    # What is saved in the history:
    #  - current html content
    #  - current selection
    #  - current scrollbar position
    */


    CNEditor.prototype._addHistory = function() {
      var savedScroll, savedSel;
      savedSel = this.saveEditorSelection();
      this._history.historySelect.push(savedSel);
      savedScroll = {
        xcoord: this.editorBody$.scrollTop(),
        ycoord: this.editorBody$.scrollLeft()
      };
      this._history.historyScroll.push(savedScroll);
      this._history.history.push(this.editorBody$.html());
      rangy.removeMarkers(savedSel);
      return this._history.index = this._history.history.length - 1;
    };

    CNEditor.prototype.undoPossible = function() {
      return this._history.index > 0;
    };

    CNEditor.prototype.redoPossible = function() {
      return this._history.index < this._history.history.length - 2;
    };

    CNEditor.prototype.unDo = function() {
      var savedSel, xcoord, ycoord;
      if (this.undoPossible()) {
        if (this._history.index === this._history.history.length - 1) {
          this._addHistory();
          this._history.index -= 1;
        }
        this.editorBody$.html(this._history.history[this._history.index]);
        savedSel = this._history.historySelect[this._history.index];
        savedSel.restored = false;
        rangy.restoreSelection(savedSel);
        xcoord = this._history.historyScroll[this._history.index].xcoord;
        ycoord = this._history.historyScroll[this._history.index].ycoord;
        this.editorBody$.scrollTop(xcoord);
        this.editorBody$.scrollLeft(ycoord);
        this._readHtml();
        return this._history.index -= 1;
      }
    };

    CNEditor.prototype.reDo = function() {
      var savedSel, xcoord, ycoord;
      if (this.redoPossible()) {
        this._history.index += 1;
        this.editorBody$.html(this._history.history[this._history.index + 1]);
        savedSel = this._history.historySelect[this._history.index + 1];
        savedSel.restored = false;
        rangy.restoreSelection(savedSel);
        xcoord = this._history.historyScroll[this._history.index + 1].xcoord;
        ycoord = this._history.historyScroll[this._history.index + 1].ycoord;
        this.editorBody$.scrollTop(xcoord);
        this.editorBody$.scrollLeft(ycoord);
        return this._readHtml();
      }
    };

    /* ------------------------------------------------------------------------
    # SUMMARY MANAGEMENT
    # 
    # initialization
    # TODO: avoid updating the summary too often
    #       it would be best to make the update faster (rather than reading
    #       every line)
    */


    CNEditor.prototype._initSummary = function() {
      var summary;
      summary = this.editorBody$.children("#navi");
      if (summary.length === 0) {
        summary = $(document.createElement('div'));
        summary.attr('id', 'navi');
        summary.prependTo(this.editorBody$);
      }
      return summary;
    };

    /*
        # Summary upkeep
    */


    CNEditor.prototype._buildSummary = function() {
      var c, lines, summary, _results;
      summary = this.initSummary();
      this.editorBody$.children("#navi").children().remove();
      lines = this._lines;
      _results = [];
      for (c in lines) {
        if (this.editorBody$.children("#" + ("" + lines[c].lineID)).length > 0 && lines[c].lineType === "Th") {
          _results.push(lines[c].line$.clone().appendTo(summary));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    /* ------------------------------------------------------------------------
    #  DECORATION FUNCTIONS (bold/italic/underlined/quote)
    #  TODO
    */


    /* ------------------------------------------------------------------------
    #  PASTE MANAGEMENT
    # 0 - save selection
    # 1 - move the cursor into an invisible sandbox
    # 2 - redirect pasted content in this sandox
    # 3 - sanitize and adapt pasted content to the editor's format.....TODO
    # 4 - restore selection
    # 5 - insert cleaned content is behind the cursor position.........TODO
    */


    CNEditor.prototype._initClipBoard = function() {
      var clipboard, getOffTheScreen;
      clipboard = this.editorBody$.children("#my-clipboard-sandbox");
      if (clipboard.length === 0) {
        clipboard = $(document.createElement('div'));
        clipboard.attr('contenteditable', true);
        clipboard.attr('display', "none");
        clipboard.html('hello txt');
        clipboard.attr('id', "my-clipboard-sandbox");
        getOffTheScreen = {
          left: -1000,
          top: -1000
        };
        clipboard.offset(getOffTheScreen);
        clipboard.prependTo(this.editorBody$);
      }
      return clipboard[0];
    };

    CNEditor.prototype.paste = function(event) {
      var mySandBox, range, savedSel, sel;
      mySandBox = this._initClipBoard();
      savedSel = this.saveEditorSelection();
      range = rangy.createRange();
      range.selectNodeContents(mySandBox);
      sel = this.getEditorSelection();
      sel.setSingleRange(range);
      if (event && event.clipboardData && event.clipboardData.getData) {
        if (event.clipboardData.types === "text/html") {
          mySandBox.innerHTML = event.clipboardData.getData('text/html');
        } else if (event.clipboardData.types === "text/plain") {
          mySandBox.innerHTML = event.clipboardData.getData('text/plain');
        } else {
          mySandBox.innerHTML = "";
        }
        this._waitForPasteData(mySandBox, this._processPaste, savedSel);
        if (event.preventDefault) {
          event.stopPropagation();
          event.preventDefault();
        }
        return false;
      } else {
        mySandBox.innerHTML = "";
        this._waitForPasteData(mySandBox, this._processPaste, savedSel);
        return true;
      }
    };

    CNEditor.prototype._waitForPasteData = function(sandbox, processpaste, savedSel) {
      var waitforpastedata;
      return (waitforpastedata = function(elem) {
        var that;
        if (elem.childNodes && elem.childNodes.length > 0) {
          rangy.restoreSelection(savedSel);
          return processpaste(sandbox);
        } else {
          that = {
            e: elem
          };
          that.callself = function() {
            return waitforpastedata(that.e);
          };
          return setTimeout(that.callself, 10);
        }
      })(sandbox);
    };

    CNEditor.prototype._processPaste = function(sandbox) {
      var pasteddata;
      pasteddata = sandbox.innerHTML;
      sandbox.innerHTML = "";
      return console.log(pasteddata);
    };

    /* ------------------------------------------------------------------------
    #  MARKUP LANGUAGE CONVERTERS
    # _cozy2md (Read a string of editor html code format and turns it into a
    #           string in markdown format)
    # _md2cozy (Read a string of html code given by showdown and turns it into
    #           a string of editor html code)
    */


    CNEditor.prototype._cozy2md = function(text) {
      var children, classType, converter, currDepth, htmlCode, i, j, l, lineCode, lineElt, markCode, markup, space, _i, _ref;
      htmlCode = $(document.createElement('div')).html(text);
      markCode = '';
      currDepth = 0;
      converter = {
        'A': function(obj) {
          var href, title;
          title = obj.attr('title') != null ? obj.attr('title') : "";
          href = obj.attr('href') != null ? obj.attr('href') : "";
          return '[' + obj.html() + '](' + href + ' "' + title + '")';
        },
        'IMG': function(obj) {
          var alt, src, title;
          title = obj.attr('title') != null ? obj.attr('title') : "";
          alt = obj.attr('alt') != null ? obj.attr('alt') : "";
          src = obj.attr('src') != null ? obj.attr('src') : "";
          return '![' + alt + '](' + src + ' "' + title + '")';
        },
        'SPAN': function(obj) {
          return obj.text();
        }
      };
      markup = {
        'Th': function(blanks, depth) {
          var dieses, i;
          currDepth = depth;
          dieses = '';
          i = 0;
          while (i < depth) {
            dieses += '#';
            i++;
          }
          return "\n" + dieses + ' ';
        },
        'Lh': function(blanks, depth) {
          return "\n";
        },
        'Tu': function(blanks, depth) {
          return "\n" + blanks + "+   ";
        },
        'Lu': function(blanks, depth) {
          return "\n" + blanks + "    ";
        },
        'To': function(blanks, depth) {
          return "\n" + blanks + "1.   ";
        },
        'Lo': function(blanks, depth) {
          return "\n" + blanks + "    ";
        }
      };
      classType = function(className) {
        var blanks, depth, i, tab, type;
        tab = className.split("-");
        type = tab[0];
        depth = parseInt(tab[1], 10);
        blanks = '';
        i = 1;
        while (i < depth - currDepth) {
          blanks += '    ';
          i++;
        }
        return markup[type](blanks, depth);
      };
      children = htmlCode.children();
      for (i = _i = 0, _ref = children.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        lineCode = $(children.get(i));
        if (lineCode.attr('class') != null) {
          markCode += classType(lineCode.attr('class'));
        }
        l = lineCode.children().length;
        j = 0;
        space = ' ';
        while (j < l) {
          lineElt = lineCode.children().get(j);
          if (j + 2 === l) {
            space = '';
          }
          if (lineElt.nodeType === 1 && (converter[lineElt.nodeName] != null)) {
            markCode += converter[lineElt.nodeName]($(lineElt)) + space;
          } else {
            markCode += $(lineElt).text() + space;
          }
          j++;
        }
        markCode += "\n";
      }
      return markCode;
    };

    CNEditor.prototype._md2cozy = function(text) {
      var conv, cozyCode, cozyTurn, depth, htmlCode, id, readHtml, recRead;
      conv = new Showdown.converter();
      text = conv.makeHtml(text);
      htmlCode = $(document.createElement('ul')).html(text);
      cozyCode = '';
      id = 0;
      cozyTurn = function(type, depth, p) {
        var code;
        id++;
        code = '';
        p.contents().each(function() {
          var name;
          name = this.nodeName;
          if (name === "#text") {
            return code += "<span>" + ($(this).text()) + "</span>";
          } else if (this.tagName != null) {
            $(this).wrap('<div></div>');
            code += "" + ($(this).parent().html());
            return $(this).unwrap();
          }
        });
        return ("<div id=CNID_" + id + " class=" + type + "-" + depth + ">") + code + "<br></div>";
      };
      depth = 0;
      readHtml = function(obj) {
        var tag;
        tag = obj[0].tagName;
        if (tag[0] === "H") {
          depth = parseInt(tag[1], 10);
          return cozyCode += cozyTurn("Th", depth, obj);
        } else if (tag === "P") {
          return cozyCode += cozyTurn("Lh", depth, obj);
        } else {
          return recRead(obj, "u");
        }
      };
      recRead = function(obj, status) {
        var child, i, tag, _i, _ref, _results;
        tag = obj[0].tagName;
        if (tag === "UL") {
          depth++;
          obj.children().each(function() {
            return recRead($(this), "u");
          });
          return depth--;
        } else if (tag === "OL") {
          depth++;
          obj.children().each(function() {
            return recRead($(this), "o");
          });
          return depth--;
        } else if (tag === "LI" && (obj.contents().get(0) != null)) {
          if (obj.contents().get(0).nodeName === "#text") {
            obj = obj.clone().wrap('<p></p>').parent();
          }
          _results = [];
          for (i = _i = 0, _ref = obj.children().length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
            child = $(obj.children().get(i));
            if (i === 0) {
              _results.push(cozyCode += cozyTurn("T" + status, depth, child));
            } else {
              _results.push(recRead(child, status));
            }
          }
          return _results;
        } else if (tag === "P") {
          return cozyCode += cozyTurn("L" + status, depth, obj);
        }
      };
      htmlCode.children().each(function() {
        return readHtml($(this));
      });
      return cozyCode;
    };

    return CNEditor;

  })(Backbone.View);
  
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
      this.selectNote = __bind(this.selectNote, this);

      this.onTreeSelectionChg = __bind(this.onTreeSelectionChg, this);

      this.onTreeRemove = __bind(this.onTreeRemove, this);

      this.onNoteTitleChange = __bind(this.onNoteTitleChange, this);

      this.onTreeRename = __bind(this.onTreeRename, this);
      return HomeView.__super__.constructor.apply(this, arguments);
    }

    HomeView.prototype.id = 'home-view';

    /**
    # Load the home view and the tree
    # Called once by the main_router
    */


    HomeView.prototype.initContent = function(note_uuid) {
      var drag, hv, iframeLoaded, onIFrameLoaded, onTreeLoaded, progressBar, progressBarLeftPosition, progressBarTopPosition, treeLoaded,
        _this = this;
      console.log("HomeView.initContent(" + note_uuid + ")");
      this.progressBar = $(".bar");
      progressBar = this.progressBar;
      hv = this;
      iframeLoaded = false;
      treeLoaded = false;
      onTreeLoaded = function() {
        console.log("event HomeView.onTreeLoaded " + iframeLoaded);
        progressBar.css("width", "30%");
        treeLoaded = true;
        if (iframeLoaded) {
          return app.homeView.selectNote(note_uuid);
        }
      };
      onIFrameLoaded = function() {
        console.log("event HomeView.onIFrameLoaded " + iframeLoaded);
        progressBar.css("width", "10%");
        iframeLoaded = true;
        if (treeLoaded) {
          return hv.selectNote(note_uuid);
        }
      };
      $(this.el).html(require('./templates/home'));
      this.noteView = new NoteView(onIFrameLoaded);
      this.noteView.homeView = this;
      this.noteFull = $("#note-full");
      this.noteFull.hide();
      drag = $("#drag");
      $('#home-view').layout({
        size: "250",
        minSize: "250",
        resizable: true,
        spacing_open: 10,
        spacing_closed: 10,
        togglerLength_closed: "100%",
        onresize_end: function() {
          console.log("resize end");
          return drag.css("z-index", "-1");
        }
      });
      $(".ui-layout-resizer").bind('mousedown', function(e) {
        console.log("resize start");
        return drag.css("z-index", "1");
      });
      $(".ui-layout-center").append("<div class='progress progress-striped active'>                <div class='bar' style='width: 0%;'></div>            </div>");
      this.progress = $(".progress");
      progressBarLeftPosition = $(".ui-layout-center").width() / 3 - 77;
      progressBarTopPosition = $(".ui-layout-center").height() / 2;
      this.progress.css("left", progressBarLeftPosition);
      this.progress.css("top", progressBarTopPosition);
      $.get("tree/", function(data) {
        console.log(data);
        window.tree = data;
        return _this.tree = new Tree(_this.$("#nav"), data, {
          onCreate: _this.createFolder,
          onRename: _this.onTreeRename,
          onRemove: _this.onTreeRemove,
          onSelect: _this.onTreeSelectionChg,
          onLoaded: onTreeLoaded,
          onDrop: _this.onNoteDropped
        });
      });
      this.resizeNoteView();
      $(window).resize(this.resizeNoteView);
      return $(window).unload(function() {
        return _this.noteView.saveEditorContent();
      });
    };

    HomeView.prototype.resizeNoteView = function() {
      var windowHeight;
      windowHeight = $(window).height();
      $("#note-style").height(windowHeight - 80);
      return $("#editor").height(windowHeight - 180);
    };

    /**
    Create a new folder of path : 
    Params :
        fullPath : path of the folder
        newName : name of the folder
    */


    HomeView.prototype.createFolder = function(parentId, newName, data) {
      console.log("HomeView.createFolder()");
      return Note.createNote({
        title: newName,
        parent_id: parentId
      }, function(note) {
        data.rslt.obj.data("id", note.id);
        data.rslt.obj.prop("id", note.id);
        data.inst.deselect_all();
        return data.inst.select_node(data.rslt.obj);
      });
    };

    /**
    # Only called by jsTree event "rename.jstree" trigered when a node
    # is renamed.
    # May be called by another note than the currently selected node.
    */


    HomeView.prototype.onTreeRename = function(uuid, newName) {
      var _this = this;
      console.log("HomeView.onTreeRename()");
      if (newName != null) {
        if (this.tree.currentNote_uuid === uuid) {
          this.noteView.setTitle(newName);
          this.noteView.updateBreadcrumbOnTitleChange(newName);
        }
        return Note.updateNote(uuid, {
          title: newName
        }, function() {});
      }
    };

    HomeView.prototype.onNoteTitleChange = function(uuid, newName) {
      var _this = this;
      console.log("HomeView.onNoteTitleChange()");
      if (newName != null) {
        this.tree.jstreeEl.jstree("rename_node", "#" + uuid, newName);
        return Note.updateNote(uuid, {
          title: newName
        }, function() {});
      }
    };

    /**
    # Only called by jsTree event "select_node.jstree"
    # Delete currently selected node.
    */


    HomeView.prototype.onTreeRemove = function(note_uuid) {
      console.log("HomeView.onTreeRemove(" + note_uuid + ")");
      if (this.currentNote && this.currentNote.id === note_uuid) {
        console.log("indirect deletion");
        return this.currentNote.destroy();
      } else {
        console.log("direct request for deletion on server");
        return Note.deleteNote(note_uuid, function() {
          return console.log(arguments);
        });
      }
    };

    /**
    # Only called by jsTree event "select_node"
    # When a node is selected, the note_view is displayed and filled with
    # note data.
    */


    HomeView.prototype.onTreeSelectionChg = function(path, id, data) {
      var progressBar,
        _this = this;
      this.noteView.saveEditorContent();
      progressBar = this.progressBar;
      console.log("HomeView.selectFolder( path:" + path + " - id:" + id + ")");
      if (id === void 0) {
        this.progress.remove();
      } else {
        progressBar.css("width", "70%");
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
          return this.noteFull.hide();
        } else {
          return Note.getNote(id, function(note) {
            _this.renderNote(note, data);
            return _this.noteFull.show();
          });
        }
      } else {
        this.progress.remove();
        return this.noteFull.hide();
      }
    };

    /**
    # Force selection inside tree of note of a given uuid.
    */


    HomeView.prototype.selectNote = function(note_uuid) {
      var progressBar;
      progressBar = this.progressBar;
      console.log("HomeView.selectNote(" + note_uuid + ")");
      progressBar.css("width", "40%");
      if (note_uuid === "all") {
        note_uuid = 'tree-node-all';
      }
      return this.tree.selectNode(note_uuid);
    };

    /**
    # Fill note widget with note data.
    */


    HomeView.prototype.renderNote = function(note, data) {
      var progressBar;
      progressBar = this.progressBar;
      console.log("HomeView.renderNote()");
      progressBar.css("width", "90%");
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
      console.log("HomeView.onNoteDropped() id=" + nodeId + " targetNodeId=" + targetNodeId);
      return Note.updateNote(nodeId, {
        parent_id: targetNodeId
      }, function() {});
    };

    return HomeView;

  })(Backbone.View);
  
}});

window.require.define({"views/note_view": function(exports, require, module) {
  var CNEditor, Note, TreeInst, template,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  template = require('./templates/note');

  CNEditor = require('./editor').CNEditor;

  Note = require('../models/note').Note;

  TreeInst = require('./widgets/tree');

  /**
  model
  homeView
  editorCtrl
  */


  exports.NoteView = (function(_super) {

    __extends(NoteView, _super);

    NoteView.prototype.className = "note-full";

    NoteView.prototype.tagName = "div";

    /* Constructor
    */


    function NoteView(onIFrameLoaded) {
      this.saveEditorContent = __bind(this.saveEditorContent, this);
      console.log("NoteWidget.constructor()");
      this.onIFrameLoaded = onIFrameLoaded;
      NoteView.__super__.constructor.call(this);
    }

    NoteView.prototype.remove = function() {
      return $(this.el).remove();
    };

    NoteView.prototype.initialize = function() {
      var editorCtrl, iframeEditorCallBack, model, noteFullTitle, onIFrameLoaded, saveButton, saveTimer,
        _this = this;
      console.log("NoteWidget.initialize()");
      $("#editor").html(require('./templates/editor'));
      this.model = void 0;
      model = void 0;
      saveTimer = null;
      saveButton = $("#save-editor-content");
      this.saveButton = saveButton;
      onIFrameLoaded = this.onIFrameLoaded;
      iframeEditorCallBack = function() {
        return onIFrameLoaded();
      };
      editorCtrl = new CNEditor($('#editorIframe')[0], iframeEditorCallBack);
      this.editorCtrl = editorCtrl;
      $("#indentBtn").tooltip({
        placement: "bottom",
        title: "Indent the selection"
      });
      $("#indentBtn").on("click", function() {
        editorCtrl._addHistory();
        return editorCtrl.tab();
      });
      $("#unIndentBtn").tooltip({
        placement: "bottom",
        title: "Unindent the selection"
      });
      $("#unIndentBtn").on("click", function() {
        editorCtrl._addHistory();
        return editorCtrl.shiftTab();
      });
      $("#markerListBtn").tooltip({
        placement: "bottom",
        title: "Change selection from titles to marker list"
      });
      $("#markerListBtn").on("click", function() {
        editorCtrl._addHistory();
        return editorCtrl.markerList();
      });
      $("#titleBtn").tooltip({
        placement: "bottom",
        title: "Change selection from marker list to titles"
      });
      $("#titleBtn").on("click", function() {
        editorCtrl._addHistory();
        return editorCtrl.titleList();
      });
      $("#save-editor-content").tooltip({
        placement: "bottom",
        title: "Save the current content"
      });
      /**
      # every keyUp in the note's editor will trigger a countdown of 3s, after
      # 3s and if the user didn't type anything, the content will be saved
      */

      $("iframe").on("onKeyUp", function() {
        var id;
        clearTimeout(_this.saveTimer);
        if (saveButton.hasClass("active")) {
          saveButton.removeClass("active");
        }
        id = _this.model.id;
        return _this.saveTimer = setTimeout(function() {
          Note.updateNote(id, {
            content: editorCtrl.getEditorContent()
          });
          if (!saveButton.hasClass("active")) {
            return saveButton.addClass("active");
          }
        }, 3000);
      });
      /**
      # allow the user to save the content of a note before the 3s of the
      # automatic save
      */

      saveButton.click(this.saveEditorContent);
      this.noteFullTitle = $("#note-full-title");
      noteFullTitle = this.noteFullTitle;
      /**
      # forbidden a new line in the title
      */

      noteFullTitle.live("keypress", function(e) {
        if (e.keyCode === 13) {
          return noteFullTitle.trigger("blur");
        }
      });
      /**
      # allow to rename a note by directly writing in the title
      */

      return noteFullTitle.blur(function() {
        var newName, oldName;
        console.log("event : note-full-title.blur");
        newName = noteFullTitle.val();
        oldName = _this.model.title;
        if (newName !== "" && oldName !== newName) {
          _this.homeView.onNoteTitleChange(_this.model.id, newName);
          _this.homeView.tree._updateSuggestionList("rename", newName, oldName);
          return _this.updateBreadcrumbOnTitleChange(newName);
        }
      });
    };

    /**
    # Stop saving timer if any and force saving of editor content.
    */


    NoteView.prototype.saveEditorContent = function() {
      var id;
      if ((this.model != null) && (this.editorCtrl != null) && (this.saveTimer != null)) {
        clearTimeout(this.saveTimer);
        this.saveTimer = null;
        id = this.model.id;
        Note.updateNote(id, {
          content: this.editorCtrl.getEditorContent()
        });
        return this.saveButton.addClass("active");
      }
    };

    /**
    #
    */


    NoteView.prototype.setModel = function(noteModel, data) {
      this.model = noteModel;
      this.setTitle(noteModel.title);
      this.setContent(noteModel.content);
      return this.createBreadcrumb(noteModel, data);
    };

    /**
    #
    */


    NoteView.prototype.setTitle = function(nTitle) {
      var noteFullTitle;
      noteFullTitle = this.noteFullTitle;
      return noteFullTitle.val(nTitle);
    };

    /**
    #
    */


    NoteView.prototype.setContent = function(content) {
      if (content) {
        return this.editorCtrl.setEditorContent(content);
      } else {
        return this.editorCtrl.deleteContent();
      }
    };

    /**
    # create a breadcrumb showing a clickable way from the root to the current note
    # input: noteModel, contains the informations of the current note
    #  data, allow to reach the id of the parents of the current note
    # output: the breadcrumb html is modified
    */


    NoteView.prototype.createBreadcrumb = function(noteModel, data) {
      var breadcrumb, noteName, parent, path, paths;
      paths = noteModel.path;
      noteName = paths.pop();
      breadcrumb = "";
      parent = this.homeView.tree.jstreeEl.jstree("get_selected");
      while (paths.length > 0) {
        parent = data.inst._get_parent(parent);
        path = "#note/" + parent[0].id + "/";
        noteName = paths.pop();
        breadcrumb = "<a href='" + path + "'> " + noteName + "</a> >" + breadcrumb;
      }
      breadcrumb = "<a href='#note/all'> All</a> >" + breadcrumb;
      return $("#note-full-breadcrumb").html(breadcrumb);
    };

    /**
    # in case of renaming a note this function update the breadcrumb in consequences
    */


    NoteView.prototype.updateBreadcrumbOnTitleChange = function(newName) {
      return $("#note-full-breadcrumb a:last").text(newName);
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
  buf.push('<div id="editor-button-bar" class="btn-group clearfix"><button id="indentBtn" class="btn btn-small"><i class="icon-indent-left"></i></button><button id="unIndentBtn" class="btn btn-small"><i class="icon-indent-right"></i></button><button id="markerListBtn" class="btn btn-small"><i class="icon-th-list"></i></button><button id="titleBtn" class="btn btn-small">Title</button><button id="save-editor-content" class="btn active btn-small"><i class="icon-download-alt"></i></button></div><div id="editor-container"><iframe id="editorIframe"></iframe></div>');
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
  buf.push('<div id="nav1" class="ui-layout-west"><div id="nav" class="well"><div id="tree" tabIndex="2"></div></div></div><div id="note-area" class="ui-layout-center"><div id="note-full" class="well note-full"><div id="note-full-breadcrumb">/</div><div id="note-style"><div><input id="note-full-title"/></div><div id="editor"></div></div></div></div><div id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" class="modal hide fade in"><div class="modal-header"><h3 id="myModalLabel">Warning!</h3></div><div class="modal-body"><p>You are about to delete this note and all its children. Do you want to continue?</p></div><div class="modal-footer"><button id="modal-yes" data-dismiss="modal" aria-hidden="true" class="btn">Yes</button><button data-dismiss="modal" aria-hidden="true" class="btn">No</button></div></div>');
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
  buf.push('<div id="tree-buttons-root"><div id="tree-create-root" class="button"><i class="icon-plus"></i></div></div><div id="tree-buttons"><div id="tree-create" class="button"><i class="icon-plus"></i></div><div id="tree-remove" class="button"><i class="icon-remove"></i></div><div id="tree-rename" class="button"><i class="icon-pencil"></i></div></div><div id="tree-top-buttons"><input id="tree-search-field" type="text" class="span2"/><i id="suppr-button" style="display: none" class="icon-remove-circle"></i></div>');
  }
  return buf.join("");
  };
}});

window.require.define({"views/widgets/tree": function(exports, require, module) {
  var slugify,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  slugify = require("helpers").slugify;

  /* Widget to easily manipulate data tree (navigation for cozy apps)
  Properties :
      currentPath      = ex : /all/coutries/great_britain  ("great_britain" is the uglified name of the note)
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
    #suggestionList is a global array containing all the suggestions for the
    #autocompletion plugin
    #this array contains objects with the nature of the suggestion
    #(folder, tag, search string...) and the string corresponding to the suggestion
    */

    var suggestionList, _sortFunction;

    suggestionList = [];

    /**
    #used by the .sort() method to be efficient with our structure
    */


    _sortFunction = function(a, b) {
      if (a.name > b.name) {
        return 1;
      } else if (a.name === b.name) {
        return 0;
      } else if (a.name < b.name) {
        return -1;
      }
    };

    /**
    #this method update the array suggestionList when the user add, rename or remove
    #a node
    #input: action : neither create, rename or remove,
    #nodeName : in case of create and remove : the name of the new note or the note to remove
    # in case of rename : the new name of the note
    #oldName : only for rename : the name that will be replaced in the note
    #output : suggestionList updated
    */


    Tree.prototype._updateSuggestionList = function(action, nodeName, oldName) {
      var i, object;
      if (action === "create") {
        object = {
          type: "folder",
          name: nodeName
        };
        suggestionList.push(object);
        return suggestionList.sort(_sortFunction);
      } else if (action === "rename") {
        i = 0;
        while (suggestionList[i].name !== oldName) {
          i++;
        }
        suggestionList[i].name = nodeName;
        return suggestionList.sort(_sortFunction);
      } else if (action === "remove") {
        i = 0;
        while (suggestionList[i].name !== nodeName) {
          i++;
        }
        return suggestionList.splice(i, 1);
      }
    };

    /**
    # Initialize jsTree tree with options : sorting, create/rename/delete,
    # unique children and json data for loading.
    # params :
    #   navEl : 
    #   data :
    #   homeViewCbk :
    */


    function Tree(navEl, data, homeViewCbk) {
      this._getSlugPath = __bind(this._getSlugPath, this);

      var jstreeEl, searchField, searchFunction, supprButton, __initSuggestionList, _filterAutocomplete, _selectIcon;
      jstreeEl = $("#tree");
      this.jstreeEl = jstreeEl;
      supprButton = $("#suppr-button");
      this.supprButton = supprButton;
      navEl.prepend(require('../templates/tree_buttons'));
      this.searchField = $("#tree-search-field");
      searchField = this.searchField;
      /**
      # Creation of the jstree
      # jstree is a plugin to implement the node tree
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
            valid_children: "default"
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
      /**
      #Autocompletion
      */

      /*
              #this function allow to select what appears in the suggestion list while
              #the user type something in the search input
              #input : array of suggestions, current string in the search input
              #outputs : an array containing strings corresponding to suggestions 
              #depending on the searchstring
      */

      _filterAutocomplete = function(array, searchString) {
        var char, exp, expBold, expFirst, filtered, filteredFirst, name, nameBold, regSentence, _i, _j, _len, _len1;
        filteredFirst = [];
        filtered = [];
        regSentence = "";
        for (_i = 0, _len = searchString.length; _i < _len; _i++) {
          char = searchString[_i];
          regSentence += ".*(" + char + ")";
        }
        expFirst = new RegExp("^" + searchString, "i");
        expBold = new RegExp("([" + searchString + "])", "gi");
        exp = new RegExp(regSentence, "i");
        for (_j = 0, _len1 = array.length; _j < _len1; _j++) {
          name = array[_j];
          if (expFirst.test(name)) {
            nameBold = name.replace(expBold, function(match, p1) {
              return "<span class='bold-name'>" + p1 + "</span>";
            });
            filteredFirst.push(nameBold);
          }
          if (exp.test(name)) {
            nameBold = name.replace(expBold, function(match, p1) {
              return "<span class='bold-name'>" + p1 + "</span>";
            });
            if (!(__indexOf.call(filteredFirst, nameBold) >= 0)) {
              filtered.push(nameBold);
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
          switch (array[i].type) {
            case "folder":
              return "<i class='icon-folder-open icon-suggestion'></i>";
            default:
              return "";
          }
        }
      };
      /**
      #treat the content of the input and launch the jstree search function
      */

      searchFunction = function(searchString) {
        var string, _i, _len, _ref;
        _ref = $(".text-tag .text-label");
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          string = _ref[_i];
          searchString += "_" + string.innerHTML;
        }
        return jstreeEl.jstree("search", searchString);
      };
      /**
      #Textext plugin is used to implement the autocomplete plugin
      #Please visit http://textextjs.com/ for more information about this plugin
      */

      searchField.textext({
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
            # event that trigger when the content of the input is changing
            */

            onGetFormData: function(e, data, keyCode) {
              var textInput;
              textInput = this.input().val();
              data[0] = {
                'input': textInput,
                'form': textInput
              };
              /**
              # if a tag is deleted the search function is call
              # and if there is no tag anymore, the suppression
              # button is hide
              */

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
            # when the user click on a suggestion (text, bold, icon or blank spot)
            # it add a tag in the input
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
            #changing the content of a tag to avoid the view of 
            #balises in it
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
            #change the render of a tag in case the tag is referring
            #to what the user is typing
            */

            renderTag: function(tag) {
              var node, self;
              self = this;
              node = $(self.opts('html.tag'));
              node.find('.text-label').text(self.itemManager().itemToString(tag));
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
      }).bind('getSuggestions', function(e, data) {
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
      }).bind('isTagAllowed', function(e, data) {
        jstreeEl.css("margin-top", 10);
        supprButton.css("display", "block");
        return searchFunction(data.tag);
      });
      __initSuggestionList = function(node) {
        var c, object, _i, _len, _ref, _results;
        _ref = node.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          object = {
            type: "folder",
            name: c.data
          };
          suggestionList.push(object);
          _results.push(__initSuggestionList(c));
        }
        return _results;
      };
      __initSuggestionList(data);
      suggestionList.sort(_sortFunction);
    }

    /**
    # Bind listeners given in parameters with comment events (creation,
    # update, deletion, selection). Called by the constructor once.
    */


    Tree.prototype.setListeners = function(homeViewCbk) {
      var Tree, jstreeEl, modalAlert, modalYesBtn, progressBar, recursiveRemoveSuggestionList, searchField, supprButton, textPrompt, tree_buttons, tree_buttons_root, tree_buttons_target,
        _this = this;
      Tree = this;
      jstreeEl = this.jstreeEl;
      searchField = this.searchField;
      supprButton = this.supprButton;
      this.progressBar = $(".bar");
      progressBar = this.progressBar;
      tree_buttons = $("#tree-buttons");
      modalAlert = $('#myModal');
      modalYesBtn = $("#modal-yes");
      tree_buttons_root = $("#tree-buttons-root");
      $("#tree-create").tooltip({
        placement: "bottom",
        title: "Add a note"
      });
      $("#tree-create").on("click", function(e) {
        jstreeEl.jstree("create", this.parentElement.parentElement, 0, "New note");
        $(this).tooltip('hide');
        e.stopPropagation();
        return e.preventDefault();
      });
      $("#tree-create-root").tooltip({
        placement: "bottom",
        title: "Add a note"
      });
      $("#tree-create-root").on("click", function(e) {
        jstreeEl.jstree("create", this.parentElement.parentElement, 0, "New note");
        $(this).tooltip('hide');
        e.stopPropagation();
        return e.preventDefault();
      });
      $("#tree-rename").tooltip({
        placement: "bottom",
        title: "Rename a note"
      });
      $("#tree-rename").on("click", function(e) {
        jstreeEl.jstree("rename", this.parentElement.parentElement);
        $(this).tooltip('hide');
        e.preventDefault();
        return e.stopPropagation();
      });
      /**
      # this function remove the sons of a removed node in the suggestion list
      */

      recursiveRemoveSuggestionList = function(nodeToDelete) {
        var node, _i, _len, _ref;
        if (nodeToDelete.children[2] === void 0) {
          return Tree._updateSuggestionList("remove", nodeToDelete.children[1].text.replace(/\s/, ""), null);
        } else {
          _ref = nodeToDelete.children[2].children;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            node = _ref[_i];
            recursiveRemoveSuggestionList(node);
          }
          return Tree._updateSuggestionList("remove", nodeToDelete.children[1].text.replace(/\s/, ""), null);
        }
      };
      $("#tree-remove").tooltip({
        placement: "bottom",
        title: "Remove a note"
      });
      $("#tree-remove").on("click", function(e) {
        var nodeToDelete;
        console.log("event : tree-remove.click");
        $(this).tooltip('hide');
        nodeToDelete = this.parentElement.parentElement.parentElement;
        modalAlert.modal('show');
        modalYesBtn.on("click", function(e) {
          var noteToDelete_id;
          console.log("event : tree-remove.click");
          recursiveRemoveSuggestionList(nodeToDelete);
          noteToDelete_id = nodeToDelete.id;
          if (noteToDelete_id !== 'tree-node-all') {
            jstreeEl.jstree("remove", nodeToDelete);
            homeViewCbk.onRemove(noteToDelete_id);
            return modalYesBtn.focus();
          }
        });
        e.preventDefault();
        return e.stopPropagation();
      });
      searchField.blur(function() {
        return jstreeEl.css("margin-top", 10);
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
      textPrompt = $(".text-prompt");
      supprButton.click(function() {
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
      this.widget.on("create.jstree", function(e, data) {
        var nodeName, parentId;
        console.log("event : create.jstree");
        nodeName = data.inst.get_text(data.rslt.obj);
        _this._updateSuggestionList("create", nodeName, null);
        parentId = data.rslt.parent[0].id;
        return homeViewCbk.onCreate(parentId, data.rslt.name, data);
      });
      this.widget.on("rename.jstree", function(e, data) {
        var newNodeName, oldNodeName;
        console.log("event : rename.jstree");
        newNodeName = data.rslt.new_name;
        oldNodeName = data.rslt.old_name;
        _this._updateSuggestionList("rename", newNodeName, oldNodeName);
        if (oldNodeName !== newNodeName) {
          return homeViewCbk.onRename(data.rslt.obj[0].id, newNodeName);
        }
      });
      this.widget.on("select_node.jstree", function(e, data) {
        var nodeName, note_uuid, parent, path;
        console.log("event : select_node.jstree");
        progressBar.css("width", "60%");
        note_uuid = data.rslt.obj[0].id;
        console.log("note_uuid");
        console.log(note_uuid);
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
        console.log("event : move_node.jstree");
        nodeId = data.rslt.o[0].id;
        targetNodeId = data.rslt.o[0].parentElement.parentElement.id;
        return homeViewCbk.onDrop(nodeId, targetNodeId);
      });
      return this.widget.on("loaded.jstree", function(e, data) {
        console.log("event : loaded.jstree");
        progressBar.css("width", "20%");
        return homeViewCbk.onLoaded();
      });
    };

    /**
    #Select node corresponding to given path
    #if note_uuid exists in the jstree it is selected
    #otherwise if there is no seleted node, we select the root
    */


    Tree.prototype.selectNode = function(note_uuid) {
      var jstreeEl, node, progressBar, tree;
      progressBar = this.progressBar;
      jstreeEl = this.jstreeEl;
      console.log("Tree.selectNode( " + note_uuid + " )");
      progressBar.css("width", "50%");
      node = $("#" + note_uuid);
      if (node[0]) {
        tree = jstreeEl.jstree("deselect_all", null);
        return tree = jstreeEl.jstree("select_node", node);
      } else if (!this.widget.jstree("get_selected")[0]) {
        return tree = jstreeEl.jstree("select_node", "#tree-node-all");
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

