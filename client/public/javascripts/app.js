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
  
}});

window.require.define({"helpers": function(exports, require, module) {
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
  
}});

window.require.define({"initialize": function(exports, require, module) {
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
  
}});

window.require.define({"models/models": function(exports, require, module) {
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
  
}});

window.require.define({"models/note": function(exports, require, module) {
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
  
}});

window.require.define({"routers/main_router": function(exports, require, module) {
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
  
}});

window.require.define({"views/ed_autoTest": function(exports, require, module) {
  (function() {
    var __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    exports.AutoTest = (function(_super) {

      __extends(AutoTest, _super);

      function AutoTest() {
        AutoTest.__super__.constructor.apply(this, arguments);
      }

      /* ------------------------------------------------------------------------
      # Checks whether the lines are well structured or not
      # Some suggestions of what could be checked out:
      #    <> each elt of lines corresponds to a DIV ------------------ (OK)
      #    <> each DIV has a matching elt in lines -------------------- (OK)
      #    <> type and depth are coherent ----------------------------- (OK)
      #    <> linePrev and LineNext are linked to the correct DIV ----- (OK)
      #    <> hierarchy of lines and indentation are okay ------------- (OK)
      #    <> a DIV contains a sequence of SPAN ended by a BR --------- (OK)
      #    <> two successive SPAN can't have the same class ----------- (OK)
      #    <> empty SPAN are really empty (<span></span>) ------------- (huh?)
      #    <> a note must  have at least one line --------------------- (todo)
      */

      AutoTest.prototype.checkLines = function(CNEditor) {
        var child, children, currentLine, depth, element, i, id, lastClass, myAncestor, newNode, nextLine, node, nodeType, objDiv, possibleSon, prevLine, recVerif, root, rootLine, success, type;
        console.log('Detecting incoherences...');
        possibleSon = {
          "Th": function(name) {
            return name === "Lh" || name === "Th" || name === "To" || name === "Tu";
          },
          "Tu": function(name) {
            return name === "Lu" || name === "To" || name === "Tu";
          },
          "To": function(name) {
            return name === "Lo" || name === "To" || name === "Tu";
          },
          "Lh": function(name) {
            return false;
          },
          "Lu": function(name) {
            return false;
          },
          "Lo": function(name) {
            return false;
          },
          "root": function(name) {
            return true;
          }
        };
        nodeType = function(name) {
          if (name === "Lh" || name === "Lu" || name === "Lo") {
            return "L";
          } else if (name === "Th" || name === "Tu" || name === "To") {
            return "T";
          } else {
            return "ERR";
          }
        };
        id = function(line) {
          if (line === null) {
            return -1;
          } else {
            return parseInt(line.lineID.split("_")[1], 10);
          }
        };
        rootLine = {
          lineType: "root",
          lineID: "CNID_0",
          lineNext: CNEditor._lines["CNID_1"],
          linePrev: null,
          lineDepthAbs: 0
        };
        node = function(line, sons) {
          return {
            line: line,
            sons: sons
          };
        };
        root = new node(rootLine, []);
        myAncestor = [root];
        prevLine = null;
        currentLine = rootLine;
        nextLine = rootLine.lineNext;
        while (nextLine !== null) {
          type = nodeType(nextLine.lineType);
          depth = nextLine.lineDepthAbs;
          element = CNEditor.editorBody$.children("#" + nextLine.lineID);
          if (element === null) {
            console.log("ERROR: invalid line " + nextLine.lineID + "\n (" + nextLine.lineType + "-" + nextLine.lineDepthAbs + " has no matching DIV)");
            return;
          }
          children = element.children();
          if (children === null || children.length < 2) {
            console.log("ERROR: invalid line " + nextLine.lineID + "\n (" + nextLine.lineType + "-" + nextLine.lineDepthAbs + " content is too short)");
            return;
          }
          lastClass = void 0;
          i = 0;
          while (i < children.length - 1) {
            child = children.get(i);
            if (child.nodeName === 'SPAN') {
              if ($(child).attr('class') != null) {
                if (lastClass === $(child).attr('class')) {
                  console.log("ERROR: invalid line " + nextLine.lineID + "\n (" + nextLine.lineType + "-" + nextLine.lineDepthAbs + " two consecutive SPAN with same class " + lastClass + ")");
                  return;
                } else {
                  lastClass = $(child).attr('class');
                }
              }
            } else if (child.nodeName === 'A' || child.nodeName === 'IMG') {
              lastClass = void 0;
            } else {
              console.log("ERROR: invalid line " + nextLine.lineID + "\n (" + nextLine.lineType + "-" + nextLine.lineDepthAbs + " invalid label " + child.nodeName + ")");
              return;
            }
            i++;
          }
          child = children.get(children.length - 1);
          if (child.nodeName !== 'BR') {
            console.log("ERROR: invalid line " + nextLine.lineID + "\n (" + nextLine.lineType + "-" + nextLine.lineDepthAbs + " must end with BR)");
            return;
          }
          newNode = new node(nextLine, []);
          if (type === "T") {
            if (depth > myAncestor.length) {
              console.log("ERROR: invalid line " + nextLine.lineID + "\n (" + nextLine.lineType + "-" + nextLine.lineDepthAbs + " indentation issue)");
              return;
            } else if (depth === myAncestor.length) {
              myAncestor.push(newNode);
            } else {
              myAncestor[depth] = newNode;
            }
            if (myAncestor[depth - 1] === null) {
              console.log("ERROR: invalid line " + nextLine.lineID);
              return;
            } else {
              myAncestor[depth - 1].sons.push(newNode);
            }
          } else if (type === "L") {
            if (depth >= myAncestor.length) {
              console.log("ERROR: invalid line " + nextLine.lineID + "\n (" + nextLine.lineType + "-" + nextLine.lineDepthAbs + " indentation issue)");
              return;
            } else {
              myAncestor[depth + 1] = null;
            }
            if (myAncestor[depth] === null) {
              console.log("ERROR: invalid line " + nextLine.lineID);
              return;
            } else {
              myAncestor[depth].sons.push(newNode);
            }
          }
          prevLine = currentLine;
          currentLine = nextLine;
          nextLine = currentLine.lineNext;
        }
        objDiv = CNEditor.editorBody$.children("div");
        objDiv.each(function() {
          var myId;
          if ($(this).attr('id') != null) {
            myId = $(this).attr('id');
            if (/CNID_[0-9]+/.test(myId)) {
              if (!(CNEditor._lines[myId] != null)) {
                console.log("ERROR: missing line " + myId);
              }
            }
          }
        });
        recVerif = function(node) {
          var i, _ref;
          if (node.sons.length > 0) {
            for (i = 0, _ref = node.sons.length - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
              child = node.sons[i];
              if (!possibleSon[node.line.lineType](child.line.lineType)) {
                console.log("ERROR: invalid line " + child.line.lineID + "\n (hierarchic issue of a " + child.line.lineType + "-" + child.line.lineDepthAbs + ")");
                return false;
              }
              if (nodeType(child.line.lineType) === "T") {
                if (node.line.lineDepthAbs + 1 !== child.line.lineDepthAbs) {
                  console.log("ERROR: invalid line " + child.line.lineID + "\n (indentation issue of a " + child.line.lineType + "-" + child.line.lineDepthAbs + ")");
                  return false;
                }
                if (!recVerif(child)) return false;
              } else if (nodeType(child.line.lineType) === "L") {
                if (node.line.lineDepthAbs !== child.line.lineDepthAbs) {
                  console.log("ERROR: invalid line " + child.line.lineID + "\n (indentation issue of a " + child.line.lineType + "-" + child.line.lineDepthAbs + ")");
                  return false;
                }
              }
            }
          }
          return true;
        };
        success = recVerif(root);
        if (success) console.log("everything seems ok !");
        return success;
      };

      return AutoTest;

    })(Backbone.View);

  }).call(this);
  
}});

