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
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("collections/notes", function(exports, require, module) {
var Note, NotesCollection, add3Dots, getPreview, request,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Note = require("models/note").Note;

request = require('../lib/request');

add3Dots = function(string, limit) {
  if ((string != null ? string.length : void 0) > limit) {
    return string.substring(1, limit - 1) + "...";
  } else {
    return string;
  }
};

getPreview = function(note) {
  var converter, preview;
  preview = add3Dots(note.content, 200);
  converter = new Showdown.converter();
  preview = converter.makeHtml(preview);
  return preview;
};

NotesCollection = (function(_super) {

  __extends(NotesCollection, _super);

  NotesCollection.prototype.model = Note;

  NotesCollection.prototype.url = 'notes/';

  function NotesCollection() {
    NotesCollection.__super__.constructor.call(this);
  }

  NotesCollection.prototype.parse = function(response) {
    return response.rows || response;
  };

  NotesCollection.search = function(query, callback) {
    var _this = this;
    if (query.length > 0) {
      return request.post('notes/search', {
        query: query
      }, function(err, notes) {
        var note, results, _i, _len;
        if (err) {
          return alert("Server error occured while searching.");
        } else {
          results = [];
          for (_i = 0, _len = notes.length; _i < _len; _i++) {
            note = notes[_i];
            results.push(new Note(note));
          }
          return callback(results);
        }
      });
    } else {
      return callback([]);
    }
  };

  return NotesCollection;

})(Backbone.Collection);

module.exports = NotesCollection;

});