window.require.define({"views/ed_beautify": function(exports, require, module) {
  (function() {
    var any, read_settings_from_cookie, store_settings_to_cookie, the, unpacker_filter;

    any = function(a, b) {
      return a || b;
    };

    read_settings_from_cookie = function() {
      $("#tabsize").val(any($.cookie("tabsize"), "4"));
      $("#brace-style").val(any($.cookie("brace-style"), "collapse"));
      $("#detect-packers").attr("checked", $.cookie("detect-packers") !== "off");
      $("#preserve-newlines").attr("checked", $.cookie("preserve-newlines") !== "off");
      $("#keep-array-indentation").attr("checked", $.cookie("keep-array-indentation") === "on");
      $("#indent-scripts").val(any($.cookie("indent-scripts"), "normal"));
      return $("#space-before-conditional").attr("checked", $.cookie("space-before-conditional") !== "off");
    };

    store_settings_to_cookie = function() {
      var opts;
      opts = {
        expires: 360
      };
      $.cookie("tabsize", $("#tabsize").val(), opts);
      $.cookie("brace-style", $("#brace-style").val(), opts);
      $.cookie("detect-packers", ($("#detect-packers").attr("checked") ? "on" : "off"), opts);
      $.cookie("preserve-newlines", ($("#preserve-newlines").attr("checked") ? "on" : "off"), opts);
      $.cookie("keep-array-indentation", ($("#keep-array-indentation").attr("checked") ? "on" : "off"), opts);
      $.cookie("space-before-conditional", ($("#space-before-conditional").attr("checked") ? "on" : "off"), opts);
      return $.cookie("indent-scripts", $("#indent-scripts").val(), opts);
    };

    unpacker_filter = function(source) {
      var comment, found, trailing_comments, _results;
      trailing_comments = "";
      comment = "";
      found = false;
      _results = [];
      while (true) {
        found = false;
        if (/^\s*\/\*/.test(source)) {
          found = true;
          comment = source.substr(0, source.indexOf("*/") + 2);
          source = source.substr(comment.length).replace(/^\s+/, "");
          trailing_comments += comment + "\n";
        } else if (/^\s*\/\//.test(source)) {
          found = true;
          comment = source.match(/^\s*\/\/.*/)[0];
          source = source.substr(comment.length).replace(/^\s+/, "");
          trailing_comments += comment + "\n";
        }
        if (!found) {
          break;
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    exports.beautify = function(ed$) {
      var brace_style, comment_mark, indent_char, indent_scripts, indent_size, keep_array_indentation, opts, preserve_newlines, source, space_before_conditional;
      if (the.beautify_in_progress) return;
      the.beautify_in_progress = true;
      source = ed$.html();
      indent_size = $("#tabsize").val();
      indent_char = (indent_size === 1 ? "\t" : " ");
      preserve_newlines = $("#preserve-newlines").attr("checked");
      keep_array_indentation = $("#keep-array-indentation").attr("checked");
      indent_scripts = $("#indent-scripts").val();
      brace_style = $("#brace-style").val();
      space_before_conditional = $("#space-before-conditional").attr("checked");
      if ($("#detect-packers").attr("checked")) source = unpacker_filter(source);
      comment_mark = "<-" + "-";
      opts = {
        indent_size: 4,
        indent_char: " ",
        preserve_newlines: true,
        brace_style: "collapse",
        keep_array_indentation: false,
        space_after_anon_function: true,
        space_before_conditional: true,
        indent_scripts: "normal"
      };
      if (source && source[0] === "<" && source.substring(0, 4) !== comment_mark) {
        $("#resultText").val(style_html(source, opts));
      } else {
        $("#resultText").val(js_beautify(unpacker_filter(source), opts));
      }
      return the.beautify_in_progress = false;
    };

    the = {
      beautify_in_progress: false
    };

  }).call(this);
  
}});

window.require.define({"views/ed_cozyToMarkdown": function(exports, require, module) {
  (function() {
    var __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    exports.CNcozyToMarkdown = (function(_super) {

      __extends(CNcozyToMarkdown, _super);

      function CNcozyToMarkdown() {
        CNcozyToMarkdown.__super__.constructor.apply(this, arguments);
      }

      CNcozyToMarkdown.prototype.translate = function(text) {
        var children, classType, converter, currDepth, htmlCode, i, j, l, lineCode, lineElt, markCode, markup, space, _ref;
        htmlCode = $(document.createElement('div')).html(text);
        markCode = '';
        currDepth = 1;
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
        for (i = 0, _ref = children.length - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
          lineCode = $(children.get(i));
          if (lineCode.attr('class') != null) {
            markCode += classType(lineCode.attr('class'));
          }
          l = lineCode.children().length;
          j = 0;
          space = ' ';
          while (j < l) {
            lineElt = lineCode.children().get(j);
            if (j + 2 === l) space = '';
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

      return CNcozyToMarkdown;

    })(Backbone.View);

  }).call(this);
  
}});

window.require.define({"views/ed_editor": function(exports, require, module) {
  
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
  #   replaceContent    : (htmlContent) ->  # TODO : replace with markdown
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

  (function() {
    var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    exports.CNEditor = (function(_super) {

      __extends(CNEditor, _super);

      /*
          #   Constructor : newEditor = new CNEditor( iframeTarget,callBack )
          #       iframeTarget = iframe where the editor will be nested
          #       callBack     = launched when editor ready, the context 
          #                      is set to the editorCtrl (callBack.call(this))
      */

      function CNEditor(iframeTarget, callBack) {
        this._keyPressListener = __bind(this._keyPressListener, this);
        var iframe$,
          _this = this;
        iframe$ = $(iframeTarget);
        iframe$.on('load', function() {
          var editorBody$, editor_css$, editor_head$, editor_html$;
          editor_html$ = iframe$.contents().find("html");
          editorBody$ = editor_html$.find("body");
          editorBody$.parent().attr('id', '__ed-iframe-html');
          editorBody$.attr("contenteditable", "true");
          editorBody$.attr("id", "__ed-iframe-body");
          editor_head$ = editor_html$.find("head");
          editor_css$ = editor_head$.html('<link href="stylesheets/app.css" \
                                                 rel="stylesheet">');
          _this.editorBody$ = editorBody$;
          _this.editorIframe = iframe$[0];
          _this._lines = {};
          _this._highestId = 0;
          _this._deepest = 1;
          _this._firstLine = null;
          editorBody$.prop('__editorCtl', _this);
          editorBody$.on('keypress', _this._keyPressListener);
          callBack.call(_this);
          return _this;
        });
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
      # TODO : initialize the editor content from a markdown string
      # ok... now how do I load a .md file?
      # Initialize the editor content from a html string
      */

      CNEditor.prototype.replaceContent = function(htmlContent) {
        this.editorBody$.html(htmlContent);
        this._readHtml();
        return this.buildSummary();
      };

      /*
          # Change the path of the css applied to the editor iframe
      */

      CNEditor.prototype.replaceCSS = function(path) {
        return $(this.editorIframe).contents().find("link[rel=stylesheet]").attr({
          href: path
        });
      };

      CNEditor.prototype.putEndOnEnd = function(range, elt) {
        var offset;
        if (elt.firstChild != null) {
          offset = $(elt.firstChild).text().length;
          return range.setEnd(elt.firstChild, offset);
        } else {
          return range.setEnd(elt, 0);
        }
      };

      CNEditor.prototype.putStartOnEnd = function(range, elt) {
        var offset;
        if (elt.firstChild != null) {
          offset = $(elt.firstChild).text().length;
          return range.setStart(elt.firstChild, offset);
        } else {
          return range.setStart(elt, 0);
        }
      };

      CNEditor.prototype.putStartOnStart = function(range, elt) {
        if (elt.firstChild != null) {
          return range.setStart(elt.firstChild, 0);
        } else {
          return range.setStart(elt, 0);
        }
      };

      CNEditor.prototype.normalize = function(range) {
        var elt, endContainer, next, prev, startContainer, _ref, _ref2;
        startContainer = range.startContainer;
        if (startContainer.nodeName === "DIV") {
          elt = startContainer.lastChild.previousElementSibling;
          this.putStartOnEnd(range, elt);
        } else if ((_ref = !startContainer.parentNode) === "SPAN" || _ref === "IMG" || _ref === "A") {
          next = startContainer.nextElementSibling;
          prev = startContainer.previousElementSibling;
          if (next !== null) {
            this.putStartOnStart(range, next);
          } else {
            this.putEndOnEnd(range, prev);
          }
        }
        endContainer = range.endContainer;
        if (endContainer.nodeName === "DIV") {
          elt = endContainer.lastChild.previousElementSibling;
          return this.putEndOnEnd(range, elt);
        } else if ((_ref2 = !endContainer.parentNode) === "SPAN" || _ref2 === "IMG" || _ref2 === "A") {
          next = endContainer.nextElementSibling;
          prev = endContainer.previousElementSibling;
          if (next !== null) {
            return this.putStartOnStart(range, next);
          } else {
            return this.putEndOnEnd(range, prev);
          }
        }
      };

      /* ------------------------------------------------------------------------
      #    The listner of keyPress event on the editor's iframe... the king !
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
        var i, keyStrokesCode, metaKeyStrokesCode, num, range, sel, shortcut, _ref;
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
              default:
                keyStrokesCode = e.which;
            }
        }
        shortcut = metaKeyStrokesCode + '-' + keyStrokesCode;
        if ((keyStrokesCode === "left" || keyStrokesCode === "up" || keyStrokesCode === "right" || keyStrokesCode === "down" || keyStrokesCode === "pgUp" || keyStrokesCode === "pgDwn" || keyStrokesCode === "end" || keyStrokesCode === "home") && (shortcut !== 'CtrlShift-down' && shortcut !== 'CtrlShift-up')) {
          this.newPosition = true;
          $("#editorPropertiesDisplay").text("newPosition = true");
        } else {
          if (this.newPosition) {
            this.newPosition = false;
            $("#editorPropertiesDisplay").text("newPosition = false");
            sel = rangy.getIframeSelection(this.editorIframe);
            num = sel.rangeCount;
            if (num > 0) {
              for (i = 0, _ref = num - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
                range = sel.getRangeAt(i);
                this.normalize(range);
              }
            }
          }
        }
        this.currentSel = null;
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
            this.moveLinesDown();
            return e.preventDefault();
          case "CtrlShift-up":
            this.moveLinesUp();
            return e.preventDefault();
          case "Shift-tab":
            this.shiftTab();
            return e.preventDefault();
          case "Alt-97":
            this._toggleLineType();
            return e.preventDefault();
          case "Ctrl-118":
            return e.preventDefault();
          case "Ctrl-115":
            return e.preventDefault();
        }
      };

      /* ------------------------------------------------------------------------
      #  Manage deletions when suppr key is pressed
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
        sel = rangy.getIframeSelection(this.editorIframe);
        range = sel.getRangeAt(0);
        startContainer = range.startContainer;
        endContainer = range.endContainer;
        initialStartOffset = range.startOffset;
        initialEndOffset = range.endOffset;
        startDiv = startContainer;
        if (startDiv.nodeName !== "DIV") startDiv = $(startDiv).parents("div")[0];
        endDiv = endContainer;
        if (endDiv.nodeName !== "DIV") endDiv = $(endDiv).parents("div")[0];
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
        var endContainer, endDiv, endLineID, initialEndOffset, initialStartOffset, line, lineTypeTarget, range, startDiv, startDivID, _results;
        if (l != null) {
          startDivID = l.lineID;
          endLineID = startDivID;
        } else {
          range = rangy.getIframeSelection(this.editorIframe).getRangeAt(0);
          endContainer = initialStartOffset = range.startOffset;
          initialEndOffset = range.endOffset;
          startDiv = range.startContainer;
          if (startDiv.nodeName !== "DIV") startDiv = $(startDiv).parents("div")[0];
          startDivID = startDiv.id;
          endDiv = range.endContainer;
          if (endDiv.nodeName !== "DIV") endDiv = $(endDiv).parents("div")[0];
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
          while (linePrev.lineDepthAbs >= line.lineDepthAbs) {
            linePrev = linePrev.linePrev;
          }
          return linePrev.lineDepthRel + 1;
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
        sel = rangy.getIframeSelection(this.editorIframe);
        range = sel.getRangeAt(0);
        startContainer = range.startContainer;
        endContainer = range.endContainer;
        initialStartOffset = range.startOffset;
        initialEndOffset = range.endOffset;
        startDiv = startContainer;
        if (startDiv.nodeName !== "DIV") startDiv = $(startDiv).parents("div")[0];
        endDiv = endContainer;
        if (endDiv.nodeName !== "DIV") endDiv = $(endDiv).parents("div")[0];
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
          sel = rangy.getIframeSelection(this.editorIframe);
          range = sel.getRangeAt(0);
          startDiv = range.startContainer;
          endDiv = range.endContainer;
        }
        if (startDiv.nodeName !== "DIV") startDiv = $(startDiv).parents("div")[0];
        if (endDiv.nodeName !== "DIV") endDiv = $(endDiv).parents("div")[0];
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
      #   e = event
      */

      CNEditor.prototype.shiftTab = function() {
        var endDiv, endLineID, initialEndOffset, initialStartOffset, isTabAllowed, line, lineTypeTarget, nextL, parent, range, sel, startDiv, _results;
        sel = rangy.getIframeSelection(this.editorIframe);
        range = sel.getRangeAt(0);
        startDiv = range.startContainer;
        endDiv = range.endContainer;
        initialStartOffset = range.startOffset;
        initialEndOffset = range.endOffset;
        if (startDiv.nodeName !== "DIV") startDiv = $(startDiv).parents("div")[0];
        if (endDiv.nodeName !== "DIV") endDiv = $(endDiv).parents("div")[0];
        endLineID = endDiv.id;
        line = this._lines[startDiv.id];
        _results = [];
        while (true) {
          switch (line.lineType) {
            case 'Tu':
            case 'Th':
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
                if (line.lineNext.lineType[0] === 'L') {
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
        if (currSel.range.collapsed) {} else if (endLine === startLine) {
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
          range4sel.collapseToPoint(newLine.line$[0].firstChild.childNodes[0], 0);
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
      #   . Sibling1  <= _findParent1stSibling(line)
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
        if (linePrev === null) return line;
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
      #   delete the user multi line selection
      #
      #   prerequisite : at least 2 lines must be selected
      # 
      #   parameters :
      #        :
      #
      */

      CNEditor.prototype._deleteMultiLinesSelections = function(startLine, endLine) {
        var deltaDepth, deltaDepth1stLine, depthSibling, endLineDepthAbs, endOfLineFragment, firstLineAfterSiblingsOfDeleted, l, line, myEndLine, newDepth, newText, prevSiblingType, range, range4caret, range4fragment, startContainer, startFrag, startLineDepthAbs, startOffset, _ref;
        if (startLine !== void 0) {
          range = rangy.createRange();
          range.setStartBefore(startLine.line$);
          range.setStartAfter(endLine.line$);
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
        if (endLine.lineNext !== null) endLine.lineNext.linePrev = startLine;
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
          prevSiblingType = line.lineType;
          if (firstLineAfterSiblingsOfDeleted.lineType !== prevSiblingType) {
            if (prevSiblingType[1] === 'h') {
              this._line2titleList(firstLineAfterSiblingsOfDeleted);
            } else {
              this.markerList(firstLineAfterSiblingsOfDeleted);
            }
          }
        }
        range4caret = rangy.createRange();
        range4caret.collapseToPoint(startContainer, startOffset);
        this.currentSel.sel.setSingleRange(range4caret);
        return this.currentSel = null;
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
        if (sourceLine.lineNext !== null) sourceLine.lineNext.linePrev = newLine;
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
        if (sourceLine.linePrev !== null) sourceLine.linePrev.lineNext = newLine;
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
          sel = rangy.getIframeSelection(this.editorIframe);
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
      #   rangeIsStartLine : turu if the range starts at the start of 1st line
      */

      CNEditor.prototype._findLinesAndIsStartIsEnd = function() {
        var endContainer, endLine, initialEndOffset, initialStartOffset, nextSibling, parentEndContainer, range, rangeIsEndLine, rangeIsStartLine, sel, startContainer, startLine;
        if (this.currentSel === null) {
          sel = rangy.getIframeSelection(this.editorIframe);
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
            if (parentEndContainer.nodeType === Node.TEXT_NODE) {
              rangeIsEndLine = initialEndOffset === parentEndContainer.textContent.length;
            } else {
              nextSibling = parentEndContainer.nextSibling;
              rangeIsEndLine = nextSibling === null || nextSibling.nodeName === 'BR';
            }
            parentEndContainer = endContainer.parentNode;
            while (rangeIsEndLine && parentEndContainer.nodeName !== "DIV") {
              nextSibling = parentEndContainer.nextSibling;
              rangeIsEndLine = nextSibling === null || nextSibling.nodeName === 'BR';
              parentEndContainer = parentEndContainer.parentNode;
            }
          }
          if (startContainer.nodeName === 'DIV') {
            startLine = this._lines[startContainer.id];
            rangeIsStartLine = initialStartOffset === 0;
            if (initialStartOffset === 1 && startContainer.innerHTML === "<span></span><br>") {
              rangeIsStartLine = true;
            }
          } else {
            startLine = this._lines[$(startContainer).parents("div")[0].id];
            rangeIsStartLine = initialStartOffset === 0;
            while (rangeIsStartLine && parentEndContainer.nodeName !== "DIV") {
              rangeIsStartLine = parentEndContainer.previousSibling === null;
              parentEndContainer = parentEndContainer.parentNode;
            }
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
            if (linePrev !== null) linePrev.lineNext = lineNew;
            linePrev = lineNew;
            this._lines[lineID_st] = lineNew;
          }
        }
        return this._highestId = lineID;
      };

      CNEditor.prototype.moveLinesDown = function() {
        var lineEnd, lineNext, linePrev, lineStart, sel;
        this._findLinesAndIsStartIsEnd();
        sel = this.currentSel;
        lineStart = sel.startLine;
        lineEnd = sel.endLine;
        linePrev = lineStart.linePrev;
        lineNext = lineEnd.lineNext;
        if (lineNext !== null) {
          lineNext.linePrev = linePrev;
          lineStart.linePrev = lineNext;
          if (lineNext.lineNext !== null) lineNext.lineNext.linePrev = lineEnd;
          lineEnd.lineNext = lineNext.lineNext;
          lineNext.lineNext = lineStart;
          if (linePrev !== null) linePrev.lineNext = lineNext;
          lineStart.line$.before(lineNext.line$);
          if (lineStart.linePrev !== null) {
            lineStart.line$.attr('class', lineStart.linePrev.line$.attr('class'));
            lineStart.lineType = lineStart.linePrev.lineType;
            lineStart.lineDepthAbs = lineStart.linePrev.lineDepthAbs;
            return lineStart.lineDepthRel = lineStart.linePrev.lineDepthRel;
          }
        }
      };

      CNEditor.prototype.moveLinesUp = function() {
        var lineEnd, lineNext, linePrev, lineStart, sel;
        this._findLinesAndIsStartIsEnd();
        sel = this.currentSel;
        lineStart = sel.startLine;
        lineEnd = sel.endLine;
        linePrev = lineStart.linePrev;
        lineNext = lineEnd.lineNext;
        if (linePrev !== null) {
          linePrev.lineNext = lineNext;
          lineEnd.lineNext = linePrev;
          if (linePrev.linePrev !== null) linePrev.linePrev.lineNext = lineStart;
          lineStart.linePrev = linePrev.linePrev;
          linePrev.linePrev = lineEnd;
          if (lineNext !== null) lineNext.linePrev = linePrev;
          lineEnd.line$.after(linePrev.line$);
          if (lineStart.linePrev !== null) {
            lineStart.line$.attr('class', lineStart.linePrev.line$.attr('class'));
            lineStart.lineType = lineStart.linePrev.lineType;
            lineStart.lineDepthAbs = lineStart.linePrev.lineDepthAbs;
            return lineStart.lineDepthRel = lineStart.linePrev.lineDepthRel;
          }
        }
      };

      CNEditor.prototype.initSummary = function() {
        var summary;
        summary = this.editorBody$.children("#nav");
        if (summary.length === 0) {
          summary = $(document.createElement('div'));
          summary.attr('id', 'nav');
          summary.prependTo(this.editorBody$);
        }
        return summary;
      };

      CNEditor.prototype.buildSummary = function() {
        var c, lines, summary, _results;
        summary = this.initSummary();
        this.editorBody$.children("#nav").children().remove();
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

      return CNEditor;

    })(Backbone.View);

  }).call(this);
  
}});

window.require.define({"views/ed_home_view": function(exports, require, module) {
  (function() {
    var __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

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

      return HomeView;

    })(Backbone.View);

  }).call(this);
  
}});

window.require.define({"views/ed_initPage": function(exports, require, module) {
  (function() {
    var CNEditor, beautify, editorBody$, editor_css$, editor_doAddClasseToLines, editor_head$;

    beautify = require('views/ed_beautify').beautify;

    CNEditor = require('views/ed_editor').CNEditor;

    editorBody$ = void 0;

    editor_head$ = void 0;

    editor_css$ = void 0;

    editor_doAddClasseToLines = void 0;

    exports.initPage = function(selector) {
      var cb, editor, editorIframe$;
      $(selector).html(require('./templates/editor'));
      editorIframe$ = $("" + selector + " iframe");
      cb = function() {
        var editorCtrler,
          _this = this;
        this.replaceContent(require('./templates/content-empty'));
        editorCtrler = this;
        editorBody$ = this.editorBody$;
        beautify(editorBody$);
        editorBody$.on('keyup', function() {
          return beautify(editorBody$);
        });
        $("#indentBtn").on("click", function() {
          return editorCtrler.tab();
        });
        $("#unIndentBtn").on("click", function() {
          return editorCtrler.shiftTab();
        });
        $("#markerListBtn").on("click", function() {
          return editorCtrler.markerList();
        });
        $("#titleBtn").on("click", function() {
          return editorCtrler.titleList();
        });
        this.editorBody$.on('mouseup', function() {
          _this.newPosition = true;
          return $("#editorPropertiesDisplay").text("newPosition = true");
        });
        this.editorBody$.on('mouseup', function() {
          return _this.buildSummary();
        });
        return this.editorBody$.on('keyup', function() {
          return _this.buildSummary();
        });
      };
      editor = new CNEditor($('#editorIframe')[0], cb);
      return editorBody$;
    };

  }).call(this);
  
}});

window.require.define({"views/ed_markdownToCozy": function(exports, require, module) {
  (function() {
    var __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    exports.CNmarkdownToCozy = (function(_super) {

      __extends(CNmarkdownToCozy, _super);

      function CNmarkdownToCozy() {
        CNmarkdownToCozy.__super__.constructor.apply(this, arguments);
      }

      CNmarkdownToCozy.prototype.translate = function(text) {
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
          var child, i, tag, _ref, _results;
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
            for (i = 0, _ref = obj.children().length - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
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

      return CNmarkdownToCozy;

    })(Backbone.View);

  }).call(this);
  
}});

window.require.define({"views/home_view": function(exports, require, module) {
  (function() {
    var CNcozyToMarkdown, Editor, Note, NoteWidget, Tree,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    Tree = require("./widgets/tree").Tree;

    NoteWidget = require("./note_view").NoteWidget;

    Editor = require("./note_view").instEditor;

    Note = require("../models/note").Note;

    CNcozyToMarkdown = require('views/ed_cozyToMarkdown').CNcozyToMarkdown;

    exports.HomeView = (function(_super) {

      __extends(HomeView, _super);

      function HomeView() {
        this.onNoteDropped = __bind(this.onNoteDropped, this);
        this.onTreeLoaded = __bind(this.onTreeLoaded, this);
        this.onNoteChanged = __bind(this.onNoteChanged, this);
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
          return Note.updateNote({
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

      HomeView.prototype.onNoteChanged = function(event) {
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
          size: "350",
          minSize: "350",
          resizable: true
        });
      };

      HomeView.prototype.fetchData = function(callback) {
        var _this = this;
        this.treeCreationCallback = callback;
        this.noteArea = $("#editor");
        this.noteFull = $("#note-full");
        this.noteFull.hide();
        NoteWidget.setEditor(this.onNoteChanged);
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
  
}});

window.require.define({"views/note_view": function(exports, require, module) {
  (function() {
    var cozyEditor, template,
      __hasProp = Object.prototype.hasOwnProperty,
      __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

    template = require('./templates/note');

    cozyEditor = require('./ed_initPage').initPage;

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
        var breadcrumb, i, linkToThePath, path;
        i = 0;
        breadcrumb = "";
        linkToThePath = [];
        while (i < this.model.humanPath.split(",").length) {
          linkToThePath[i] = this.model.humanPath.split(",").slice(0, i + 1 || 9e9).join("/");
          path = ("/#note/" + linkToThePath[i]).toLowerCase();
          path = path.replace(/\s+/g, "-");
          linkToThePath[i] = "<a href='" + path + "'> " + (this.model.humanPath.split(",")[i]) + "</a>";
          if (i === 0) {
            breadcrumb += "" + linkToThePath[i];
          } else {
            breadcrumb += " > " + linkToThePath[i];
          }
          i++;
        }
        this.instEditor = cozyEditor("#note-area");
        $("#note-full-breadcrumb").html(breadcrumb);
        $("#note-full-title").html(this.model.title);
        $("#note-full-content").val(this.model.content);
        return this.el;
      };

      NoteWidget.setEditor = function(changeCallback) {
        var editor,
          _this = this;
        editor = $("textarea#note-full-content");
        return editor.keyup(function(event) {
          return changeCallback();
        });
      };

      return NoteWidget;

    })(Backbone.View);

  }).call(this);
  
}});

window.require.define({"views/old_ed_initPage": function(exports, require, module) {
  (function() {
    var AutoTest, CNEditor, CNcozyToMarkdown, CNmarkdownToCozy, beautify, checker, cozy2md, editorBody$, editor_css$, editor_doAddClasseToLines, editor_head$, md2cozy;

    beautify = require('views/ed_beautify').beautify;

    CNEditor = require('views/ed_editor').CNEditor;

    CNcozyToMarkdown = require('views/ed_cozyToMarkdown').CNcozyToMarkdown;

    CNmarkdownToCozy = require('views/ed_markdownToCozy').CNmarkdownToCozy;

    cozy2md = new CNcozyToMarkdown();

    md2cozy = new CNmarkdownToCozy();

    AutoTest = require('views/ed_autoTest').AutoTest;

    checker = new AutoTest();

    editorBody$ = void 0;

    editor_head$ = void 0;

    editor_css$ = void 0;

    editor_doAddClasseToLines = void 0;

    exports.initPage = function() {
      var cb, editor, editorIframe$;
      $("#note-area").html(require('./templates/editor'));
      editorIframe$ = $("iframe");
      cb = function() {
        /* initialisation of the page
        this.replaceContent( require('./templates/content-full') )
        this.replaceContent( require('./templates/content-empty') )
        this.replaceContent( require('./templates/content-full-marker') )
        this.replaceContent( require('./templates/content-shortlines-marker') )
        */
        var addClassToLines, editorCtrler, getSelectedLines, removeClassFromLines,
          _this = this;
        this.replaceContent(require('./templates/content-shortlines-all'));
        editorCtrler = this;
        editorBody$ = this.editorBody$;
        beautify(editorBody$);
        editorBody$.on('keyup', function() {
          return beautify(editorBody$);
        });
        $("#resultBtnBar_coller").on('click', function() {
          return beautify(editorBody$);
        });
        $("#printRangeBtn").on("click", function() {
          var i, l, range, sel, _results;
          sel = rangy.getIframeSelection(editorCtrler.editorIframe);
          i = 0;
          l = sel.rangeCount;
          console.log("Printing current ranges");
          _results = [];
          while (i < l) {
            console.log("Range N°" + i);
            range = sel.getRangeAt(i);
            console.log("offsets:  start=" + range.startOffset + "  -  end=" + range.endOffset);
            console.log(range.startContainer);
            console.log(range.endContainer);
            _results.push(i++);
          }
          return _results;
        });
        $('#contentSelect').on("change", function(e) {
          console.log("./templates/" + e.currentTarget.value);
          editorCtrler.replaceContent(require("./templates/" + e.currentTarget.value));
          return beautify(editorBody$);
        });
        $('#cssSelect').on("change", function(e) {
          return editorCtrler.replaceCSS(e.currentTarget.value);
        });
        $("#indentBtn").on("click", function() {
          return editorCtrler.tab();
        });
        $("#unIndentBtn").on("click", function() {
          return editorCtrler.shiftTab();
        });
        $("#markerListBtn").on("click", function() {
          return editorCtrler.markerList();
        });
        $("#titleBtn").on("click", function() {
          return editorCtrler.titleList();
        });
        $("#checkBtn").on("click", function() {
          return checker.checkLines(editorCtrler);
        });
        $("#markdownBtn").on("click", function() {
          return $("#resultText").val(cozy2md.translate($("#resultText").val()));
        });
        $("#cozyBtn").on("click", function() {
          return $("#resultText").val(md2cozy.translate($("#resultText").val()));
        });
        $("#addClass").toggle(function() {
          return addClassToLines("sel");
        }, function() {
          return removeClassFromLines("sel");
        });
        $("#summaryBtn").on("click", function() {
          return editorCtrler.buildSummary();
        });
        getSelectedLines = function(sel) {
          var divs, i, k, myDivs, node, range, _ref;
          myDivs = [];
          if (sel.rangeCount === 0) return;
          for (i = 0, _ref = sel.rangeCount - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
            range = sel.getRangeAt(i);
            divs = range.getNodes([1], function(element) {
              return element.nodeName === 'DIV';
            });
            if (divs.length === 0) {
              if (range.commonAncestorContainer.nodeName !== 'BODY') {
                node = range.commonAncestorContainer;
                if (node.nodeName !== 'DIV') node = $(node).parents("div")[0];
                divs.push(node);
              }
            }
            k = 0;
            while (k < divs.length) {
              myDivs.push($(divs[k]));
              k++;
            }
          }
          return myDivs;
        };
        addClassToLines = function(mode) {
          var div, k, lineID, lines, sel, _results, _results2;
          sel = rangy.getIframeSelection(_this.editorIframe);
          if (mode === "sel") {
            lines = getSelectedLines(sel);
            k = 0;
            _results = [];
            while (k < lines.length) {
              div = lines[k];
              div.attr('toDisplay', div.attr('class') + '] ');
              _results.push(k++);
            }
            return _results;
          } else {
            lines = _this._lines;
            _results2 = [];
            for (lineID in lines) {
              div = $(lines[lineID].line$[0]);
              _results2.push(div.attr('toDisplay', div.attr('class') + '] '));
            }
            return _results2;
          }
        };
        removeClassFromLines = function(mode) {
          var div, k, lineID, lines, sel, _results, _results2;
          sel = rangy.getIframeSelection(_this.editorIframe);
          if (mode === "sel") {
            lines = getSelectedLines(sel);
            k = 0;
            _results = [];
            while (k < lines.length) {
              div = lines[k];
              div.attr('toDisplay', '');
              _results.push(k++);
            }
            return _results;
          } else {
            lines = _this._lines;
            _results2 = [];
            for (lineID in lines) {
              div = $(lines[lineID].line$[0]);
              _results2.push(div.attr('toDisplay', ''));
            }
            return _results2;
          }
        };
        $("#addClass2LineBtn").on("click", function() {
          addClassToLines();
          if (editor_doAddClasseToLines) {
            $("#addClass2LineBtn").html("Show Class on Lines");
            editor_doAddClasseToLines = false;
            editorBody$.off('keyup', addClassToLines);
            return removeClassFromLines();
          } else {
            $("#addClass2LineBtn").html("Hide Class on Lines");
            editor_doAddClasseToLines = true;
            return editorBody$.on('keyup', addClassToLines);
          }
        });
        this.editorBody$.on('mouseup', function() {
          _this.newPosition = true;
          return $("#editorPropertiesDisplay").text("newPosition = true");
        });
        this.editorBody$.on('mouseup', function() {
          return _this.buildSummary();
        });
        return this.editorBody$.on('keyup', function() {
          return _this.buildSummary();
        });
      };
      editor = new CNEditor($('#editorIframe')[0], cb);
      return editor;
    };

  }).call(this);
  
}});

window.require.define({"views/templates/content-empty": function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow) {
  var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<div');
  buf.push(attrs({ "class": ('Tu-1') }));
  buf.push('><span></span><br');
  buf.push(attrs({  }));
  buf.push('/></div>');
  }
  return buf.join("");
  };
}});

window.require.define({"views/templates/content-full-marker": function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow) {
  var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<!-- --------------------------------------------><!-- Premier Th-1--><div');
  buf.push(attrs({ "class": ('Tu-1') }));
  buf.push('><span>Un premier titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-1') }));
  buf.push('><span>Une ligne Lu-1 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Un second titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-2') }));
  buf.push('><span>Une ligne qui devient un titre après un suppr</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Un troisième titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Une ligne Lu-3 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Une 2ièmle ligne Lu-3 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Un troisième titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Une ligne Lu-3 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Un second titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-2') }));
  buf.push('><span>Une ligne Lu-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Un troisième titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Une ligne Lu-3 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Point 1 blabla</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Point 2 blabla</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Point 2 blabla</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Une 2ièmle ligne Lu-3 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Un troisième titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Une ligne Lu-3 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><!-- --------------------------------------------><!-- Second Tu-1--><div');
  buf.push(attrs({ "class": ('Tu-1') }));
  buf.push('><span>Un second Titre Tu-1</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-1') }));
  buf.push('><span>Nous allons maintenant aborder les chapitres à puces :</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Second paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-2') }));
  buf.push('><span>Une ligne Lu-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>troisième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Une ligne Lu-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Quatrième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-4') }));
  buf.push('><span>Une ligne Lu-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Quatrième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>troisième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Une ligne Lu-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>troisième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>troisième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>troisième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Second paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-2') }));
  buf.push('><span>Une ligne Lu-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>troisième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Une ligne Lu-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Quatrième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-4') }));
  buf.push('><span>Une ligne Lu-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-1') }));
  buf.push('><span>Un premier titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-1') }));
  buf.push('><span>Une ligne de niveau 1 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne </span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-1') }));
  buf.push('><span>Une seconde ligne de niveau 1 </span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Un paragraphe avec juste un titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Un second paragraphe avec un titre long et une ligne, un second paragraphe avec un titre long, un second paragraphe avec un titre long, un second paragraphe avec un titre long, un second paragraphe avec un titre long, un second paragraphe avec un titre long !</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-2') }));
  buf.push('><span>Ligne du Second paragraphe </span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Un troisième paragraphe avec une liste en dessous :</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Premier paragraphe (1 titre seul)</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Second paragraphe (1 titre & une ligne)</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Ligne du Second paragraphe (1 titre & une ligne), longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>3ième paragraphe (1 titre & 2 lignes)</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Ligne 1 du 3ième paragraphe, pas longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Ligne 2 du 3ième paragraphe (1 titre & une ligne), longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Quatrième paragraphe avec une sous liste :</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Premier paragraphe</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Second paragraphe</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-4') }));
  buf.push('><span>Ligne 1 du 2nd paragraphe, pas longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>troisième paragraphe</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Quatrième paragraphe</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-1') }));
  buf.push('><span>Un titre de niveau 1</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Un titre de niveau 2</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Un paragraphe un  titre et deux lignes</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Seconde ligne, pas très longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Un second titre de niveau 2</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-2') }));
  buf.push('><span>Ligne commentant le paragraphe</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-2') }));
  buf.push('><span>Seconde ligne commentant le paragraphe</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Un paragraphe avec juste un titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Un second paragraphe avec un titre long, un second paragraphe avec un titre long, un second paragraphe avec un titre long, un second paragraphe avec un titre long, un second paragraphe avec un titre long, un second paragraphe avec un titre long !</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Un troisième paragraphe avec une liste en dessous :</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Premier paragraphe (1 titre seul)</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Second paragraphe (1 titre & une ligne)</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-4') }));
  buf.push('><span>Ligne du Second paragraphe (1 titre & une ligne), longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span></span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>c\'était un paragraphe vide :-)</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>12</span><br');
  buf.push(attrs({  }));
  buf.push('/></div>');
  }
  return buf.join("");
  };
}});

window.require.define({"views/templates/content-full-relative-indent": function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow) {
  var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<div');
  buf.push(attrs({ 'id':('nav') }));
  buf.push('><div');
  buf.push(attrs({ "class": ('Th-1') }));
  buf.push('><span>Un premier titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Th-1') }));
  buf.push('><span>Un second titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Th-2') }));
  buf.push('><span>Un titre de niveau 2</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Th-2') }));
  buf.push('><span>Un titre de niveau 2</span></div></div><!-- --------------------------------------------><!-- Premier Th-1--><div');
  buf.push(attrs({ "class": ('Th-1') }));
  buf.push('><span>Un premier titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-1') }));
  buf.push('><span>Une ligne Lh-1 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Th-2') }));
  buf.push('><span>Un second titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-2') }));
  buf.push('><span>Une ligne Lh-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Th-3') }));
  buf.push('><span>Un troisième titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-3') }));
  buf.push('><span>Une ligne Lh-3 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-3') }));
  buf.push('><span>Une 2ièmle ligne Lh-3 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Th-3') }));
  buf.push('><span>Un troisième titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-3') }));
  buf.push('><span>Une ligne Lh-3 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Th-2') }));
  buf.push('><span>Un second titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-2') }));
  buf.push('><span>Une ligne Lh-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Th-3') }));
  buf.push('><span>Un troisième titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-3') }));
  buf.push('><span>Une ligne Lh-3 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Point 1 blabla</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Point 2 blabla</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Point 2 blabla</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-3') }));
  buf.push('><span>Une 2ièmle ligne Lh-3 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Th-3') }));
  buf.push('><span>Un troisième titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-3') }));
  buf.push('><span>Une ligne Lh-3 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><!-- --------------------------------------------><!-- Second Th-1--><div');
  buf.push(attrs({ "class": ('Th-1') }));
  buf.push('><span>Un second Titre Th-1</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-1') }));
  buf.push('><span>Nous allons maintenant aborder les chapitres à puces :</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Second paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-2') }));
  buf.push('><span>Une ligne Lu-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>troisième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Une ligne Lu-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Quatrième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-4') }));
  buf.push('><span>Une ligne Lu-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Quatrième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>troisième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Une ligne Lu-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>troisième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>troisième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>troisième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Second paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-2') }));
  buf.push('><span>Une ligne Lu-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>troisième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Une ligne Lu-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Quatrième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-4') }));
  buf.push('><span>Une ligne Lu-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Th-1') }));
  buf.push('><span>Un premier titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-1') }));
  buf.push('><span>Une ligne de niveau 1 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne </span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-1') }));
  buf.push('><span>Une seconde ligne de niveau 1 </span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Un paragraphe avec juste un titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Un second paragraphe avec un titre long et une ligne, un second paragraphe avec un titre long, un second paragraphe avec un titre long, un second paragraphe avec un titre long, un second paragraphe avec un titre long, un second paragraphe avec un titre long !</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-2') }));
  buf.push('><span>Ligne du Second paragraphe </span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Un troisième paragraphe avec une liste en dessous :</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Premier paragraphe (1 titre seul)</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Second paragraphe (1 titre & une ligne)</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Ligne du Second paragraphe (1 titre & une ligne), longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>3ième paragraphe (1 titre & 2 lignes)</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Ligne 1 du 3ième paragraphe, pas longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Ligne 2 du 3ième paragraphe (1 titre & une ligne), longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Quatrième paragraphe avec une sous liste :</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Premier paragraphe</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Second paragraphe</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-4') }));
  buf.push('><span>Ligne 1 du 2nd paragraphe, pas longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>troisième paragraphe</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Quatrième paragraphe</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Th-1') }));
  buf.push('><span>Un titre de niveau 1</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Th-2') }));
  buf.push('><span>Un titre de niveau 2</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Un paragraphe un  titre et deux lignes</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Seconde ligne, pas très longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Th-2') }));
  buf.push('><span>Un second titre de niveau 2</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-2') }));
  buf.push('><span>Ligne commentant le paragraphe</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-2') }));
  buf.push('><span>Seconde ligne commentant le paragraphe</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Un paragraphe avec juste un titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Un second paragraphe avec un titre long, un second paragraphe avec un titre long, un second paragraphe avec un titre long, un second paragraphe avec un titre long, un second paragraphe avec un titre long, un second paragraphe avec un titre long !</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Un troisième paragraphe avec une liste en dessous :</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Premier paragraphe (1 titre seul)</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Second paragraphe (1 titre & une ligne)</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-4') }));
  buf.push('><span>Ligne du Second paragraphe (1 titre & une ligne), longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span></span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>c\'était un paragraphe vide :-)</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>12</span><br');
  buf.push(attrs({  }));
  buf.push('/></div>');
  }
  return buf.join("");
  };
}});