;require.register("helpers", function(exports, require, module) {

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
          lines: 8,
          length: 2,
          width: 1,
          radius: 5
        },
        large: {
          lines: 7,
          length: 1,
          width: 2,
          radius: 5
        }
      };
      if (Spinner) {
        return this.each(function() {
          var $this, colorObj, spinner;
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
            colorObj = {
              color: $this.css("color")
            };
            spinner = new Spinner($.extend(colorObj, opts));
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

});

;require.register("initialize", function(exports, require, module) {
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

});

;require.register("lib/request", function(exports, require, module) {

exports.request = function(type, url, data, callback) {
  return $.ajax({
    type: type,
    url: url,
    data: data != null ? JSON.stringify(data) : null,
    contentType: data != null ? "application/json" : null,
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

});

;require.register("lib/slug", function(exports, require, module) {
var char_map, removelist, slug, word;

removelist = ['sign', 'cross', 'of', 'symbol', 'staff'];

removelist = (function() {
  var _i, _len, _results;
  _results = [];
  for (_i = 0, _len = removelist.length; _i < _len; _i++) {
    word = removelist[_i];
    _results.push(new RegExp(word, 'gi'));
  }
  return _results;
})();

char_map = {
  'À': 'A',
  'Á': 'A',
  'Â': 'A',
  'Ã': 'A',
  'Ä': 'A',
  'Å': 'A',
  'Æ': 'AE',
  'Ç': 'C',
  'È': 'E',
  'É': 'E',
  'Ê': 'E',
  'Ë': 'E',
  'Ì': 'I',
  'Í': 'I',
  'Î': 'I',
  'Ï': 'I',
  'Ð': 'D',
  'Ñ': 'N',
  'Ò': 'O',
  'Ó': 'O',
  'Ô': 'O',
  'Õ': 'O',
  'Ö': 'O',
  'Ő': 'O',
  'Ø': 'O',
  'Ù': 'U',
  'Ú': 'U',
  'Û': 'U',
  'Ü': 'U',
  'Ű': 'U',
  'Ý': 'Y',
  'Þ': 'TH',
  'ß': 'ss',
  'à': 'a',
  'á': 'a',
  'â': 'a',
  'ã': 'a',
  'ä': 'a',
  'å': 'a',
  'æ': 'ae',
  'ç': 'c',
  'è': 'e',
  'é': 'e',
  'ê': 'e',
  'ë': 'e',
  'ì': 'i',
  'í': 'i',
  'î': 'i',
  'ï': 'i',
  'ð': 'd',
  'ñ': 'n',
  'ò': 'o',
  'ó': 'o',
  'ô': 'o',
  'õ': 'o',
  'ö': 'o',
  'ő': 'o',
  'ø': 'o',
  'ù': 'u',
  'ú': 'u',
  'û': 'u',
  'ü': 'u',
  'ű': 'u',
  'ý': 'y',
  'þ': 'th',
  'ÿ': 'y',
  'ẞ': 'SS',
  'α': 'a',
  'β': 'b',
  'γ': 'g',
  'δ': 'd',
  'ε': 'e',
  'ζ': 'z',
  'η': 'h',
  'θ': '8',
  'ι': 'i',
  'κ': 'k',
  'λ': 'l',
  'μ': 'm',
  'ν': 'n',
  'ξ': '3',
  'ο': 'o',
  'π': 'p',
  'ρ': 'r',
  'σ': 's',
  'τ': 't',
  'υ': 'y',
  'φ': 'f',
  'χ': 'x',
  'ψ': 'ps',
  'ω': 'w',
  'ά': 'a',
  'έ': 'e',
  'ί': 'i',
  'ό': 'o',
  'ύ': 'y',
  'ή': 'h',
  'ώ': 'w',
  'ς': 's',
  'ϊ': 'i',
  'ΰ': 'y',
  'ϋ': 'y',
  'ΐ': 'i',
  'Α': 'A',
  'Β': 'B',
  'Γ': 'G',
  'Δ': 'D',
  'Ε': 'E',
  'Ζ': 'Z',
  'Η': 'H',
  'Θ': '8',
  'Ι': 'I',
  'Κ': 'K',
  'Λ': 'L',
  'Μ': 'M',
  'Ν': 'N',
  'Ξ': '3',
  'Ο': 'O',
  'Π': 'P',
  'Ρ': 'R',
  'Σ': 'S',
  'Τ': 'T',
  'Υ': 'Y',
  'Φ': 'F',
  'Χ': 'X',
  'Ψ': 'PS',
  'Ω': 'W',
  'Ά': 'A',
  'Έ': 'E',
  'Ί': 'I',
  'Ό': 'O',
  'Ύ': 'Y',
  'Ή': 'H',
  'Ώ': 'W',
  'Ϊ': 'I',
  'Ϋ': 'Y',
  'ş': 's',
  'Ş': 'S',
  'ı': 'i',
  'İ': 'I',
  'ğ': 'g',
  'Ğ': 'G',
  'а': 'a',
  'б': 'b',
  'в': 'v',
  'г': 'g',
  'д': 'd',
  'е': 'e',
  'ё': 'yo',
  'ж': 'zh',
  'з': 'z',
  'и': 'i',
  'й': 'j',
  'к': 'k',
  'л': 'l',
  'м': 'm',
  'н': 'n',
  'о': 'o',
  'п': 'p',
  'р': 'r',
  'с': 's',
  'т': 't',
  'у': 'u',
  'ф': 'f',
  'х': 'h',
  'ц': 'c',
  'ч': 'ch',
  'ш': 'sh',
  'щ': 'sh',
  'ъ': 'u',
  'ы': 'y',
  'ь': '',
  'э': 'e',
  'ю': 'yu',
  'я': 'ya',
  'А': 'A',
  'Б': 'B',
  'В': 'V',
  'Г': 'G',
  'Д': 'D',
  'Е': 'E',
  'Ё': 'Yo',
  'Ж': 'Zh',
  'З': 'Z',
  'И': 'I',
  'Й': 'J',
  'К': 'K',
  'Л': 'L',
  'М': 'M',
  'Н': 'N',
  'О': 'O',
  'П': 'P',
  'Р': 'R',
  'С': 'S',
  'Т': 'T',
  'У': 'U',
  'Ф': 'F',
  'Х': 'H',
  'Ц': 'C',
  'Ч': 'Ch',
  'Ш': 'Sh',
  'Щ': 'Sh',
  'Ъ': 'U',
  'Ы': 'Y',
  'Ь': '',
  'Э': 'E',
  'Ю': 'Yu',
  'Я': 'Ya',
  'Є': 'Ye',
  'І': 'I',
  'Ї': 'Yi',
  'Ґ': 'G',
  'є': 'ye',
  'і': 'i',
  'ї': 'yi',
  'ґ': 'g',
  'č': 'c',
  'ď': 'd',
  'ě': 'e',
  'ň': 'n',
  'ř': 'r',
  'š': 's',
  'ť': 't',
  'ů': 'u',
  'ž': 'z',
  'Č': 'C',
  'Ď': 'D',
  'Ě': 'E',
  'Ň': 'N',
  'Ř': 'R',
  'Š': 'S',
  'Ť': 'T',
  'Ů': 'U',
  'Ž': 'Z',
  'ą': 'a',
  'ć': 'c',
  'ę': 'e',
  'ł': 'l',
  'ń': 'n',
  'ś': 's',
  'ź': 'z',
  'ż': 'z',
  'Ą': 'A',
  'Ć': 'C',
  'Ę': 'e',
  'Ł': 'L',
  'Ń': 'N',
  'Ś': 'S',
  'Ź': 'Z',
  'Ż': 'Z',
  'ā': 'a',
  'ē': 'e',
  'ģ': 'g',
  'ī': 'i',
  'ķ': 'k',
  'ļ': 'l',
  'ņ': 'n',
  'ū': 'u',
  'Ā': 'A',
  'Ē': 'E',
  'Ģ': 'G',
  'Ī': 'i',
  'Ķ': 'k',
  'Ļ': 'L',
  'Ņ': 'N',
  'Ū': 'u',
  '€': 'euro',
  '₢': 'cruzeiro',
  '₣': 'french franc',
  '£': 'pound',
  '₤': 'lira',
  '₥': 'mill',
  '₦': 'naira',
  '₧': 'peseta',
  '₨': 'rupee',
  '₩': 'won',
  '₪': 'new shequel',
  '₫': 'dong',
  '₭': 'kip',
  '₮': 'tugrik',
  '₯': 'drachma',
  '₰': 'penny',
  '₱': 'peso',
  '₲': 'guarani',
  '₳': 'austral',
  '₴': 'hryvnia',
  '₵': 'cedi',
  '¢': 'cent',
  '¥': 'yen',
  '元': 'yuan',
  '円': 'yen',
  '﷼': 'rial',
  '₠': 'ecu',
  '¤': 'currency',
  '฿': 'baht',
  "$": 'dollar',
  '©': '(c)',
  'œ': 'oe',
  'Œ': 'OE',
  '∑': 'sum',
  '®': '(r)',
  '†': '+',
  '“': '"',
  '”': '"',
  '‘': "'",
  '’': "'",
  '∂': 'd',
  'ƒ': 'f',
  '™': 'tm',
  '℠': 'sm',
  '…': '...',
  '˚': 'o',
  'º': 'o',
  'ª': 'a',
  '•': '*',
  '∆': 'delta',
  '∞': 'infinity',
  '♥': 'love',
  '&': 'and',
  '|': 'or',
  '<': 'less',
  '>': 'greater'
};

module.exports = slug = function(string, replacement) {
  var char, code, i, result, _i, _len;
  if (replacement == null) {
    replacement = '-';
  }
  result = "";
  for (i = _i = 0, _len = string.length; _i < _len; i = ++_i) {
    char = string[i];
    code = string.charCodeAt(i);
    if (char_map[char]) {
      char = char_map[char];
      code = char.charCodeAt(0);
    }
    char = char.replace(/[^\w\s$\*\_\+~\.\(\)\'\"\!\-:@]/g, '');
    result += char;
  }
  result = result.replace(/^\s+|\s+$/g, '');
  result = result.replace(/[-\s]+/g, replacement);
  result.replace("" + replacement + "$", '');
  return result.toLowerCase();
};

});

;require.register("models/models", function(exports, require, module) {
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

});

;require.register("models/note", function(exports, require, module) {
var BaseModel, request, slugify,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseModel = require("models/models").BaseModel;

request = require("lib/request");

slugify = require("lib/slug");

exports.Note = (function(_super) {

  __extends(Note, _super);

  Note.prototype.rootUrl = 'notes/';

  function Note(note) {
    var dir, property, slugs, _i, _len, _ref;
    Note.__super__.constructor.call(this);
    for (property in note) {
      this[property] = note[property];
    }
    if (typeof this.path === "string") {
      this.path = JSON.parse(this.path);
    }
    slugs = [];
    if (this.path != null) {
      _ref = this.path;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        dir = _ref[_i];
        slugs.push(slugify(dir));
      }
    }
    this.slugPath = "all/" + slugs.join("/");
  }

  Note.prototype.saveContent = function(content) {
    this.content = content;
    this.url = "notes/" + this.id;
    return this.save({
      content: this.content
    });
  };

  Note.createNote = function(data, callback) {
    data.version = '1';
    return request.post("notes", data, callback);
  };

  Note.updateNote = function(id, data, callback) {
    data.version = '1';
    return request.put("notes/" + id, data, callback);
  };

  Note.deleteNote = function(id, callback) {
    return request.del("notes/" + id, callback);
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

});

;require.register("routers/main_router", function(exports, require, module) {
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
    'note/all': 'allNotes',
    'search/:query': 'search'
  };

  MainRouter.prototype.initialize = function() {
    return this.route(/^note\/(.*?)\/(.*?)$/, 'note');
  };

  MainRouter.prototype.home = function() {
    this.navigate("note/all", {
      trigger: false
    });
    return this._initializeTree("tree-node-all", function() {
      return app.homeView.selectNoteIfIframeLoaded();
    });
  };

  MainRouter.prototype.allNotes = function() {
    if ($('#tree').length > 0) {
      return app.homeView.selectNote("tree-node-all");
    } else {
      return this._initializeTree("tree-node-all", function() {
        return app.homeView.selectNoteIfIframeLoaded();
      });
    }
  };

  MainRouter.prototype.note = function(noteId, path) {
    if ($("#tree").length > 0) {
      return app.homeView.selectNote(noteId);
    } else {
      return this._initializeTree(noteId, function() {
        return app.homeView.selectNoteIfIframeLoaded();
      });
    }
  };

  MainRouter.prototype.search = function(query) {
    query = query.replace(/-/g, ' ');
    if ($('#tree').length === 0) {
      return this._initializeTree("", function() {
        app.homeView.tree.addSearchTag(query);
        return app.homeView.search(query);
      });
    } else {
      return app.homeView.search(query);
    }
  };

  MainRouter.prototype._initializeTree = function(noteId, callback) {
    $('body').append(app.homeView.el);
    return app.homeView.initContent(noteId, callback);
  };

  return MainRouter;

})(Backbone.Router);

});

;require.register("views/home_view", function(exports, require, module) {
var LatestView, Note, NoteView, NotesCollection, SearchView, Tree, slugify,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Tree = require("./widgets/tree").Tree;

NoteView = require("./note_view").NoteView;

LatestView = require("./latest_view").LatestView;

Note = require("../models/note").Note;

NotesCollection = require("../collections/notes");

SearchView = require('./search_view');

slugify = require('../lib/slug');

/**
# Main view that manages interaction between toolprogressBar, navigation and notes
*/


exports.HomeView = (function(_super) {

  __extends(HomeView, _super);

  function HomeView() {
    this.renderNote = __bind(this.renderNote, this);

    this.selectNote = __bind(this.selectNote, this);

    this.onTreeSelectionChg = __bind(this.onTreeSelectionChg, this);

    this.onTreeRemove = __bind(this.onTreeRemove, this);

    this.enableTreeHotkey = __bind(this.enableTreeHotkey, this);

    this.disableTreeHotkey = __bind(this.disableTreeHotkey, this);

    this.onNoteTitleChange = __bind(this.onNoteTitleChange, this);

    this.onTreeRename = __bind(this.onTreeRename, this);

    this.search = __bind(this.search, this);

    this.onSearch = __bind(this.onSearch, this);

    this.onWindowScrolled = __bind(this.onWindowScrolled, this);

    this.onWindowResized = __bind(this.onWindowResized, this);

    this.onWindowClosed = __bind(this.onWindowClosed, this);

    this.selectNoteIfIframeLoaded = __bind(this.selectNoteIfIframeLoaded, this);

    this.onIFrameLoaded = __bind(this.onIFrameLoaded, this);
    return HomeView.__super__.constructor.apply(this, arguments);
  }

  HomeView.prototype.id = 'home-view';

  /**
  # Load the home view and the tree
  # Called once by the main_router
  */


  HomeView.prototype.initContent = function(note_uuid, callback) {
    this.note_uuid = note_uuid;
    this.iframeLoaded = false;
    this.treeLoaded = false;
    this.buildViews();
    this.configureLayoutDrag();
    this.loadTree(callback);
    this.configureScrolling();
    this.configureResize();
    return this.configureSaving();
  };

  HomeView.prototype.buildViews = function() {
    var _this = this;
    this.$el.html(require('./templates/home'));
    this.noteView = new NoteView(this, this.onIFrameLoaded);
    this.noteFull = this.$("#note-full");
    this.noteFull.hide();
    this.latestView = new LatestView();
    this.latestView.$el.appendTo($('#note-area'));
    this.searchView = new SearchView(this.$("#search-view"));
    return this.$el.layout({
      size: "250",
      minSize: "250",
      resizable: true,
      spacing_open: 10,
      spacing_closed: 10,
      togglerLength_closed: "100%",
      defaults: {
        enableCursorHotkey: false
      },
      onresize_end: function() {
        return _this.onWindowResized();
      }
    });
  };

  HomeView.prototype.loadTree = function(callback) {
    var _this = this;
    return $.get("tree/", function(data) {
      window.tree = data;
      _this.tree = new Tree(_this.$("#nav"), data, {
        onCreate: _this.onCreateFolder,
        onRename: _this.onTreeRename,
        onRemove: _this.onTreeRemove,
        onSelect: _this.onTreeSelectionChg,
        onLoaded: callback,
        onDrop: _this.onNoteDropped,
        onSearch: _this.onSearch
      });
      return _this.$("#create-note").click(function() {
        return _this.tree.widget.jstree("create", "#tree-node-all", "first", "A New Note");
      });
    });
  };

  HomeView.prototype.configureLayoutDrag = function() {
    var drag;
    drag = $("#drag");
    return $(".ui-layout-resizer").bind('mousedown', function(e) {});
  };

  HomeView.prototype.configureResize = function() {
    this.onWindowResized();
    $(window).resize(this.onWindowResized);
    return this.faketop.on('topaffix', this.onWindowResized);
  };

  HomeView.prototype.configureScrolling = function() {
    this.faketop = $('\
            <div id="faketop">\
                <div id="faketop-grad"></div>\
            </div>');
    this.faketop.prependTo($('#note-full'));
    return $('#note-area').scroll(this.onWindowScrolled);
  };

  HomeView.prototype.configureSaving = function() {
    return window.addEventListener('beforeunload', this.onWindowClosed);
  };

  /* Listeners
  */


  HomeView.prototype.onIFrameLoaded = function() {
    this.iframeLoaded = true;
    if (this.treeLoaded) {
      this.selectNote(this.note_uuid);
    }
    this.treeLoaded = true;
    return this.iframe = $("iframe");
  };

  HomeView.prototype.selectNoteIfIframeLoaded = function() {
    this.treeLoaded = true;
    if (this.iframeLoaded) {
      return this.selectNote(this.note_uuid);
    }
  };

  HomeView.prototype.onWindowClosed = function(e) {
    var pleasewaitmsg;
    if ((this.noteView != null) && this.noteView.savingState === 'clean') {
      return null;
    }
    pleasewaitmsg = 'You have some unsaved changes. ';
    pleasewaitmsg += 'Please stay on this page while they are saved.';
    if ((this.noteView != null) && this.noteView.savingState === 'dirty') {
      this.noteView.saveEditorContent();
    }
    e.returnValue = pleasewaitmsg;
    return pleasewaitmsg;
  };

  HomeView.prototype.onWindowResized = function() {
    var editorBB, fileList, ns, nsLeft, title, windowHeight, windowWidth;
    windowWidth = $(window).width();
    windowHeight = $(window).height();
    ns = $('#note-style');
    nsLeft = ns.offset().left;
    if (this.faketop != null) {
      this.faketop.width(ns.width());
      this.faketop.offset({
        'left': nsLeft
      });
    }
    fileList = $('#note-file-list');
    editorBB = $('#editor-button-bar');
    editorBB.css({
      'left': nsLeft - 0.5 * editorBB.width()
    });
    title = $('#note-full-title');
    title.width($('#editor-container').width() - 10);
    if (this.faketop != null) {
      this.faketop.width(ns.width() + 102);
      $('#faketop-grad').width(ns.width() + 102);
      return this.faketop.offset({
        'left': nsLeft
      });
    }
  };

  HomeView.prototype.onWindowScrolled = function() {
    var scrollTop;
    scrollTop = $('#note-area').scrollTop();
    this.handleAffix($('#note-full-breadcrumb'), scrollTop, 30);
    this.handleAffix($('#note-file-list'), scrollTop, 30);
    this.handleAffix($('#note-full-title'), scrollTop, 30);
    this.handleAffix($('#faketop'), scrollTop, 30);
    return this.handleAffix($('#faketop-grad'), scrollTop, 30);
  };

  HomeView.prototype.handleAffix = function(el, scrollTop, limit) {
    if (scrollTop > limit) {
      if (!el.hasClass('topaffix')) {
        el.addClass('topaffix');
        return el.trigger('topaffix');
      }
    } else {
      if (el.hasClass('topaffix')) {
        el.removeClass('topaffix');
        return el.trigger('topaffix');
      }
    }
  };

  HomeView.prototype.onSearch = function(query) {
    if (query.length > 0) {
      return app.router.navigate("search/" + (slugify(query)), {
        trigger: true
      });
    } else {
      if (this.treeLoaded) {
        return app.router.navigate("note/all", {
          trigger: true
        });
      }
    }
  };

  HomeView.prototype.search = function(query) {
    var _this = this;
    if (this.tree != null) {
      this.latestView.$el.hide();
      this.tree.widget.jstree("search", query);
      return NotesCollection.search(query, function(notes) {
        _this.searchView.fill(notes, query);
        return _this.noteFull.fadeOut(function() {
          return _this.searchView.fadeIn();
        });
      });
    }
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
    var _this = this;
    if (newName != null) {
      this.tree.jstreeEl.jstree("rename_node", "#" + uuid, newName);
      return Note.updateNote(uuid, {
        title: newName
      }, function(err) {
        if (err) {
          alert("Server error occured");
        }
        return _this.noteView.updateEditorReminderCf(newName);
      });
    }
  };

  HomeView.prototype.disableTreeHotkey = function() {
    return this.tree.disable_hotkeys();
  };

  HomeView.prototype.enableTreeHotkey = function() {
    return this.tree.enable_hotkeys();
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
    var changeView, _ref,
      _this = this;
    this.tree.widget.jstree("search", "");
    this.searchView.hide();
    changeView = function() {
      if (path.indexOf("/")) {
        path = "/" + path;
      }
      app.router.navigate("note" + path, {
        trigger: false
      });
      if (!(id != null) || id === "tree-node-all") {
        _this.latestView.$el.show();
        return _this.noteFull.hide();
      } else {
        _this.latestView.$el.hide();
        _this.noteView.showLoading();
        return Note.getNote(id, function(note) {
          _this.noteView.hideLoading();
          _this.renderNote(note, data);
          _this.noteFull.show();
          return _this.onWindowResized();
        });
      }
    };
    if (((_ref = this.noteView) != null ? _ref.savingState : void 0) === 'clean') {
      return changeView();
    } else {
      return this.noteView.saveEditorContent(function(err) {
        if (err) {
          return console.log(err);
        }
        return changeView();
      });
    }
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

  /* Functions
  */


  /**
  # Force selection inside tree of note of a given uuid.
  */


  HomeView.prototype.selectNote = function(noteId) {
    var _ref, _ref1;
    if (!(noteId != null) || (noteId === "all" || noteId === 'tree-node-all') || noteId.length === 0) {
      this.latestView.$el.show();
      this.noteFull.hide();
      if ((_ref = this.tree) != null) {
        _ref.widget.jstree("deselect_all");
      }
      if ((_ref1 = this.tree) != null) {
        _ref1.widget.jstree("search", "");
      }
      return this.searchView.hide();
    } else {
      return this.tree.selectNode(noteId);
    }
  };

  /**
  # Fill note widget with note data.
  */


  HomeView.prototype.renderNote = function(note, data) {
    note.url = "notes/" + note.id;
    this.currentNote = note;
    return this.noteView.setModel(note, data);
  };

  return HomeView;

})(Backbone.View);

});

;require.register("views/latest_view", function(exports, require, module) {
var NoteCollection,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

NoteCollection = require('collections/notes');

exports.LatestView = (function(_super) {

  __extends(LatestView, _super);

  function LatestView() {
    this.render = __bind(this.render, this);
    return LatestView.__super__.constructor.apply(this, arguments);
  }

  LatestView.prototype.id = 'latest-view';

  LatestView.prototype.itemTemplate = require('views/templates/search_result');

  LatestView.prototype.initialize = function() {
    this.collection = new NoteCollection();
    return this.refresh();
  };

  LatestView.prototype.refresh = function() {
    this.collection.reset([]);
    return this.collection.fetch({
      url: 'notes/latest/',
      success: this.render
    });
  };

  LatestView.prototype.render = function() {
    var _this = this;
    this.$el.html("");
    this.$el.append("<h1>Latest Notes</h1>");
    if (this.collection.length === 0) {
      return this.$el.append("<p>You have no notes, use the tree on the left tocreate one.</p>");
    } else {
      return this.collection.each(function(note) {
        var date;
        date = Date.create(note.lastModificationValueOf);
        date = date.long();
        return _this.$el.append(_this.itemTemplate({
          note: note,
          date: date
        }));
      });
    }
  };

  return LatestView;

})(Backbone.View);

});

;require.register("views/note_view", function(exports, require, module) {
var CNeditor, FileList, Note, TreeInst, helpers, template,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

template = require('./templates/note');

Note = require('../models/note').Note;

TreeInst = require('./widgets/tree');

FileList = require('./widgets/file_list').FileList;

CNeditor = require('CNeditor/editor');

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

    this.updateEditorReminderCf = __bind(this.updateEditorReminderCf, this);

    NoteView.__super__.constructor.apply(this, arguments);
    this.$el = $("#note-full");
    this.$("#editor").html(require('./templates/editor'));
    this.savingState = 'clean';
    this.saveTimer = null;
    this.saveButton = this.$('#save-editor-content');
    this.noteFullTitle = this.$('#note-full-title');
    this.breadcrumb = this.$('#note-full-breadcrumb');
    this.editor = new CNeditor(this.$('#editor-container')[0], this.onIFrameLoaded);
    this.configureButtons();
    this.setTitleListeners();
    this.setEditorFocusListener();
    this.setSaveListeners();
    this.fileList = new FileList(this.model, '#file-list');
  }

  /*
      # every keyUp in the note's editor will trigger a countdown of 3s, after
      # 3s and if the user didn't type anything, the content will be saved
  */


  NoteView.prototype.setSaveListeners = function() {
    var _this = this;
    this.$("#editor-container").on("onChange", function() {
      _this.saveButton.removeClass("active");
      clearTimeout(_this.saveTimer);
      _this.saveTimer = setTimeout(_this.saveEditorContent, 3000);
      return _this.savingState = 'dirty';
    });
    this.saveButton.click(this.saveEditorContent);
    return this.$('#editor-container').on('saveRequest', function() {
      _this.savingState = 'dirty';
      return _this.saveEditorContent();
    });
  };

  NoteView.prototype.setTitleListeners = function() {
    var _this = this;
    this.noteFullTitle.live("keypress", function(event) {
      if (event.keyCode === 13) {
        return _this.noteFullTitle.trigger("blur");
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

  NoteView.prototype.setEditorFocusListener = function() {
    var editorEl;
    editorEl = document.getElementById('editor-container');
    editorEl.addEventListener('focus', this.homeView.disableTreeHotkey, true);
    return editorEl.addEventListener('blur', this.homeView.enableTreeHotkey, true);
  };

  NoteView.prototype.configureButtons = function() {
    var delay,
      _this = this;
    this.indentBtn = this.$("#indentBtn");
    this.unIndentBtn = this.$("#unIndentBtn");
    this.markerListBtn = this.$("#markerListBtn");
    this.toggleBtn = this.$("#toggleBtn");
    this.boldBtn = this.$("#boldBtn");
    this.linkBtn = this.$("#linkBtn");
    this.metaBtn = this.$("#metaBtn");
    this.saveEditorBtn = this.$("#save-editor-content");
    this.titleBtn = this.$("#titleBtn");
    delay = {
      show: 400,
      hide: 100
    };
    this.indentBtn.tooltip({
      placement: "right",
      title: "Indent (Tab)",
      delay: delay
    });
    this.indentBtn.on("click", function() {
      _this.editor.tab();
      return _this.editor.setFocus();
    });
    this.unIndentBtn.tooltip({
      placement: "right",
      title: "Unindent (Shift + Tab)",
      delay: delay
    });
    this.unIndentBtn.on("click", function() {
      _this.editor.shiftTab();
      return _this.editor.setFocus();
    });
    this.toggleBtn.tooltip({
      placement: "right",
      title: "Toggle line type (Alt + A)",
      delay: delay
    });
    this.toggleBtn.on("click", function() {
      _this.editor.toggleType();
      return _this.editor.setFocus();
    });
    this.boldBtn.tooltip({
      placement: "right",
      title: "Bold (Ctrl + B)",
      delay: delay
    });
    this.boldBtn.on("click", function() {
      _this.editor.strong();
      return _this.editor.setFocus();
    });
    this.linkBtn.tooltip({
      placement: "right",
      title: "Create or edit a link (Ctrl + K)",
      delay: delay
    });
    this.linkBtn.on("click", function(e) {
      return _this.editor.linkifySelection();
    });
    this.metaBtn.tooltip({
      placement: "right",
      title: "Add a meta-object (@)",
      delay: delay
    });
    this.metaBtn.on("click", function(e) {
      _this.editor.emulateAt();
      return _this.editor.setFocus();
    });
    return this.saveEditorBtn.tooltip({
      placement: "right",
      title: "Save the current content",
      delay: delay
    });
  };

  /*
      #
  */


  NoteView.prototype.setModel = function(note, data) {
    this.model = note;
    this.setTitle(note.title);
    this.setContent(note);
    this.createBreadcrumb(note, data);
    this.fileList.configure(this.model);
    return this.fileList.render();
  };

  NoteView.prototype.updateEditorReminderCf = function(title) {
    return this.editor.setReminderCf("note " + title, {
      app: 'notes',
      url: "note/" + this.model.id + "/"
    });
  };

  NoteView.prototype.showLoading = function() {
    this.noteFullTitle.hide();
    this.$('#editor-container').hide();
    return this.$("#note-style").spin("large");
  };

  NoteView.prototype.hideLoading = function() {
    this.noteFullTitle.show();
    this.$('#editor-container').show();
    return this.$("#note-style").spin();
  };

  /*
      #  Display note title
  */


  NoteView.prototype.setTitle = function(title) {
    this.noteFullTitle.val(title);
    return this.updateEditorReminderCf(title);
  };

  /*
      # Stop saving timer if any and force saving of editor content.
  */


  NoteView.prototype.saveEditorContent = function(callback) {
    var data,
      _this = this;
    if ((this.model != null) && (this.editor != null) && this.savingState !== 'clean') {
      this.savingState = 'saving';
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
      this.saveButton.spin('small');
      this.editor.saveTasks();
      data = {
        content: this.editor.getEditorContent()
      };
      return Note.updateNote(this.model.id, data, function(error) {
        if (error) {
          alert("Unable to save changes on the server. Try again");
          console.log(error);
        } else if (_this.savingState === 'saving') {
          _this.savingState = 'clean';
        }
        _this.homeView.latestView.refresh();
        _this.saveButton.addClass("active");
        _this.saveButton.spin();
        if (typeof callback === 'function') {
          return callback(error);
        }
      });
    }
  };

  /**
   * Display given content inside editor.
   * If no content is given, editor is cleared.
  */


  NoteView.prototype.setContent = function(note) {
    if (note.content) {
      if (!note.version) {
        return this.editor.setEditorContentFromMD(note.content);
      } else {
        return this.editor.setEditorContent(note.content);
      }
    } else {
      return this.editor.deleteContent();
    }
  };

  /**
   * create a breadcrumb showing a clickable way from the root to the current note
   * input: noteModel, contains the informations of the current note
   *  data, allow to reach the id of the parents of the current note
   * output: the breadcrumb html is modified
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
    breadcrumb = "<a href='#note/all'> All</a> > " + breadcrumb;
    this.breadcrumb.find("a").unbind();
    this.breadcrumb.html(breadcrumb);
    return this.breadcrumb.find("a").click(function(event) {
      var hash, id;
      event.preventDefault();
      hash = event.target.hash.substring(1);
      path = hash.split("/");
      id = path[1];
      app.router.navigate("note/" + id);
      return app.homeView.selectNote(id);
    });
  };

  /**
   * in case of renaming a note this function update the breadcrumb in consequences
  */


  NoteView.prototype.updateBreadcrumbOnTitleChange = function(newName) {
    return this.breadcrumb.find(" a:last").text(newName);
  };

  return NoteView;

})(Backbone.View);

});

;require.register("views/search_view", function(exports, require, module) {
var SearchView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

SearchView = (function(_super) {

  __extends(SearchView, _super);

  SearchView.prototype.id = "note-search";

  function SearchView($el) {
    this.$el = $el;
    this.$el.hide();
    this.$el.html(require('views/templates/search_view'));
    this.results = this.$(".results");
    this.queryTitle = this.$("span");
  }

  SearchView.prototype.fill = function(notes, query) {
    var date, note, template, _i, _len, _results;
    this.results.html(null);
    this.queryTitle.html(" " + query);
    template = require('views/templates/search_result');
    if (notes.length) {
      _results = [];
      for (_i = 0, _len = notes.length; _i < _len; _i++) {
        note = notes[_i];
        date = Date.create(note.lastModificationValueOf);
        date = date.format();
        _results.push(this.results.append(template({
          note: note,
          date: date
        })));
      }
      return _results;
    } else {
      return this.results.append('<p class="pl1">No note found.</p>');
    }
  };

  SearchView.prototype.fadeIn = function(callback) {
    return this.$el.fadeIn(callback);
  };

  SearchView.prototype.fadeOut = function(callback) {
    return this.$el.fadeOut(callback);
  };

  SearchView.prototype.hide = function() {
    return this.$el.hide();
  };

  return SearchView;

})(Backbone.View);

module.exports = SearchView;

});

;require.register("views/templates/content-empty", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div id="CNID_1" class="Tu-1"><span></span><br/></div>');
}
return buf.join("");
};
});

;require.register("views/templates/editor", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div id="editor-button-bar" class="btn-group btn-group-vertical clearfix"><button id="indentBtn" class="btn btn-small"><i class="icon-indent-right"></i></button><button id="unIndentBtn" class="btn btn-small"><i class="icon-indent-left"></i></button><button id="toggleBtn" class="btn btn-small"><i class="icon-toggle"></i></button><button id="boldBtn" class="btn btn-small"><i class="icon-bold"></i></button><button id="linkBtn" class="btn btn-small"><i class="icon-link"></i></button><button id="metaBtn" class="btn btn-small"><i class="icon-tags"></i></button><button id="save-editor-content" class="btn active btn-small"><i class="icon-download-alt"></i></button></div><div class="spacer"></div><div id="note-file-list"><div id="file-number">0 files</div><div id="file-pic"></div><div id="file-list"></div></div><div id="editor-container"></div>');
}
return buf.join("");
};
});

;require.register("views/templates/home", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div id="nav" class="ui-layout-west"><div id="tree"></div></div><div id="note-area" class="ui-layout-center"><div id="search-view"></div><div id="latest-view"></div><div id="note-full" class="note-full"><div id="note-full-breadcrumb">/</div><div id="note-style"><input id="note-full-title"/><div id="editor"></div></div><div class="clearfix"></div></div></div><div id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" class="modal hide fade in"><div class="modal-header"><h3 id="myModalLabel">Warning!</h3></div><div class="modal-body"><p>You are about to delete this note and all its children. Do you want to continue?</p></div><div class="modal-footer"><button id="modal-yes" data-dismiss="modal" aria-hidden="true" class="btn">Yes</button><button data-dismiss="modal" aria-hidden="true" class="btn">No</button></div></div>');
}
return buf.join("");
};
});