window.require.define({"views/templates/content-full": function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow) {
  var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<!-- --------------------------------------------><!-- Premier Th-1--><div');
  buf.push(attrs({ "class": ('Th-1') }));
  buf.push('><span>Un premier titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-1') }));
  buf.push('><span>Une ligne Lh-1 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Th-2') }));
  buf.push('><span>Un second titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-2') }));
  buf.push('><span>Une ligne Lh-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Th-3') }));
  buf.push('><span>Un troisième titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-3') }));
  buf.push('><span>Une ligne Lh-3 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-3') }));
  buf.push('><span>Une 2ièmle ligne Lh-3 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Th-3') }));
  buf.push('><span>Un troisième titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-3') }));
  buf.push('><span>Une ligne Lh-3 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Th-2') }));
  buf.push('><span>Un second titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-2') }));
  buf.push('><span>Une ligne Lh-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Th-3') }));
  buf.push('><span>Un troisième titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-3') }));
  buf.push('><span>Une ligne Lh-3 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Point 1 blabla</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Point 2 blabla</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Point 2 blabla</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-3') }));
  buf.push('><span>Une 2ièmle ligne Lh-3 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Th-3') }));
  buf.push('><span>Un troisième titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-3') }));
  buf.push('><span>Une ligne Lh-3 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><!-- --------------------------------------------><!-- Second Th-1--><div');
  buf.push(attrs({ "class": ('Th-1') }));
  buf.push('><span>Un second Titre Th-1</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-1') }));
  buf.push('><span>Nous allons maintenant aborder les chapitres à puces :</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Second paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-2') }));
  buf.push('><span>Une ligne Lu-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>troisième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Une ligne Lu-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Quatrième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-4') }));
  buf.push('><span>Une ligne Lu-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Quatrième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>troisième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Une ligne Lu-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>troisième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>troisième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>troisième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Second paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-2') }));
  buf.push('><span>Une ligne Lu-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>troisième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Une ligne Lu-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Quatrième paragraphe à puce avec un titre et une ligne</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-4') }));
  buf.push('><span>Une ligne Lu-2 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Th-1') }));
  buf.push('><span>Un premier titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-1') }));
  buf.push('><span>Une ligne de niveau 1 plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne plutôt longue pour voir où se situe le retour à la ligne </span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-1') }));
  buf.push('><span>Une seconde ligne de niveau 1 </span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Un paragraphe avec juste un titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Un second paragraphe avec un titre long et une ligne, un second paragraphe avec un titre long, un second paragraphe avec un titre long, un second paragraphe avec un titre long, un second paragraphe avec un titre long, un second paragraphe avec un titre long !</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-2') }));
  buf.push('><span>Ligne du Second paragraphe </span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Un troisième paragraphe avec une liste en dessous :</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Premier paragraphe (1 titre seul)</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Second paragraphe (1 titre & une ligne)</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Ligne du Second paragraphe (1 titre & une ligne), longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>3ième paragraphe (1 titre & 2 lignes)</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Ligne 1 du 3ième paragraphe, pas longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Ligne 2 du 3ième paragraphe (1 titre & une ligne), longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Quatrième paragraphe avec une sous liste :</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Premier paragraphe</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Second paragraphe</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-4') }));
  buf.push('><span>Ligne 1 du 2nd paragraphe, pas longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>troisième paragraphe</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Quatrième paragraphe</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Th-1') }));
  buf.push('><span>Un titre de niveau 1</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Th-2') }));
  buf.push('><span>Un titre de niveau 2</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Un paragraphe un  titre et deux lignes</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Seconde ligne, pas très longue.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Th-2') }));
  buf.push('><span>Un second titre de niveau 2</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-2') }));
  buf.push('><span>Ligne commentant le paragraphe</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lh-2') }));
  buf.push('><span>Seconde ligne commentant le paragraphe</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Un paragraphe avec juste un titre</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Un second paragraphe avec un titre long, un second paragraphe avec un titre long, un second paragraphe avec un titre long, un second paragraphe avec un titre long, un second paragraphe avec un titre long, un second paragraphe avec un titre long !</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Un troisième paragraphe avec une liste en dessous :</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Premier paragraphe (1 titre seul)</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Second paragraphe (1 titre & une ligne)</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-4') }));
  buf.push('><span>Ligne du Second paragraphe (1 titre & une ligne), longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs, Très longue ligne mais avec des variations de longueurs.</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span></span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>c\'était un paragraphe vide :-)</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>12</span><br');
  buf.push(attrs({  }));
  buf.push('/></div>');
  }
  return buf.join("");
  };
}});

window.require.define({"views/templates/content-shortlines-all": function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow) {
  var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<div');
  buf.push(attrs({ 'id':('CNID_1'), "class": ('Th-1') }));
  buf.push('><span>Tu-1 - n°1</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_2'), "class": ('Lh-1') }));
  buf.push('><span>Lh-1 - n°2</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_3'), "class": ('Th-2') }));
  buf.push('><span>Th-2 - n°3</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_4'), "class": ('Lh-2') }));
  buf.push('><span>Lh-2 - n°4</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_5'), "class": ('Tu-3') }));
  buf.push('><span>Tu-3 - n°5</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_6'), "class": ('Lu-3') }));
  buf.push('><span>Lu-3 - n°6</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_7'), "class": ('Lu-3') }));
  buf.push('><span>Lu-3 - n°7</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_8'), "class": ('Tu-3') }));
  buf.push('><span>Tu-3 - n°8</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_9'), "class": ('Lu-3') }));
  buf.push('><span>Lu-3 - n°9</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_10'), "class": ('Th-2') }));
  buf.push('><span>Th-2 - n°10</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_11'), "class": ('Lh-2') }));
  buf.push('><span>Lh-2 - n°11</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_12'), "class": ('Th-3') }));
  buf.push('><span>Th-3 - n°12</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_13'), "class": ('Lh-3') }));
  buf.push('><span>Lh-3 - n°13</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_14'), "class": ('Th-4') }));
  buf.push('><span>Th-4 - n°14</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_15'), "class": ('Th-4') }));
  buf.push('><span>Th-4 - n°15</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_16'), "class": ('Th-4') }));
  buf.push('><span>Th-4 - n°16</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_17'), "class": ('Lh-3') }));
  buf.push('><span>Lh-3 - n°17</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_18'), "class": ('Th-3') }));
  buf.push('><span>Th-3 - n°18</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_19'), "class": ('Lh-3') }));
  buf.push('><span>Lh-3 - n°19</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_20'), "class": ('Th-1') }));
  buf.push('><span>Th-1 - n°20</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_21'), "class": ('Lh-1') }));
  buf.push('><span>Lh-1 - n°21</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_22'), "class": ('Tu-2') }));
  buf.push('><span>Tu-2 - n°22</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_23'), "class": ('Lu-2') }));
  buf.push('><span>Lu-2 - n°23</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_24'), "class": ('Tu-3') }));
  buf.push('><span>Tu-3 - n°24</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_25'), "class": ('Lu-3') }));
  buf.push('><span>Lu-3 - n°25</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_26'), "class": ('Tu-4') }));
  buf.push('><span>Tu-4 - n°26</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_27'), "class": ('Lu-4') }));
  buf.push('><span>Lu-4 - n°27</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_28'), "class": ('Tu-4') }));
  buf.push('><span>Tu-4 - n°28</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_29'), "class": ('Tu-3') }));
  buf.push('><span>Tu-3 - n°29</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_30'), "class": ('Lu-3') }));
  buf.push('><span>Lu-3 - n°30</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_31'), "class": ('Tu-3') }));
  buf.push('><span>Tu-3 - n°31</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_32'), "class": ('Tu-3') }));
  buf.push('><span>Tu-3 - n°32</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_33'), "class": ('Tu-3') }));
  buf.push('><span>Tu-3 - n°33</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_34'), "class": ('Tu-2') }));
  buf.push('><span>Tu-2 - n°34</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_35'), "class": ('Lu-2') }));
  buf.push('><span>Lu-2 - n°35</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_36'), "class": ('Tu-3') }));
  buf.push('><span>Tu-3 - n°36</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_37'), "class": ('Lu-3') }));
  buf.push('><span>Lu-3 - n°37</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_38'), "class": ('Tu-4') }));
  buf.push('><span>Tu-4 - n°38</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_39'), "class": ('Lu-4') }));
  buf.push('><span>Lu-4 - n°39</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_40'), "class": ('Th-1') }));
  buf.push('><span>Th-1 - n°40</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_41'), "class": ('Lh-1') }));
  buf.push('><span>Lh-1 - n°41</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_42'), "class": ('Lh-1') }));
  buf.push('><span>Lh-1 - n°42</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_43'), "class": ('Tu-2') }));
  buf.push('><span>Tu-2 - n°43</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_44'), "class": ('Tu-2') }));
  buf.push('><span>Tu-2 - n°44</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_45'), "class": ('Lu-2') }));
  buf.push('><span>Lu-2 - n°45</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_46'), "class": ('Tu-2') }));
  buf.push('><span>Tu-2 - n°46</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_47'), "class": ('Tu-3') }));
  buf.push('><span>Tu-3 - n°47</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_48'), "class": ('Tu-3') }));
  buf.push('><span>Tu-3 - n°48</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_49'), "class": ('Lu-3') }));
  buf.push('><span>Lu-3 - n°49</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_50'), "class": ('Tu-3') }));
  buf.push('><span>Tu-3 - n°50</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_51'), "class": ('Lu-3') }));
  buf.push('><span>Lu-3 - n°51</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_52'), "class": ('Lu-3') }));
  buf.push('><span>Lu-3 - n°52</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_53'), "class": ('Tu-3') }));
  buf.push('><span>Tu-3 - n°53</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_54'), "class": ('Tu-4') }));
  buf.push('><span>Tu-4 - n°54</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_55'), "class": ('Tu-4') }));
  buf.push('><span>Tu-4 - n°55</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_56'), "class": ('Lu-4') }));
  buf.push('><span>Lu-4 - n°56</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_57'), "class": ('Tu-4') }));
  buf.push('><span>Tu-4 - n°57</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_58'), "class": ('Tu-4') }));
  buf.push('><span>Tu-4 - n°58</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_59'), "class": ('Th-1') }));
  buf.push('><span>Th-1 - n°59</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_60'), "class": ('Tu-2') }));
  buf.push('><span>Tu-2 - n°60</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_61'), "class": ('Tu-3') }));
  buf.push('><span>Tu-3 - n°61</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_62'), "class": ('Lu-3') }));
  buf.push('><span>Lu-3 - n°62</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_63'), "class": ('Lu-3') }));
  buf.push('><span>Lu-3 - n°63</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_64'), "class": ('Tu-2') }));
  buf.push('><span>Tu-2 - n°64</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_65'), "class": ('Lu-2') }));
  buf.push('><span>Lu-2 - n°65</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_66'), "class": ('Lu-2') }));
  buf.push('><span>Lu-2 - n°66</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_67'), "class": ('Tu-3') }));
  buf.push('><span>Tu-3 - n°67</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_68'), "class": ('Tu-3') }));
  buf.push('><span>Tu-3 - n°68</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_69'), "class": ('Tu-3') }));
  buf.push('><span>Tu-3 - n°69</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_70'), "class": ('Tu-4') }));
  buf.push('><span>Tu-4 - n°70</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_71'), "class": ('Tu-4') }));
  buf.push('><span>Tu-4 - n°71</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_72'), "class": ('Lu-4') }));
  buf.push('><span>Lu-4 - n°72</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_73'), "class": ('Tu-4') }));
  buf.push('><span>Tu-4 - n°73</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_74'), "class": ('Tu-4') }));
  buf.push('><span>Tu-4 - n°74</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ 'id':('CNID_75'), "class": ('Tu-4') }));
  buf.push('><span>Tu-4 - n°75</span><br');
  buf.push(attrs({  }));
  buf.push('/></div>');
  }
  return buf.join("");
  };
}});