;require.register("views/templates/note", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<p>' + escape((interp = note.humanPath.split(",").join(" / ")) == null ? '' : interp) + '</p><h2>' + escape((interp = note.title) == null ? '' : interp) + '</h2><textarea id="note-content"></textarea>');
}
return buf.join("");
};
});

;require.register("views/templates/search_result", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div class="search-result"><h2><span class="date">' + escape((interp = date) == null ? '' : interp) + '</span><a');
buf.push(attrs({ 'href':("#note/" + (note.id) + "/" + (note.slugPath) + "") }, {"href":true}));
buf.push('> ' + escape((interp = note.title) == null ? '' : interp) + '</a></h2><p><' + (note.preview) + '></' + (note.preview) + '></p></div>');
}
return buf.join("");
};
});

;require.register("views/templates/search_view", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<h1>Search results for<span></span></h1><div class="results"></div>');
}
return buf.join("");
};
});

;require.register("views/templates/tree_buttons", function(exports, require, module) {
module.exports = function anonymous(locals, attrs, escape, rethrow, merge) {
attrs = attrs || jade.attrs; escape = escape || jade.escape; rethrow = rethrow || jade.rethrow; merge = merge || jade.merge;
var buf = [];
with (locals || {}) {
var interp;
buf.push('<div id="tree-buttons"><div id="tree-create" class="button"><i class="icon-plus"></i></div><div id="tree-rename" class="button"><i class="icon-pencil"></i></div><div id="tree-remove" class="button"><i class="icon-remove"></i></div></div><div id="tree-top-buttons"><input id="tree-search-field" type="text" class="span2"/><i id="suppr-button" style="display: none" class="icon-remove-circle"></i></div><div id="my-notes"><a href="#note/all"><img id="my-notes-pic" src="img/my-notes.png"/></a><div id="create-note"></div></div>');
}
return buf.join("");
};
});