window.require.define({"views/templates/content-shortlines-marker": function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow) {
  var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<!-- --------------------------------------------><!-- Premier Th-1--><!-- //Tu-2  -   n°3--><div');
  buf.push(attrs({ "class": ('Tu-1') }));
  buf.push('><span>Tu-1  -   n°1</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-1') }));
  buf.push('><span>Lu-1  -   n°2</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span></span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-2') }));
  buf.push('><span>Lu-2  -   n°4</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Tu-3  -   n°5</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Lu-3  -   n°6</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Lu-3  -   n°7</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Tu-3  -   n°8</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Lu-3  -   n°9</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Tu-2  -   n°10</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-2') }));
  buf.push('><span>Lu-2  -   n°11</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Tu-3  -   n°12</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Lu-3  -   n°13</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Tu-4  -   n°14</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Tu-4  -   n°15</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Tu-4  -   n°16</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Lu-3  -   n°17</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Tu-3  -   n°18</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Lu-3  -   n°19</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><!-- --------------------------------------------><!-- Second Tu-1--><div');
  buf.push(attrs({ "class": ('Tu-1') }));
  buf.push('><span>Tu-1  -   n°20</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-1') }));
  buf.push('><span>Lu-1  -   n°21</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Tu-2  -   n°22</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-2') }));
  buf.push('><span>Lu-2  -   n°23</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Tu-3  -   n°24</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Lu-3  -   n°25</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Tu-4  -   n°26</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-4') }));
  buf.push('><span>Lu-4  -   n°27</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Tu-4  -   n°28</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Tu-3  -   n°29</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Lu-3  -   n°30</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Tu-3  -   n°31</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Tu-3  -   n°32</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Tu-3  -   n°33</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Tu-2  -   n°34</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-2') }));
  buf.push('><span>Lu-2  -   n°35</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Tu-3  -   n°36</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Lu-3  -   n°37</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Tu-4  -   n°38</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-4') }));
  buf.push('><span>Lu-4  -   n°39</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-1') }));
  buf.push('><span>Tu-1  -   n°40</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-1') }));
  buf.push('><span>Lu-1  -   n°41</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-1') }));
  buf.push('><span>Lu-1  -   n°42</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Tu-2  -   n°43</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Tu-2  -   n°44</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-2') }));
  buf.push('><span>Lu-2  -   n°45</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Tu-2  -   n°46</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Tu-3  -   n°47</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Tu-3  -   n°48</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Lu-3  -   n°49</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Tu-3  -   n°50</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Lu-3  -   n°51</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Lu-3  -   n°52</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Tu-3  -   n°53</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Tu-4  -   n°54</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Tu-4  -   n°55</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-4') }));
  buf.push('><span>Lu-4  -   n°56</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Tu-4  -   n°57</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Tu-4  -   n°58</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-1') }));
  buf.push('><span>Tu-1  -   n°59</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Tu-2  -   n°60</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Tu-3  -   n°61</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Lu-3  -   n°62</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-3') }));
  buf.push('><span>Lu-3  -   n°63</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-2') }));
  buf.push('><span>Tu-2  -   n°64</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-2') }));
  buf.push('><span>Lu-2  -   n°65</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-2') }));
  buf.push('><span>Lu-2  -   n°66</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Tu-3  -   n°67</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Tu-3  -   n°68</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-3') }));
  buf.push('><span>Tu-3  -   n°69</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Tu-4  -   n°70</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Tu-4  -   n°71</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Lu-4') }));
  buf.push('><span>Lu-4  -   n°72</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Tu-4  -   n°73</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Tu-4  -   n°74</span><br');
  buf.push(attrs({  }));
  buf.push('/></div><div');
  buf.push(attrs({ "class": ('Tu-4') }));
  buf.push('><span>Tu-4  -   n°75</span><br');
  buf.push(attrs({  }));
  buf.push('/></div>');
  }
  return buf.join("");
  };
}});

window.require.define({"views/templates/editor": function(exports, require, module) {
  module.exports = function anonymous(locals, attrs, escape, rethrow) {
  var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
  var buf = [];
  with (locals || {}) {
  var interp;
  buf.push('<div');
  buf.push(attrs({ 'id':('main'), "class": ('table-ly-wrpr') }));
  buf.push('><!-- boutons for the editor--><div');
  buf.push(attrs({ 'id':('divMainBtn'), "class": ('table-ly-hder') }));
  buf.push('></div><div');
  buf.push(attrs({ 'id':('main-div'), "class": ('table-ly-ctnt') }));
  buf.push('><div');
  buf.push(attrs({ 'id':('col-wrap') }));
  buf.push('><div');
  buf.push(attrs({ 'id':('editor-col') }));
  buf.push('><div');
  buf.push(attrs({ 'id':('well-editor'), "class": ('monWell') }));
  buf.push('><div');
  buf.push(attrs({ 'id':('editorDiv'), "class": ('table-ly-wrpr') }));
  buf.push('><!-- boutons for the editor--><div');
  buf.push(attrs({ "class": ('table-ly-hder') }));
  buf.push('><div');
  buf.push(attrs({ 'id':('editorBtnBar'), "class": ('btn-group') }));
  buf.push('><button');
  buf.push(attrs({ 'id':('indentBtn'), "class": ('btn') + ' ' + ('btn-small') + ' ' + ('btn-primary') }));
  buf.push('>Indent</button><button');
  buf.push(attrs({ 'id':('unIndentBtn'), "class": ('btn') + ' ' + ('btn-small') + ' ' + ('btn-primary') }));
  buf.push('>Un-indent</button><button');
  buf.push(attrs({ 'id':('markerListBtn'), "class": ('btn') + ' ' + ('btn-small') + ' ' + ('btn-primary') }));
  buf.push('>- Marker list</button><button');
  buf.push(attrs({ 'id':('titleBtn'), "class": ('btn') + ' ' + ('btn-small') + ' ' + ('btn-primary') }));
  buf.push('>1.1.2 Title</button></div></div><!-- text for the editor--><div');
  buf.push(attrs({ 'id':('editorContent'), "class": ('table-ly-ctnt') }));
  buf.push('><iframe');
  buf.push(attrs({ 'id':('editorIframe') }));
  buf.push('></iframe></div></div></div></div></div></div></div>');
  }
  return buf.join("");
  };
}});