;require.register("views/widgets/file_list", function(exports, require, module) {
var helpers,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

helpers = require('../../helpers');

exports.FileList = (function(_super) {

  __extends(FileList, _super);

  function FileList(model, id) {
    this.model = model;
    this.id = id;
    this.onMouseLeave = __bind(this.onMouseLeave, this);

    this.onMouseEnter = __bind(this.onMouseEnter, this);

    this.onUploadComplete = __bind(this.onUploadComplete, this);

    this.onSubmit = __bind(this.onSubmit, this);

    this.$el = $(this.id);
    this.uploadButton = $("#file-pic");
    this.uploader = new qq.FileUploaderBasic({
      button: document.getElementById('file-pic'),
      multiple: false,
      forceMultipart: true,
      onComplete: this.onUploadComplete,
      onSubmit: this.onSubmit
    });
    this.widget = $("#note-file-list");
    this.widget.mouseenter(this.onMouseEnter);
    this.widget.mouseleave(this.onMouseLeave);
  }

  FileList.prototype.onSubmit = function(id, filename) {
    if ((this.model._attachments != null) && (this.model._attachments[filename] != null)) {
      return false;
    }
    return this.uploadButton.spin('small');
  };

  FileList.prototype.onUploadComplete = function(id, filename, response) {
    var _this = this;
    if (!(this.model._attachments != null)) {
      this.model._attachments = {};
    }
    this.model._attachments[filename] = {};
    this.addFileLine(filename);
    this.setFileNumber();
    return this.$el.slideDown(function() {
      return _this.uploadButton.spin();
    });
  };

  FileList.prototype.onMouseEnter = function() {
    var _this = this;
    this.widget.unbind('mouseleave');
    return this.$el.slideDown(function() {
      return _this.widget.mouseleave(_this.onMouseLeave);
    });
  };

  FileList.prototype.onMouseLeave = function() {
    return this.$el.slideUp();
  };

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
      this.$('.note-file button').unbind();
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
    line.hide();
    delButton = line.find("button");
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

})(Backbone.View);

});