window.require.define({"views/templates/home": function(exports, require, module) {
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
  buf.push('><p');
  buf.push(attrs({ 'id':('searchInfo') }));
  buf.push('></p><div');
  buf.push(attrs({ 'id':('note-full'), "class": ('note-full') }));
  buf.push('><p');
  buf.push(attrs({ 'id':('note-full-breadcrumb') }));
  buf.push('>/</p><h2');
  buf.push(attrs({ 'id':('note-full-title') }));
  buf.push('>no note selected</h2><div');
  buf.push(attrs({ 'id':('note-area') }));
  buf.push('></div></div></div>');
  }
  return buf.join("");
  };
}});

window.require.define({"views/templates/note": function(exports, require, module) {
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
}});

window.require.define({"views/templates/tree_buttons": function(exports, require, module) {
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
  buf.push('></i></div><div');
  buf.push(attrs({ 'id':('tree-remove'), "class": ('button') }));
  buf.push('><i');
  buf.push(attrs({ "class": ('icon-remove') }));
  buf.push('></i></div><div');
  buf.push(attrs({ 'id':('tree-rename'), "class": ('button') }));
  buf.push('><i');
  buf.push(attrs({ "class": ('icon-pencil') }));
  buf.push('></i></div><div');
  buf.push(attrs({ "class": ('spacer') }));
  buf.push('></div><input');
  buf.push(attrs({ 'id':('tree-search-field'), 'type':("text") }));
  buf.push('/></div>');
  }
  return buf.join("");
  };
}});

window.require.define({"views/widgets/tree": function(exports, require, module) {
  (function() {
    var slugify,
      __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

    slugify = require("helpers").slugify;

    exports.Tree = (function() {

      function Tree(navEl, data, callbacks) {
        this._onNode = __bind(this._onNode, this);
        this._addButton = __bind(this._addButton, this);
        this._onSearchChanged = __bind(this._onSearchChanged, this);
        this._convertData = __bind(this._convertData, this);
        this._getStringPath = __bind(this._getStringPath, this);
        var tree;
        this.setToolbar(navEl);
        this.autocompInput = $("#tree-search-field");
        this.widgetAutocomplete = this.autocompInput.autocomplete({
          source: [],
          autoFocus: true
        });
        tree = this._convertData(data);
        this.treeEl = $("#tree");
        this.widget = this.treeEl.jstree({
          plugins: ["themes", "json_data", "ui", "crrm", "unique", "sort", "cookies", "types", "hotkeys", "dnd", "search"],
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
          },
          search: {
            show_only_matches: true
          }
        });
        this.searchField = $("#tree-search-field");
        this.searchButton = $("#tree-search");
        this.noteFull = $("#note-full");
        this.setListeners(callbacks);
      }

      Tree.prototype.setToolbar = function(navEl) {
        return navEl.prepend(require('../templates/tree_buttons'));
      };

      Tree.prototype.organizeArray = function(array) {
        var i, tmp, _results;
        i = array.length - 1;
        tmp = "";
        _results = [];
        while (i !== 0 && array[i] < array[i - 1]) {
          tmp = array[i];
          array[i] = array[i - 1];
          array[i - 1] = tmp;
          _results.push(i--);
        }
        return _results;
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
        this.searchField.keyup(this._onSearchChanged);
        this.widget.bind("create.jstree", function(e, data) {
          var completeSource, idPath, nodeName, parent, path;
          nodeName = data.inst.get_text(data.rslt.obj);
          completeSource = _this.autocompInput.autocomplete("option", "source");
          completeSource.push(nodeName);
          _this.organizeArray(completeSource);
          _this.autocompInput.autocomplete("option", "source", completeSource);
          parent = data.rslt.parent;
          path = _this._getPath(parent, nodeName);
          path.pop();
          idPath = "tree-node" + (_this._getPath(parent, nodeName).join("-"));
          data.rslt.obj.attr("id", idPath);
          return callbacks.onCreate(path.join("/"), data.rslt.name, data);
        });
        this.widget.bind("rename.jstree", function(e, data) {
          var completeSource, i, idPath, nodeName, parent, path;
          nodeName = data.inst.get_text(data.rslt.obj);
          parent = data.inst._get_parent(data.rslt.parent);
          path = _this._getStringPath(parent, data.rslt.old_name);
          if (path === "all") {
            return $.jstree.rollback(data.rlbk);
          } else if (data.rslt.old_name !== data.rslt.new_name) {
            completeSource = _this.autocompInput.autocomplete("option", "source");
            i = 0;
            while (completeSource[i] !== data.rslt.old_name) {
              i++;
            }
            while (i !== completeSource.length - 1) {
              completeSource[i] = completeSource[i + 1];
              completeSource[i + 1] = completeSource[i];
              i++;
            }
            completeSource[i] = data.rslt.new_name;
            _this.organizeArray(completeSource);
            _this.autocompInput.autocomplete("option", "source", completeSource);
            idPath = "tree-node" + (_this._getPath(parent, nodeName).join("-"));
            data.rslt.obj.attr("id", idPath);
            _this.rebuildIds(data, data.rslt.obj, idPath);
            return callbacks.onRename(path, data.rslt.new_name, data);
          }
        });
        this.widget.bind("remove.jstree", function(e, data) {
          var completeSource, i, nodeName, parent, path;
          nodeName = data.inst.get_text(data.rslt.obj);
          completeSource = _this.autocompInput.autocomplete("option", "source");
          i = 0;
          while (completeSource[i] !== nodeName) {
            i++;
          }
          while (i !== completeSource.length - 1) {
            completeSource[i] = completeSource[i + 1];
            completeSource[i + 1] = completeSource[i];
            i++;
          }
          completeSource.pop();
          _this.autocompInput.autocomplete("option", "source", completeSource);
          parent = data.rslt.parent;
          path = _this._getStringPath(parent, nodeName);
          if (path === "all") {
            return $.jstree.rollback(data.rlbk);
          } else {
            return callbacks.onRemove(path);
          }
        });
        this.widget.bind("select_node.jstree", function(e, data) {
          var leftPosition1, leftPosition2, leftPosition3, nodeName, parent, path, root;
          root = $("#tree-node-all");
          nodeName = data.inst.get_text(data.rslt.obj);
          parent = data.inst._get_parent(data.rslt.parent);
          if (parent !== -1) {
            leftPosition1 = root.offset().left + root.width() - 150;
            leftPosition2 = root.offset().left + root.width() - 100;
            leftPosition3 = root.offset().left + root.width() - 50;
            $("#tree-create").css({
              position: "absolute",
              left: leftPosition1,
              top: data.rslt.obj.position().top
            });
            $("#tree-rename").css({
              position: "absolute",
              left: leftPosition2,
              top: data.rslt.obj.position().top
            });
            $("#tree-remove").css({
              position: "absolute",
              left: leftPosition3,
              top: data.rslt.obj.position().top
            });
            $("#tree-buttons").show();
          }
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
        this.widget.bind("loaded.jstree", function(e, data) {
          return callbacks.onLoaded();
        });
        return this.widget.bind("search.jstree", function(e, data, searchString) {});
      };

      Tree.prototype.rebuildIds = function(data, obj, idPath) {
        var child, newIdPath, _i, _len, _ref, _results;
        _ref = data.inst._get_children(obj);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          newIdPath = idPath + "-" + slugify($(child).children("a:eq(0)").text());
          $(child).attr("id", newIdPath);
          _results.push(this.rebuildIds(data, child, newIdPath));
        }
        return _results;
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
        var completeSource, newNode, nodeIdPath, property, _results;
        _results = [];
        for (property in nodeToConvert) {
          if (!(property !== "name" && property !== "id")) continue;
          nodeIdPath = "" + idpath + "-" + (property.replace(/_/g, "-"));
          completeSource = this.autocompInput.autocomplete("option", "source");
          completeSource.push(nodeToConvert[property].name);
          this.organizeArray(completeSource);
          this.autocompInput.autocomplete("option", "source", completeSource);
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

      Tree.prototype.searchTimer = null;

      Tree.prototype._onSearchChanged = function(event) {
        var info, searchString;
        searchString = this.searchField.val();
        info = "Recherche: \"" + searchString + "\"";
        clearTimeout(this.searchTimer);
        if (searchString === "") {
          $("#searchInfo").hide();
          return $("#tree").jstree("search", searchString);
        } else {
          return this.searchTimer = setTimeout(function() {
            $("#tree").jstree("search", searchString);
            $("#searchInfo").html(info);
            return $("#searchInfo").show();
          }, 1000);
        }
      };

      Tree.prototype._addButton = function(event) {
        if (this.once === void 0) {
          $("#tree a").append('<div class="tree-create button">\
              <i class="icon-plus"></i>\
              </div>');
          return this.once = false;
        }
      };

      Tree.prototype._onNode = function(event) {
        return alert("essai");
      };

      return Tree;

    })();

  }).call(this);
  
}});