;require.register("views/widgets/tree", function(exports, require, module) {
var slugify,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

slugify = require("lib/slug");

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

    var jstreeEl, __initSuggestionList;
    jstreeEl = $("#tree");
    this.jstreeEl = jstreeEl;
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
    var jstreeEl, modalAlert, modalYesBtn, tree_buttons, tree_buttons_root, tree_buttons_target,
      _this = this;
    jstreeEl = this.jstreeEl;
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
    this.widget.on("loaded.jstree", function(e, data) {
      return homeViewCbk.onLoaded();
    });
    return this.onSearch = homeViewCbk.onSearch;
  };

  Tree.prototype.setSearchField = function() {
    /**
    #Autocompletion
    */

    var jstreeEl, searchField, searchFunction, textextWidget, _filterAutocomplete, _selectIcon,
      _this = this;
    this.searchField = $("#tree-search-field");
    searchField = this.searchField;
    jstreeEl = this.jstreeEl;
    this.searchField.blur(function() {
      return jstreeEl.css("margin-top", 10);
    });
    /*
            # this function allow to select what appears in the suggestion list
            # while the user type something in the search input
            # input : array of suggestions, current string in the search input
            # outputs : an array containing strings corresponding to suggestions 
            # depending on the searchstring
    */

    _filterAutocomplete = function(array, searchString) {
      var expBold, expFirst, filtered, filteredFirst, isMatch, isMatchFirst, name, nameBold, regSentence, result, _i, _len;
      filteredFirst = [];
      filtered = [];
      regSentence = "";
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        name = array[_i];
        expFirst = new RegExp("^" + searchString, "i");
        isMatchFirst = expFirst.test(name);
        expBold = new RegExp("(" + searchString + ")", "gi");
        isMatch = expBold.test(name);
        if (isMatchFirst) {
          nameBold = name.replace(expBold, function(match, pattern) {
            return "<span class='bold-name'>" + match + "</span>";
          });
          filteredFirst.push(nameBold);
        } else if (isMatch) {
          nameBold = name.replace(expBold, function(match, pattern) {
            return "<span class='bold-name'>" + match + "</span>";
          });
          if (!(__indexOf.call(filteredFirst, nameBold) >= 0) && !(__indexOf.call(filtered, nameBold) >= 0)) {
            filtered.push(nameBold);
          }
        }
      }
      result = filteredFirst.concat(filtered);
      return result;
    };
    /**
    #used by textext to change the render of the suggestion list
    #attach an icon to a certain type in the autocomplete list
    #input : suggestion : a string which is the suggestion, 
    #array : the array is suggestionList containing all the suggestions
    # possible and their nature
    */

    _selectIcon = function(suggestion, array) {
      var i;
      if (suggestion === ("\"" + (searchField.val()) + "\"")) {
        return "<i class='icon-search icon-suggestion'></i>";
      } else {
        i = 0;
        suggestion = suggestion.replace(/<.*?>/g, "");
        while (i < array.length && suggestion !== array[i].name) {
          i++;
        }
        if (i < array.length && array[i].type === "folder") {
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
        searchString += " " + string.innerHTML;
      }
      return _this.onSearch(searchString);
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
              return searchFunction("");
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
            node.data('text-tag', tag);
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
      treeHeight = list.length * 12;
      return $(this).trigger("setSuggestions", {
        result: list
      });
    });
    return textextWidget.bind('isTagAllowed', function(e, data) {
      jstreeEl.css("margin-top", 10);
      return searchFunction(data.tag);
    });
  };

  Tree.prototype.addSearchTag = function(tag) {
    return this.searchField.textext()[0].tags().addTags([tag]);
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
   * Disable the hot key in jsTree, important when it is no longer the editor 
   * which listen to the keystokes
  */


  Tree.prototype.disable_hotkeys = function() {
    return this.jstreeEl.jstree("disable_hotkeys");
  };

  /**
   * Enable the hot key in jsTree, important when it is the editor which
   * listen to the keystokes
  */


  Tree.prototype.enable_hotkeys = function() {
    return this.jstreeEl.jstree("enable_hotkeys");
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

});

;
//# sourceMappingURL=app.js.map