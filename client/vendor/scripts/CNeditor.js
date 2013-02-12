exports = {};/* ------------------------------------------------------------------------
#  MARKUP LANGUAGE CONVERTERS
# _cozy2md (Read a string of editor html code format and turns it into a
#           string in markdown format)
# _md2cozy (Read a string of html code given by showdown and turns it into
#           a string of editor html code)
*/

var md2cozy;

md2cozy = {};

if (!String.prototype.trim) {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
  };
}

/* ------------------------------------------------------------------------
#  _cozy2md
# Turns line elements form editor into a string in markdown format
*/


md2cozy.cozy2md = function(linesDiv) {
  var line, lineElt, lineMetaData, lines, markCode, prevLineMetaData, _i, _j, _len, _len1, _ref, _ref1;
  md2cozy.currentDepth = 0;
  lines = [];
  prevLineMetaData = null;
  _ref = linesDiv.children();
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    line = _ref[_i];
    line = $(line);
    lineMetaData = md2cozy.getLineMetadata(line.attr('class'));
    markCode = md2cozy.buildMarkdownPrefix(lineMetaData, prevLineMetaData);
    prevLineMetaData = lineMetaData;
    _ref1 = line.children();
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      lineElt = _ref1[_j];
      if (lineElt.nodeType === 1) {
        markCode += md2cozy.convertInlineEltToMarkdown($(lineElt));
      } else {
        markCode += $(lineElt).text();
      }
    }
    lines.push(markCode);
  }
  return lines.join('');
};

md2cozy.getLineMetadata = function(name) {
  var data, depth, type;
  if (name != null) {
    data = name.split("-");
    type = data[0];
    depth = parseInt(data[1], 10);
    return {
      type: type,
      depth: depth
    };
  } else {
    return {
      type: null,
      depth: null
    };
  }
};

md2cozy.buildMarkdownPrefix = function(metadata, prevMetadata) {
  var blanks, dieses, i, nbBlanks, prefix, _i, _j, _k, _ref, _ref1, _ref2;
  blanks = "";
  switch (metadata.type) {
    case 'Th':
      dieses = '';
      for (i = _i = 1, _ref = metadata.depth; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
        dieses += '#';
      }
      md2cozy.currentDepth = metadata.depth;
      prefix = "" + dieses + " ";
      if (prevMetadata != null) {
        prefix = "\n\n" + prefix;
      }
      return prefix;
    case 'Lh':
      return "\n\n";
    case 'Tu':
      nbBlanks = metadata.depth - md2cozy.currentDepth - 1;
      if (nbBlanks > 0) {
        for (i = _j = 0, _ref1 = nbBlanks - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
          blanks += '    ';
        }
      }
      prefix = "" + blanks + "* ";
      if ((prevMetadata != null ? prevMetadata.type : void 0) === "Tu" || (prevMetadata != null ? prevMetadata.type : void 0) === "Lu") {
        prefix = "\n" + prefix;
      } else if (prevMetadata != null) {
        prefix = "\n\n" + prefix;
      }
      return prefix;
    case 'Lu':
      nbBlanks = metadata.depth - md2cozy.currentDepth - 1;
      if (nbBlanks > 0) {
        for (i = _k = 0, _ref2 = nbBlanks - 1; 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
          blanks += '    ';
        }
      }
      return "\n\n" + blanks + " ";
    default:
      return '';
  }
};

md2cozy.convertInlineEltToMarkdown = function(obj) {
  var alt, href, src, title;
  switch (obj[0].nodeName) {
    case 'A':
      title = obj.attr('title') != null ? obj.attr('title') : "";
      href = obj.attr('href') != null ? obj.attr('href') : "";
      return '[' + obj.html() + '](' + href + ' "' + title + '")';
    case 'IMG':
      title = obj.attr('title') != null ? obj.attr('title') : "";
      alt = obj.attr('alt') != null ? obj.attr('alt') : "";
      src = obj.attr('src') != null ? obj.attr('src') : "";
      return '![' + alt + '](' + src + ' "' + title + '")';
    case 'SPAN':
      return obj.text();
    default:
      return '';
  }
};

/* ------------------------------------------------------------------------
# Read a string of html code given by showdown and turns it into a string
# of editor html code
*/


md2cozy.md2cozy = function(text) {
  var conv, cozyCode, htmlCode;
  conv = new Showdown.converter();
  htmlCode = $(conv.makeHtml(text));
  cozyCode = '';
  md2cozy.currentId = 0;
  md2cozy.editorDepth = 0;
  htmlCode.each(function() {
    return cozyCode += md2cozy.parseLine($(this));
  });
  if (cozyCode.length === 0) {
    cozyCode = md2cozy.buildEditorLine("Tu", 1, null);
  }
  return cozyCode;
};

md2cozy.parseLine = function(obj) {
  var tag;
  tag = obj[0].tagName;
  if ((tag != null) && tag[0] === "H") {
    md2cozy.editorDepth = parseInt(tag[1], 10);
    return md2cozy.buildEditorLine("Th", md2cozy.editorDepth, obj);
  } else if ((tag != null) && tag === "P") {
    return md2cozy.buildEditorLine("Lh", md2cozy.editorDepth, obj);
  } else {
    return md2cozy.parseList(obj);
  }
};

md2cozy.buildEditorLine = function(type, depth, obj) {
  var code;
  md2cozy.currentId++;
  code = '';
  if (obj != null) {
    obj.contents().each(function() {
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
  }
  if (code === "") {
    code = "<span></span>";
  }
  return ("<div id=CNID_" + md2cozy.currentId + " class=" + type + "-" + depth + ">") + code + "<br></div>";
};

md2cozy.parseList = function(obj) {
  var child, cozyCode, i, nodeName, tag, type, _i, _len, _ref;
  tag = obj[0].tagName;
  cozyCode = "";
  if ((tag != null) && tag === "UL") {
    md2cozy.editorDepth++;
    obj.children().each(function() {
      return cozyCode += md2cozy.parseList($(this));
    });
    md2cozy.editorDepth--;
  } else if ((tag != null) && tag === "LI" && (obj.contents().get(0) != null)) {
    _ref = obj[0].childNodes;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      child = _ref[i];
      child = $(child);
      type = "Lu";
      if (i === 0) {
        type = "Tu";
      }
      nodeName = child[0].nodeName;
      if (nodeName === "#text" && child.text().trim() !== "") {
        child = child.clone().wrap('<p></p>').parent();
        cozyCode += md2cozy.buildEditorLine(type, md2cozy.editorDepth, child);
      } else if (nodeName === "P") {
        cozyCode += md2cozy.buildEditorLine(type, md2cozy.editorDepth, child);
      } else {
        cozyCode += md2cozy.parseList(child);
      }
    }
  } else if ((tag != null) && tag === "P") {
    cozyCode += md2cozy.buildEditorLine("Lu", md2cozy.editorDepth, obj);
  }
  return cozyCode;
};

exports.md2cozy = md2cozy;
var selection;

selection = {};

/* ------------------------------------------------------------------------
# UTILITY FUNCTIONS
# used to set ranges and help normalize selection
# 
# parameters: elt  :  a dom object with only textNode children
#
# note: with google chrome, it seems that non visible elements
#       cannot be selected with rangy (that's where 'blank' comes in)
*/


/**
 * Called only once from the editor - TODO : role to be verified
*/


selection.cleanSelection = function(startLine, endLine, range) {
  var endNode, startNode;
  if (startLine === null) {
    startLine = endLine;
    endLine = endLine.lineNext;
    selection.putStartOnStart(range, startLine.line$[0].firstElementChild);
    endLine.line$.prepend('<span></span>');
    return selection.putEndOnStart(range, endLine.line$[0].firstElementChild);
  } else {
    startNode = startLine.line$[0].lastElementChild.previousElementSibling;
    endNode = endLine.line$[0].lastElementChild.previousElementSibling;
    range.setStartAfter(startNode, 0);
    return range.setEndAfter(endNode, 0);
  }
};

selection.selectAll = function(editor) {
  var range, sel;
  range = document.createRange();
  range.setStartBefore(editor.linesDiv.firstChild);
  range.setEndAfter(editor.linesDiv.lastChild);
  selection.normalize(range);
  sel = editor.getEditorSelection();
  sel.removeAllRanges();
  return sel.addRange(range);
};

/**
 * Called only once from the editor - TODO : role to be verified
*/


selection.cloneEndFragment = function(range, endLine) {
  var range4fragment;
  range4fragment = rangy.createRangyRange();
  range4fragment.setStart(range.endContainer, range.endOffset);
  range4fragment.setEndAfter(endLine.line$[0].lastChild);
  return range4fragment.cloneContents();
};

/* ------------------------------------------------------------------------
#  normalize(range)
# 
#  Modify 'range' containers and offsets so it represent a clean selection
#  that starts and ends inside a textNode.
#
#  Set the flag isEmptyLine to true if an empty line is being normalized
#  so further suppr ~ backspace work properly.
# 
#  All possible breakpoints :
    - <span>|<nodeText>|Text |node content|</nodeText>|<any>...</nodeText>|</span>
           BP1        BP2   BP3          BP4         BP5             BP6 

    - <div>|<span>...</span>|<any>...</span>|</br>|</div>
          BP7              BP8             BP9    BP10

    - <body>|<div>...</div>|<div>...</div>|</body>
           BP11           BP12           BP13


    BP1 : <span>|<nodeText>
             
        |     test    |               action              |
        |-------------|-----------------------------------|
        | cont = span | if cont.length = 0                |
        | offset = 0  | * create nodeText                 |
        |             | * BP2 => BP2                      |
        |             | else if cont.child(0) = nodeText  |
        |             | * BP2 => BP2                      |
        |             | else if cont.child(0) != nodeText |
        |             | * error                           |

    BP2 : <nodeText>|Text node content</nodeText>
                
        |       test      |  action |
        |-----------------|---------|
        | cont = nodeText | nothing |
        | offset = 0      |         |
        
    BP3 : <nodeText>Text |node content</nodeText>

        |         test         |  action |
        |----------------------|---------|
        | cont = nodeText      | nothing |
        | 0<offset<cont.length |         |
        
    BP4 : <nodeText>Text node content|</nodeText>

        |         test         |  action |
        |----------------------|---------|
        | cont = nodeText      | nothing |
        | offset = cont.length |         |
        
    BP5 & BP6 : </nodeText>|<any>
        |               test              |            action           |
        |---------------------------------|-----------------------------|
        | cont != nodeText                | bpEnd(cont.child(offset-1)) |
        | offset > 0                      |                             |
        | cont.child(offset-1) = nodeText |                             |
        
    BP7 : <div>|<span>...
        |    test    |          action          |
        |------------|--------------------------|
        | cont = div | if cont.length = 0       |
        | offset = 0 | * error                  |
        |            | else                     |
        |            | bpStart(cont.firstChild) |

    BP8 & BP9 : ...</span>|<any>...
        |             test            |            action           |
        |-----------------------------|-----------------------------|
        | cont != nodeText            | bpEnd(cont.child(offset-1)) |
        | offset > 0                  |                             |
        | cont.child(offset-1) = span |                             |

    BP10 : </br>|</div>
        |            test           |            action           |
        |---------------------------|-----------------------------|
        | cont != nodeText          | bpEnd(cont.child(offset-2)) |
        | offset > 0                |                             |
        | offset=cont.length        |                             |
        | cont.child(offset-1) = br |                             |

    BP11 : <body>|<div>...
        |     test    |          action          |
        |-------------|--------------------------|
        | cont = body | bpStart(cont.firstChild) |
        | offset = 0  |                          |

    BP12 : </div>|<any>
        |            test            |            action           |
        |----------------------------|-----------------------------|
        | cont != nodeText           | bpEnd(cont.child(offset-1)) |
        | offset > 0                 |                             |
        | offset=cont.length         |                             |
        | cont.child(offset-1) = div |                             |


    BP13 : ...</div>|</body>
        |         test         |         action        |
        |----------------------|-----------------------|
        | cont = body          | bpEnd(cont.lastChild) |
        | offset = cont.length |                       |
*/


selection.normalize = function(range) {
  var isCollapsed, newEndBP, newStartBP;
  isCollapsed = range.collapsed;
  newStartBP = selection.normalizeBP(range.startContainer, range.startOffset);
  range.setStart(newStartBP.cont, newStartBP.offset);
  if (isCollapsed) {
    range.collapse(true);
    newEndBP = newStartBP;
  } else {
    newEndBP = selection.normalizeBP(range.endContainer, range.endOffset);
    range.setEnd(newEndBP.cont, newEndBP.offset);
  }
  return [newStartBP, newEndBP];
};

/**
 * returns a break point in the most pertinent text node given a random bp.
 * @param  {element} cont   the container of the break point
 * @param  {number} offset offset of the break point
 * @return {object} the suggested break point : {cont:newCont,offset:newOffset}
*/


selection.normalizeBP = function(cont, offset) {
  var newCont, newOffset, res;
  if (cont.nodeName === '#text') {
    res = {
      cont: cont,
      offset: offset
    };
  } else if (cont.nodeName === 'SPAN') {
    if (offset > 0) {
      newCont = cont.childNodes[offset - 1];
      newOffset = newCont.length;
    } else if (cont.childNodes.length > 0) {
      newCont = cont.firstChild;
      newOffset = 0;
    } else {
      newCont = document.createTextNode('');
      cont.appendChild(newCont);
      newOffset = 0;
    }
  } else if (cont.nodeName === 'DIV' && cont.id !== "editor-lines") {
    if (offset === 0) {
      res = selection.normalizeBP(cont.firstChild, 0);
    } else if (offset < cont.children.length - 1) {
      newCont = cont.children[offset - 1];
      newOffset = newCont.childNodes.length;
      res = selection.normalizeBP(newCont, newOffset);
    } else {
      newCont = cont.children[cont.children.length - 2];
      newOffset = newCont.childNodes.length;
      res = selection.normalizeBP(newCont, newOffset);
    }
  } else if (cont.nodeName === 'DIV' && cont.id === "editor-lines") {
    if (offset === 0) {
      newCont = cont.firstChild;
      newOffset = 0;
      res = selection.normalizeBP(newCont, newOffset);
    } else if (offset === cont.childNodes.length) {
      newCont = cont.lastChild;
      newOffset = newCont.childNodes.length;
      res = selection.normalizeBP(newCont, newOffset);
    } else {
      newCont = cont.children[offset - 1];
      newOffset = newCont.childNodes.length;
      res = selection.normalizeBP(newCont, newOffset);
    }
  }
  if (!res) {
    res = {
      cont: newCont,
      offset: newOffset
    };
  }
  return res;
};

selection._getLineDiv = function(elt) {
  var parent;
  parent = elt;
  while (!(parent.nodeName === 'DIV' && (parent.id != null) && parent.id.substr(0, 5) === 'CNID_') || parent.parentNode === null) {
    parent = parent.parentNode;
  }
  return parent;
};

/**
 * return the div corresponding to an element inside a line and tells wheter
 * the breabk point is at the end or at the beginning of the line
 * @param  {element} cont   the container of the break point
 * @param  {number} offset offset of the break point
 * @return {object}        {div[element], isStart[bool], isEnd[bool]}
*/


selection.getLineDivIsStartIsEnd = function(cont, offset) {
  var isEnd, isStart, nodesNum, parent;
  parent = cont;
  isStart = true;
  isEnd = true;
  while (!(parent.nodeName === 'DIV' && (parent.id != null) && parent.id.substr(0, 5) === 'CNID_') && parent.parentNode !== null) {
    isStart = isStart && (offset === 0);
    if (parent.length != null) {
      isEnd = isEnd && (offset === parent.length);
    } else {
      isEnd = isEnd && (offset === parent.childNodes.length - 1);
    }
    if (parent.previousSibling === null) {
      offset = 0;
    } else if (parent.nextSibling === null) {
      offset = parent.parentNode.childNodes.length - 1;
    } else if (parent.nextSibling.nextSibling === null) {
      offset = parent.parentNode.childNodes.length - 2;
    } else {
      offset = 1;
    }
    parent = parent.parentNode;
  }
  nodesNum = parent.childNodes.length;
  isStart = isStart && (offset === 0);
  if (parent.textContent === '') {
    isStart = true;
  }
  isEnd = isEnd && (offset === nodesNum - 1 || offset === nodesNum - 2);
  return {
    div: parent,
    isStart: isStart,
    isEnd: isEnd
  };
};

selection.putStartOnStart = function(range, elt) {
  var blank, offset;
  if ((elt != null ? elt.firstChild : void 0) != null) {
    offset = elt.firstChild.textContent.length;
    if (offset === 0) {
      elt.firstChild.data = " ";
    }
    return range.setStart(elt.firstChild, 0);
  } else if (elt != null) {
    blank = document.createTextNode(" ");
    elt.appendChild(blank);
    return range.setStart(blank, 0);
  }
};

selection.putEndOnStart = function(range, elt) {
  var blank, offset;
  if ((elt != null ? elt.firstChild : void 0) != null) {
    offset = elt.firstChild.textContent.length;
    if (offset === 0) {
      elt.firstChild.data = " ";
    }
    return range.setEnd(elt.firstChild, 0);
  } else if (elt != null) {
    blank = document.createTextNode(" ");
    elt.appendChild(blank);
    return range.setEnd(blank, 0);
  }
};

/**
 * Returns the DIV of the line where the break point is.
 * @param  {element} cont   The contener of the break point
 * @param  {number} offset Offset of the break point.
 * @return {element}        The DIV of the line where the break point is.
*/


selection.getLineDiv = function(cont, offset) {
  var startDiv;
  if (cont.nodeName === 'DIV') {
    if (cont.id === 'editor-lines') {
      startDiv = cont.children[offset];
    } else {
      startDiv = selection._getLineDiv(cont);
    }
  } else {
    startDiv = selection._getLineDiv(cont);
  }
  return startDiv;
};

selection.findClosestTextNode = function(targetNode) {
  return [node, offset];
};

exports.selection = selection;
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
#   _keyDownCallBack : (e) =>
#   _insertLineAfter  : (param) ->
#   _insertLineBefore : (param) ->
#   
#   editorIframe      : the iframe element where is nested the editor
#   editorBody$       : the jquery pointer on the body of the iframe
#   _lines            : {} an objet, each property refers a line
#   _highestId        : 
#   _firstLine        : points the first line : TODO : not taken into account
*/

var CNeditor, Line, md2cozy, selection,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

if (typeof require !== "undefined" && require !== null) {
  if (!(typeof md2cozy !== "undefined" && md2cozy !== null)) {
    md2cozy = require('./md2cozy').md2cozy;
  }
  if (!(typeof selection !== "undefined" && selection !== null)) {
    selection = require('./selection').selection;
  }
}

/**
 * line$        : 
 * lineID       : 
 * lineType     : 
 * lineDepthAbs : 
 * lineDepthRel : 
 * lineNext     : 
 * linePrev     :
*/


Line = (function() {
  /**
   * If no arguments, returns an empty object (only methods), otherwise
   * constructs a full line. The dom element of the line is inserted according
   * to the previous or next line given in the arguments.
   * @param  {Array}  Array of parameters :
   *   [ 
          editor        , # 
          type          , # 
          depthAbs      , # 
          depthRelative , # 
          prevLine      , # The prev line, null if nextLine is given
          nextLine      , # The next line, null if prevLine is given
          fragment        # [optional] a fragment to insert in the line, no br at the end
        ]
  */

  function Line() {
    var depthAbs, depthRelative, editor, fragment, lineID, linesDiv, newLineEl, nextL, nextLine, node, prevLine, type;
    if (arguments.length === 0) {
      return;
    } else {
      editor = arguments[0], type = arguments[1], depthAbs = arguments[2], depthRelative = arguments[3], prevLine = arguments[4], nextLine = arguments[5], fragment = arguments[6];
    }
    editor._highestId += 1;
    lineID = 'CNID_' + editor._highestId;
    newLineEl = document.createElement('div');
    newLineEl.id = lineID;
    newLineEl.setAttribute('class', type + '-' + depthAbs);
    if (fragment != null) {
      newLineEl.appendChild(fragment);
      newLineEl.appendChild(document.createElement('br'));
    } else {
      node = document.createElement('span');
      node.appendChild(document.createTextNode(''));
      newLineEl.appendChild(node);
      newLineEl.appendChild(document.createElement('br'));
    }
    this.line$ = $(newLineEl);
    if (prevLine != null) {
      this.linePrev = prevLine;
      linesDiv = prevLine.line$[0].parentNode;
      if (prevLine.lineNext != null) {
        nextL = prevLine.lineNext;
        linesDiv.insertBefore(newLineEl, nextL.line$[0]);
        this.lineNext = nextL;
        nextL.linePrev = this;
      } else {
        linesDiv.appendChild(newLineEl);
        this.lineNext = null;
      }
      prevLine.lineNext = this;
    } else if (nextLine != null) {
      linesDiv = nextLine.line$[0].parentNode;
      this.lineNext = nextLine;
      linesDiv.insertBefore(newLineEl, nextLine.line$[0]);
      if (nextLine.linePrev != null) {
        this.linePrev = nextLine.linePrev;
        nextLine.linePrev.lineNext = this;
      } else {
        this.linePrev = null;
      }
      nextLine.linePrev = this;
    }
    this.lineID = lineID;
    this.lineType = type;
    this.lineDepthAbs = depthAbs;
    this.lineDepthRel = depthRelative;
    editor._lines[lineID] = this;
  }

  Line.prototype.setType = function(type) {
    this.lineType = type;
    return this.line$.prop('class', "" + type + "-" + this.lineDepthAbs);
  };

  Line.prototype.setDepthAbs = function(absDepth) {
    this.lineDepthAbs = absDepth;
    return this.line$.prop('class', "" + this.lineType + "-" + absDepth);
  };

  Line.prototype.setTypeDepth = function(type, absDepth) {
    this.lineType = type;
    this.lineDepthAbs = absDepth;
    return this.line$.prop('class', "" + type + "-" + absDepth);
  };

  return Line;

})();

Line.clone = function(line) {
  var clone;
  clone = new Line();
  clone.line$ = line.line$.clone();
  clone.lineID = line.lineID;
  clone.lineType = line.lineType;
  clone.lineDepthAbs = line.lineDepthAbs;
  clone.lineDepthRel = line.lineDepthRel;
  clone.linePrev = line.linePrev;
  clone.lineNext = line.lineNext;
  return clone;
};

exports.CNeditor = (function() {
  /*
      #   Constructor : newEditor = new CNEditor( iframeTarget,callBack )
      #       iframeTarget = iframe where the editor will be nested
      #       callBack     = launched when editor ready, the context 
      #                      is set to the editorCtrl (callBack.call(this))
  */

  function CNeditor(editorTarget, callBack) {
    var cssEl, cssLink, editor_head$, iframe$,
      _this = this;
    this.editorTarget = editorTarget;
    this._processPaste = __bind(this._processPaste, this);

    this._waitForPasteData = __bind(this._waitForPasteData, this);

    this._keyUpCorrection = __bind(this._keyUpCorrection, this);

    this._keyDownCallBack = __bind(this._keyDownCallBack, this);

    if (this.editorTarget.nodeName === "IFRAME") {
      iframe$ = $(this.editorTarget);
      iframe$.on('load', function() {
        var cssLink, editor_head$, editor_html$;
        editor_html$ = iframe$.contents().find("html");
        _this.editorBody$ = editor_html$.find("body");
        _this.editorBody$.parent().attr('id', '__ed-iframe-html');
        _this.editorBody$.attr("id", "__ed-iframe-body");
        _this.document = _this.editorBody$[0].ownerDocument;
        editor_head$ = editor_html$.find("head");
        cssLink = '<link id="editorCSS" ';
        cssLink += 'href="stylesheets/CNeditor.css" rel="stylesheet">';
        editor_head$.html(cssLink);
        _this.linesDiv = document.createElement('div');
        _this.linesDiv.setAttribute('id', 'editor-lines');
        _this.linesDiv.setAttribute('contenteditable', 'true');
        _this.editorBody$.append(_this.linesDiv);
        _this._initClipBoard();
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
          historyPos: [null]
        };
        _this._lastKey = null;
        _this.editorBody$.prop('__editorCtl', _this);
        _this.linesDiv.addEventListener('keydown', _this._keyDownCallBack, true);
        _this.isSafari = Object.prototype.toString.call(window.HTMLElement);
        _this.isSafari = _this.isSafari.indexOf('Constructor') > 0;
        _this.isChrome = !_this.isSafari && 'WebkitTransform' in document.documentElement.style;
        _this.isChromeOrSafari = _this.isChrome || _this.isSafari;
        if (_this.isChromeOrSafari) {
          _this.linesDiv.addEventListener('keyup', _this._keyUpCorrection, false);
        }
        _this.linesDiv.addEventListener('mouseup', function() {
          return _this.newPosition = true;
        }, true);
        _this.editorBody$.on('keyup', function() {
          return iframe$.trigger(jQuery.Event("onKeyUp"));
        });
        _this.editorBody$.on('click', function(event) {
          return _this._lastKey = null;
        });
        _this.editorBody$.on('paste', function(event) {
          return _this.paste(event);
        });
        callBack.call(_this);
        return _this;
      });
      this.editorTarget.src = '';
    } else if (this.editorTarget.nodeName === "DIV") {
      iframe$ = $(this.editorTarget);
      this.editorBody$ = iframe$;
      this.document = $(document);
      editor_head$ = $(document).find("head");
      cssLink = '<link id="editorCSS" ';
      cssLink += 'href="stylesheets/CNeditor.css" rel="stylesheet">';
      cssEl = $(cssLink);
      editor_head$.append(cssEl);
      this.linesDiv = document.createElement('div');
      this.linesDiv.setAttribute('id', 'editor-lines');
      this.linesDiv.setAttribute('contenteditable', 'true');
      this.editorBody$.append(this.linesDiv);
      this.getEditorSelection = function() {
        return rangy.getSelection();
      };
      this.saveEditorSelection = function() {
        var sel;
        sel = rangy.getSelection();
        return rangy.serializeSelection(sel, true, this.linesDiv);
      };
      this._initClipBoard();
      this._lines = {};
      this.newPosition = true;
      this._highestId = 0;
      this._deepest = 1;
      this._firstLine = null;
      this._history = {
        index: 0,
        history: [null],
        historySelect: [null],
        historyScroll: [null],
        historyPos: [null]
      };
      this._lastKey = null;
      this.editorBody$.prop('__editorCtl', this);
      this.linesDiv.addEventListener('keydown', this._keyDownCallBack, true);
      this.isSafari = Object.prototype.toString.call(window.HTMLElement);
      this.isSafari = this.isSafari.indexOf('Constructor') > 0;
      this.isChrome = !this.isSafari && 'WebkitTransform' in document.documentElement.style;
      this.isChromeOrSafari = this.isChrome || this.isSafari;
      if (this.isChromeOrSafari) {
        this.linesDiv.addEventListener('keyup', this._keyUpCorrection, false);
      }
      this.linesDiv.addEventListener('mouseup', function() {
        return _this.newPosition = true;
      }, true);
      this.editorBody$.on('keyup', function() {
        return iframe$.trigger(jQuery.Event("onKeyUp"));
      });
      this.editorBody$.on('click', function(event) {
        return _this._lastKey = null;
      });
      this.editorBody$.on('paste', function(event) {
        return _this.paste(event);
      });
      callBack.call(this);
      return this;
    }
  }

  CNeditor.prototype.setFocus = function() {
    return this.linesDiv.focus();
  };

  CNeditor.prototype.getEditorSelection = function() {
    return rangy.getIframeSelection(this.editorTarget);
  };

  CNeditor.prototype.saveEditorSelection = function() {
    var sel;
    sel = rangy.getIframeSelection(this.editorTarget);
    return rangy.serializeSelection(sel, true, this.linesDiv);
  };

  /* ------------------------------------------------------------------------
  # EXTENSION : _updateDeepest
  # 
  # Find the maximal deep (thus the deepest line) of the text
  # TODO: improve it so it only calculates the new depth from the modified
  #       lines (not all of them)
  # TODO: set a class system rather than multiple CSS files. Thus titles
  #       classes look like "Th-n depth3" for instance if max depth is 3
  # note: These todos arent our priority for now
  */


  CNeditor.prototype._updateDeepest = function() {
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

  /** ------------------------------------------------------------------------
   * Initialize the editor content from a html string
   * The html string should not been pretified because of the spaces and
   * charriage return. 
   * If unPretify = true then a regex tries to set up things
  */


  CNeditor.prototype.replaceContent = function(htmlString, unPretify) {
    if (unPretify) {
      htmlString = htmlString.replace(/>[\n ]*</g, "><");
    }
    this.linesDiv.innerHTML = htmlString;
    return this._readHtml();
  };

  /* ------------------------------------------------------------------------
  # Clear editor content
  */


  CNeditor.prototype.deleteContent = function() {
    var emptyLine;
    emptyLine = '<div id="CNID_1" class="Tu-1"><span></span><br></div>';
    this.linesDiv.innerHTML = emptyLine;
    return this._readHtml();
  };

  /* ------------------------------------------------------------------------
  # Returns a markdown string representing the editor content
  */


  CNeditor.prototype.getEditorContent = function() {
    return md2cozy.cozy2md($(this.linesDiv));
  };

  /* ------------------------------------------------------------------------
  # Sets the editor content from a markdown string
  */


  CNeditor.prototype.setEditorContent = function(mdContent) {
    var cozyContent;
    cozyContent = md2cozy.md2cozy(mdContent);
    this.linesDiv.innerHTML = cozyContent;
    return this._readHtml();
  };

  /*
      # Change the path of the css applied to the editor iframe
  */


  CNeditor.prototype.replaceCSS = function(path) {
    var document, linkElm;
    document = this.document;
    linkElm = document.querySelector('#editorCSS');
    linkElm.setAttribute('href', path);
    return document.head.appendChild(linkElm);
  };

  /**
   * Return [metaKeyCode,keyCode] corresponding to the key strike combinaison. 
   * the string structure = [meta key]-[key]
   *   * [metaKeyCode] : (Alt)*(Ctrl)*(Shift)*
   *   * [keyCode] : (return|end|...|A|S|V|Y|Z)|(other) 
   * ex : 
   *   * "AltShift" & "up" 
   *   * "AltCtrl" & "down" 
   *   * "Shift" & "A"
   *   * "Ctrl" & "S"
   *   * "" & "other"
   * @param  {[type]} e [description]
   * @return {[type]}   [description]
  */


  CNeditor.prototype.getShortCut = function(e) {
    var keyCode, metaKeyCode, shortcut;
    metaKeyCode = (e.altKey ? "Alt" : "") + 
                              (e.ctrlKey ? "Ctrl" : "") + 
                              (e.shiftKey ? "Shift" : "");
    switch (e.keyCode) {
      case 13:
        keyCode = 'return';
        break;
      case 35:
        keyCode = 'end';
        break;
      case 36:
        keyCode = 'home';
        break;
      case 33:
        keyCode = 'pgUp';
        break;
      case 34:
        keyCode = 'pgDwn';
        break;
      case 37:
        keyCode = 'left';
        break;
      case 38:
        keyCode = 'up';
        break;
      case 39:
        keyCode = 'right';
        break;
      case 40:
        keyCode = 'down';
        break;
      case 9:
        keyCode = 'tab';
        break;
      case 8:
        keyCode = 'backspace';
        break;
      case 32:
        keyCode = 'space';
        break;
      case 27:
        keyCode = 'esc';
        break;
      case 46:
        keyCode = 'suppr';
        break;
      default:
        switch (e.which) {
          case 32:
            keyCode = 'space';
            break;
          case 8:
            keyCode = 'backspace';
            break;
          case 65:
            keyCode = 'A';
            break;
          case 83:
            keyCode = 'S';
            break;
          case 86:
            keyCode = 'V';
            break;
          case 89:
            keyCode = 'Y';
            break;
          case 90:
            keyCode = 'Z';
            break;
          default:
            keyCode = 'other';
        }
    }
    shortcut = metaKeyCode + '-' + keyCode;
    if (metaKeyCode === '' && (keyCode === 'A' || keyCode === 'S' || keyCode === 'V' || keyCode === 'Y' || keyCode === 'Z')) {
      keyCode = 'other';
    }
    return [metaKeyCode, keyCode];
  };

  /* ------------------------------------------------------------------------
  #   _keyDownCallBack
  # 
  # The listener of keyPress event on the editor's iframe... the king !
  */


  /*
      # SHORTCUT
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


  CNeditor.prototype._keyDownCallBack = function(e) {
    var keyCode, metaKeyCode, shortcut, _ref;
    _ref = this.getShortCut(e), metaKeyCode = _ref[0], keyCode = _ref[1];
    shortcut = metaKeyCode + '-' + keyCode;
    switch (e.keyCode) {
      case 16:
        e.preventDefault();
        return;
      case 17:
        e.preventDefault();
        return;
      case 18:
        e.preventDefault();
        return;
    }
    if (this._lastKey !== shortcut && (shortcut === '-tab' || shortcut === '-return' || shortcut === '-backspace' || shortcut === '-suppr' || shortcut === 'CtrlShift-down' || shortcut === 'CtrlShift-up' || shortcut === 'CtrlShift-left' || shortcut === 'CtrlShift-right' || shortcut === 'Ctrl-V' || shortcut === 'Shift-tab' || shortcut === '-space' || shortcut === '-other' || shortcut === 'Alt-A')) {
      this._addHistory();
    }
    this._lastKey = shortcut;
    this.currentSel = {
      sel: null,
      range: null,
      startLine: null,
      endLine: null,
      rangeIsStartLine: null,
      rangeIsEndLine: null,
      startBP: null,
      endBP: null
    };
    if ((keyCode === 'left' || keyCode === 'up' || keyCode === 'right' || keyCode === 'down' || keyCode === 'pgUp' || keyCode === 'pgDwn' || keyCode === 'end' || keyCode === 'home' || keyCode === 'return' || keyCode === 'suppr' || keyCode === 'backspace') && (shortcut !== 'CtrlShift-down' && shortcut !== 'CtrlShift-up' && shortcut !== 'CtrlShift-right' && shortcut !== 'CtrlShift-left')) {
      this.newPosition = true;
    }
    switch (shortcut) {
      case '-return':
        this.updateCurrentSelIsStartIsEnd();
        this._return();
        this.newPosition = false;
        return e.preventDefault();
      case '-backspace':
        this.updateCurrentSelIsStartIsEnd();
        this._backspace();
        this.newPosition = false;
        return e.preventDefault();
      case '-tab':
        this.tab();
        return e.preventDefault();
      case 'Shift-tab':
        this.shiftTab();
        return e.preventDefault();
      case '-suppr':
        this.updateCurrentSelIsStartIsEnd();
        this._suppr(e);
        return this.newPosition = false;
      case 'CtrlShift-down':
        this._moveLinesDown();
        return e.preventDefault();
      case 'CtrlShift-up':
        this._moveLinesUp();
        return e.preventDefault();
      case 'Ctrl-A':
        selection.selectAll(this);
        return e.preventDefault();
      case 'Alt-A':
        this.toggleType();
        e.preventDefault();
        return console.log('EVENT (editor)');
      case '-other':
      case '-space':
        if (this.newPosition) {
          this.updateCurrentSel();
        }
        return this.newPosition = false;
      case 'Ctrl-V':
        return true;
      case 'Ctrl-S':
        $(this.editorTarget).trigger(jQuery.Event('saveRequest'));
        return e.preventDefault();
      case 'Ctrl-Z':
        this.unDo();
        return e.preventDefault();
      case 'Ctrl-Y':
        this.reDo();
        return e.preventDefault();
    }
  };

  /**
   * updates @currentSel =
          sel              : {Selection} of the editor's document
          range            : sel.getRangeAt(0)
          startLine        : the 1st line of the current selection
          endLine          : the last line of the current selection
          rangeIsStartLine : {boolean} true if the selection ends at 
                             the end of its line : NOT UPDATE HERE - see
                             updateCurrentSelIsStartIsEnd
          rangeIsEndLine   : {boolean} true if the selection starts at 
                             the start of its line : NOT UPDATE HERE - see
                             updateCurrentSelIsStartIsEnd
          theoricalRange   : theoricalRange : normalization of the selection 
                             should put each break points in a node text. It 
                             doesn't work in chrome due to a bug. We therefore
                             store here the "theorical range" that the
                             selection should match. It means that if you are
                             not in chrome this is equal to range.
     If the caret position has just changed (@newPosition == true) then we
     normalise the selection (put its break points in text nodes)
     We also normalize if in Chrome because in order to have a range wit
     break points in text nodes.
   * @return {object} @currentSel
  */


  CNeditor.prototype.updateCurrentSel = function() {
    var endLine, newEndBP, newStartBP, range, sel, startLine, theoricalRange, _ref;
    sel = this.getEditorSelection();
    range = sel.getRangeAt(0);
    if (this.newPosition || this.isChromeOrSafari) {
      _ref = selection.normalize(range), newStartBP = _ref[0], newEndBP = _ref[1];
      theoricalRange = document.createRange();
      theoricalRange.setStart(newStartBP.cont, newStartBP.offset);
      theoricalRange.setEnd(newEndBP.cont, newEndBP.offset);
    } else {
      theoricalRange = range;
    }
    startLine = this._lines[selection.getLineDiv(range.startContainer).id];
    endLine = this._lines[selection.getLineDiv(range.endContainer).id];
    this.currentSel = {
      sel: sel,
      range: range,
      startLine: startLine,
      endLine: endLine,
      rangeIsStartLine: null,
      rangeIsEndLine: null,
      theoricalRange: theoricalRange
    };
    return this.currentSel;
  };

  /**
   * updates @currentSel and check if range is at the start of begin of the
   * corresponding line. 
   * @currentSel =
          sel              : {Selection} of the editor's document
          range            : sel.getRangeAt(0)
          startLine        : the 1st line of the current selection
          endLine          : the last line of the current selection
          rangeIsStartLine : {boolean} true if the selection ends at 
                             the end of its line.
          rangeIsEndLine   : {boolean} true if the selection starts at 
                             the start of its line.
          theoricalRange   : theoricalRange : normalization of the selection 
                             should put each break points in a node text. It 
                             doesn't work in chrome due to a bug. We therefore
                             store here the "theorical range" that the
                             selection should match. It means that if you are
                             not in chrome this is equal to range.
     If the caret position has just changed (@newPosition == true) then we
     normalise the selection (put its break points in text nodes)
     We also normalize if in Chrome because in order to have a range wit
     break points in text nodes.
   * @return {object} @currentSel
  */


  CNeditor.prototype.updateCurrentSelIsStartIsEnd = function() {
    var div, endContainer, endLine, initialEndOffset, initialStartOffset, isEnd, isStart, newEndBP, newStartBP, noMatter, range, sel, startContainer, startLine, theoricalRange, _ref, _ref1, _ref2;
    sel = this.getEditorSelection();
    range = sel.getRangeAt(0);
    if (this.newPosition || this.isChromeOrSafari) {
      _ref = selection.normalize(range), newStartBP = _ref[0], newEndBP = _ref[1];
      theoricalRange = document.createRange();
      theoricalRange.setStart(newStartBP.cont, newStartBP.offset);
      theoricalRange.setEnd(newEndBP.cont, newEndBP.offset);
    } else {
      theoricalRange = range;
    }
    startContainer = range.startContainer;
    endContainer = range.endContainer;
    initialStartOffset = range.startOffset;
    initialEndOffset = range.endOffset;
    _ref1 = selection.getLineDivIsStartIsEnd(startContainer, initialStartOffset), div = _ref1.div, isStart = _ref1.isStart, noMatter = _ref1.noMatter;
    startLine = this._lines[div.id];
    _ref2 = selection.getLineDivIsStartIsEnd(endContainer, initialEndOffset), div = _ref2.div, noMatter = _ref2.noMatter, isEnd = _ref2.isEnd;
    endLine = this._lines[div.id];
    this.currentSel = {
      sel: sel,
      range: range,
      startLine: startLine,
      endLine: endLine,
      rangeIsStartLine: isStart,
      rangeIsEndLine: isEnd,
      theoricalRange: theoricalRange
    };
    return this.currentSel;
  };

  /**
   * This function is called only if in Chrome, because the insertion of a caracter
   * by the browser may out of a span. 
   * This is du to a bug in Chrome : you can create a range with its start 
   * break point in an empty span. But if you add this range to the selection,
   * then this latter will not respect your range and its start break point 
   * will be outside the range. When a key is pressed to insert a caracter,
   * the browser inserts it at the start break point, ie outside the span...
   * this function detects after each keyup is there is a text node outside a
   * span and move its content and the carret.
   * @param  {Event} e The key event
  */


  CNeditor.prototype._keyUpCorrection = function(e) {
    var brNode, curSel, i, l, line, newSpan, node, nodes, t, _ref, _ref1, _ref2;
    curSel = this.updateCurrentSel();
    line = curSel.startLine.line$[0];
    nodes = line.childNodes;
    l = nodes.length;
    i = 0;
    while (i < l) {
      node = nodes[i];
      if (node.nodeName === '#text') {
        t = node.textContent;
        if (node.previousSibling) {
          if ((_ref = node.previousSibling.nodeName) === 'SPAN' || _ref === 'A') {
            node.previousSibling.textContent += t;
          } else {
            throw new Error('A line should be constituted of \
                            only <span> and <a>');
          }
        } else if (node.nextSibling) {
          if ((_ref1 = node.nextSibling.nodeName) === 'SPAN' || _ref1 === 'A') {
            node.nextSibling.textContent = t + node.nextSibling.textContent;
          } else if ((_ref2 = node.nextSibling.nodeName) === 'BR') {
            newSpan = document.createElement('span');
            newSpan.textContent = t;
            line.replaceChild(newSpan, node);
            l += 1;
            i += 1;
          } else {
            throw new Error('A line should be constituted of \
                            only <span> and <a>');
          }
        } else {
          throw new Error('A line should be constituted of a final\
                            <br/>');
        }
        line.removeChild(node);
        l -= 1;
      } else {
        i += 1;
      }
    }
    if (nodes[l - 1].nodeName !== 'BR') {
      brNode = document.createElement('br');
      line.appendChild(brNode);
    }
    return true;
  };

  /* ------------------------------------------------------------------------
  #  _suppr :
  # 
  # Manage deletions when suppr key is pressed
  */


  CNeditor.prototype._suppr = function(event) {
    var range, startLine, startOffset, textNode, txt;
    startLine = this.currentSel.startLine;
    if (this.currentSel.range.collapsed) {
      if (this.currentSel.rangeIsEndLine) {
        if (startLine.lineNext !== null) {
          this.currentSel.range.setEndBefore(startLine.lineNext.line$[0].firstChild);
          this.currentSel.theoricalRange = this.currentSel.range;
          this.currentSel.endLine = startLine.lineNext;
          this._deleteMultiLinesSelections();
        } else {

        }
      } else {
        textNode = this.currentSel.range.startContainer;
        startOffset = this.currentSel.range.startOffset;
        txt = textNode.textContent;
        textNode.textContent = txt.substr(0, startOffset) + txt.substr(startOffset + 1);
        range = rangy.createRange();
        range.collapseToPoint(textNode, startOffset);
        this.currentSel.sel.setSingleRange(range);
      }
    } else if (this.currentSel.endLine === startLine) {
      this.currentSel.range.deleteContents();
    } else {
      this._deleteMultiLinesSelections();
    }
    event.preventDefault();
    return false;
  };

  /* ------------------------------------------------------------------------
  #  _backspace
  # 
  # Manage deletions when backspace key is pressed
  */


  CNeditor.prototype._backspace = function() {
    var cloneRg, range, sel, startLine, startOffset, textNode, txt;
    sel = this.currentSel;
    startLine = sel.startLine;
    if (sel.range.collapsed) {
      if (sel.rangeIsStartLine) {
        if (startLine.linePrev !== null) {
          cloneRg = sel.range.cloneRange();
          cloneRg.setStartBefore(startLine.linePrev.line$[0].lastChild);
          selection.normalize(cloneRg);
          this.currentSel.theoricalRange = cloneRg;
          sel.startLine = startLine.linePrev;
          this._deleteMultiLinesSelections();
        }
      } else {
        textNode = sel.range.startContainer;
        startOffset = sel.range.startOffset;
        txt = textNode.textContent;
        textNode.textContent = txt.substr(0, startOffset - 1) + txt.substr(startOffset);
        range = rangy.createRange();
        range.collapseToPoint(textNode, startOffset - 1);
        this.currentSel.sel.setSingleRange(range);
        this.currentSel = null;
      }
    } else if (sel.endLine === startLine) {
      sel.range.deleteContents();
    } else {
      this._deleteMultiLinesSelections();
    }
    return true;
  };

  /* ------------------------------------------------------------------------
  #  titleList
  # 
  # Turn selected lines in a title List (Th)
  */


  CNeditor.prototype.titleList = function(l) {
    var endDiv, endLineID, line, range, startDiv, startDivID, _results;
    if (l != null) {
      startDivID = l.lineID;
      endLineID = startDivID;
    } else {
      range = this.getEditorSelection().getRangeAt(0);
      startDiv = selection.getLineDiv(range.startContainer, range.startOffset);
      endDiv = selection.getLineDiv(range.endContainer, range.endOffset);
      startDivID = startDiv.id;
      endLineID = endDiv.id;
    }
    line = this._lines[startDivID];
    _results = [];
    while (true) {
      switch (line.lineType) {
        case 'Tu':
        case 'To':
          this._toggleLineType(line);
          break;
        case 'Lh':
          line.setType('Th');
          break;
        case 'Lu':
          line.setType('Tu');
          this._toggleLineType(line);
      }
      if (line.lineID === endLineID) {
        break;
      }
      _results.push(line = line.lineNext);
    }
    return _results;
  };

  /* ------------------------------------------------------------------------
  #  markerList
  # 
  #  Turn selected lines in a Marker List
  */


  CNeditor.prototype.markerList = function(l) {
    var endDiv, endLineID, line, range, startDiv, startDivID, _results;
    this._addHistory();
    if (l != null) {
      startDivID = l.lineID;
      endLineID = startDivID;
    } else {
      range = this.getEditorSelection().getRangeAt(0);
      startDiv = selection.getLineDiv(range.startContainer, range.startOffset);
      endDiv = selection.getLineDiv(range.endContainer, range.endOffset);
      startDivID = startDiv.id;
      endLineID = endDiv.id;
    }
    line = this._lines[startDivID];
    _results = [];
    while (true) {
      switch (line.lineType) {
        case 'Th':
        case 'To':
          this._toggleLineType(line);
          break;
        case 'Lh':
        case 'Lo':
          line.setTypeDepth('Tu', line.lineDepthAbs + 1);
          break;
        case 'Lu':
          line.setType('Tu');
      }
      if (line.lineID === endLineID) {
        break;
      }
      _results.push(line = line.lineNext);
    }
    return _results;
  };

  /* ------------------------------------------------------------------------
  #  _findDepthRel
  # 
  # Calculates the relative depth of the line
  #   usage   : cycle : Tu => To => Lx => Th
  #   param   : line : the line we want to find the relative depth
  #   returns : a number
  #
  */


  CNeditor.prototype._findDepthRel = function(line) {
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
  # Toggle the selected lines type
  #   cycle : Tu <=> Th
  */


  CNeditor.prototype.toggleType = function() {
    var currentDepth, depthIsTreated, done, endDiv, endLineID, line, range, sel, startDiv;
    sel = this.getEditorSelection();
    range = sel.getRangeAt(0);
    startDiv = selection.getLineDiv(range.startContainer, range.startOffset);
    endDiv = selection.getLineDiv(range.endContainer, range.endOffset);
    endLineID = endDiv.id;
    line = this._lines[startDiv.id];
    depthIsTreated = {};
    currentDepth = line.lineDepthAbs;
    depthIsTreated[currentDepth] = false;
    while (true) {
      if (!depthIsTreated[currentDepth]) {
        done = this._toggleLineType(line);
        depthIsTreated[line.lineDepthAbs] = done;
      }
      if (line.lineID === endDiv.id) {
        return;
      }
      line = line.lineNext;
      if (line.lineDepthAbs < currentDepth) {
        depthIsTreated[currentDepth] = false;
        currentDepth = line.lineDepthAbs;
      } else {
        currentDepth = line.lineDepthAbs;
      }
    }
  };

  CNeditor.prototype._toggleLineType = function(line) {
    var l, lineTypeTarget;
    switch (line.lineType) {
      case 'Tu':
        lineTypeTarget = 'Th';
        l = line.lineNext;
        while (l !== null && l.lineDepthAbs >= line.lineDepthAbs) {
          if (l.lineDepthAbs === line.lineDepthAbs) {
            if (l.lineType === 'Tu') {
              l.setType('Th');
            } else if (l.lineType === 'Lu') {
              l.setType('Lh');
            } else {
              break;
            }
          }
          l = l.lineNext;
        }
        l = line.linePrev;
        while (l !== null && l.lineDepthAbs >= line.lineDepthAbs) {
          if (l.lineDepthAbs === line.lineDepthAbs) {
            if (l.lineType === 'Tu') {
              l.setType('Th');
            } else if (l.lineType === 'Lu') {
              l.setType('Lh');
            } else {
              break;
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
              l.setType('Tu');
            } else if (l.lineType === 'Lh') {
              l.setType('Lu');
            } else {
              break;
            }
          }
          l = l.lineNext;
        }
        l = line.linePrev;
        while (l !== null && l.lineDepthAbs >= line.lineDepthAbs) {
          if (l.lineDepthAbs === line.lineDepthAbs) {
            if (l.lineType === 'Th') {
              l.setType('Tu');
            } else if (l.lineType === 'Lh') {
              l.setType('Lu');
            } else {
              break;
            }
          }
          l = l.linePrev;
        }
        break;
      default:
        return false;
    }
    line.setType(lineTypeTarget);
    return true;
  };

  /* ------------------------------------------------------------------------
  #  tab
  # 
  # tab keypress
  #   l = optional : a line to indent. If none, the selection will be indented
  */


  CNeditor.prototype.tab = function(l) {
    var endDiv, endLineID, line, range, sel, startDiv, _results;
    if (l != null) {
      startDiv = l.line$[0];
      endDiv = startDiv;
    } else {
      sel = this.getEditorSelection();
      range = sel.getRangeAt(0);
      startDiv = selection.getLineDiv(range.startContainer, range.startOffset);
      endDiv = selection.getLineDiv(range.endContainer, range.endOffset);
    }
    endLineID = endDiv.id;
    line = this._lines[startDiv.id];
    _results = [];
    while (true) {
      this._tabLine(line);
      if (line.lineID === endLineID) {
        break;
      } else {
        _results.push(line = line.lineNext);
      }
    }
    return _results;
  };

  CNeditor.prototype._tabLine = function(line) {
    var depthAbsTarget, nextSib, nextSibType, prevSib, prevSibType, prevSibling, typeTarget;
    switch (line.lineType) {
      case 'Tu':
      case 'Th':
      case 'To':
        prevSibling = this._findPrevSibling(line);
        if (prevSibling === null) {
          return;
        }
        if (prevSibling.lineType === 'Th') {
          typeTarget = 'Lh';
        } else if (prevSibling.lineType === 'Tu') {
          typeTarget = 'Lu';
        } else {
          typeTarget = 'Lo';
        }
        break;
      case 'Lh':
      case 'Lu':
      case 'Lo':
        depthAbsTarget = line.lineDepthAbs + 1;
        nextSib = this._findNextSibling(line, depthAbsTarget);
        nextSibType = nextSib === null ? null : nextSib.lineType;
        prevSib = this._findPrevSibling(line, depthAbsTarget);
        prevSibType = prevSib === null ? null : prevSib.lineType;
        typeTarget = this._chooseTypeTarget(prevSibType, nextSibType);
        if (typeTarget === 'Th') {
          line.lineDepthAbs += 1;
          line.lineDepthRel = 0;
        } else {
          line.lineDepthAbs += 1;
          line.lineDepthRel += 1;
        }
    }
    return line.setType(typeTarget);
  };

  CNeditor.prototype._chooseTypeTarget = function(prevSibType, nextSibType) {
    var typeTarget;
    if ((prevSibType === nextSibType && nextSibType === null)) {
      typeTarget = 'Tu';
    } else if (prevSibType === nextSibType) {
      typeTarget = nextSibType;
    } else if (prevSibType === null) {
      typeTarget = nextSibType;
    } else if (nextSibType === null) {
      typeTarget = prevSibType;
    } else {
      typeTarget = 'Tu';
    }
    return typeTarget;
  };

  /* ------------------------------------------------------------------------
  #  shiftTab
  #   param : myRange : if defined, refers to a specific region to untab
  */


  CNeditor.prototype.shiftTab = function(range) {
    var endDiv, endLineID, line, sel, startDiv, _results;
    if (range == null) {
      sel = this.getEditorSelection();
      range = sel.getRangeAt(0);
    }
    startDiv = selection.getLineDiv(range.startContainer, range.startOffset);
    endDiv = selection.getLineDiv(range.endContainer, range.endOffset);
    endLineID = endDiv.id;
    line = this._lines[startDiv.id];
    _results = [];
    while (true) {
      this._shiftTabLine(line);
      if (line.lineID === endDiv.id) {
        break;
      } else {
        _results.push(line = line.lineNext);
      }
    }
    return _results;
  };

  /**
   * un-tab a single line
   * @param  {line} line the line to un-tab
  */


  CNeditor.prototype._shiftTabLine = function(line) {
    var depthAbsTarget, nextL, nextSib, nextSibType, parent, prevSib, prevSibType, typeTarget;
    switch (line.lineType) {
      case 'Tu':
      case 'Th':
      case 'To':
        parent = line.linePrev;
        while (parent !== null && parent.lineDepthAbs >= line.lineDepthAbs) {
          parent = parent.linePrev;
        }
        if (parent === null) {
          return;
        }
        if ((line.lineNext != null) && line.lineNext.lineType[0] === 'L' && line.lineNext.lineDepthAbs === line.lineDepthAbs) {
          nextL = line.lineNext;
          nextL.setType('T' + nextL.lineType[1]);
        }
        if ((line.lineNext != null) && line.lineNext.lineDepthAbs > line.lineDepthAbs) {
          nextL = line.lineNext;
          while (nextL.lineDepthAbs > line.lineDepthAbs) {
            nextL.setDepthAbs(nextL.lineDepthAbs - 1);
            nextL = nextL.lineNext;
          }
          if ((nextL != null) && nextL.lineType[0] === 'L') {
            nextL.setType('T' + nextL.lineType[1]);
          }
        }
        typeTarget = parent.lineType;
        typeTarget = "L" + typeTarget.charAt(1);
        line.lineDepthAbs -= 1;
        line.lineDepthRel -= parent.lineDepthRel;
        break;
      case 'Lh':
      case 'Lu':
      case 'Lo':
        depthAbsTarget = line.lineDepthAbs;
        nextSib = this._findNextSibling(line, depthAbsTarget);
        nextSibType = nextSib === null ? null : nextSib.lineType;
        prevSib = this._findPrevSibling(line, depthAbsTarget);
        prevSibType = prevSib === null ? null : prevSib.lineType;
        typeTarget = this._chooseTypeTarget(prevSibType, nextSibType);
    }
    return line.setType(typeTarget);
  };

  /* ------------------------------------------------------------------------
  #  _return
  # return keypress
  #   e = event
  */


  CNeditor.prototype._return = function() {
    var currSel, endLine, endOfLineFragment, newLine, range4sel, startLine;
    currSel = this.currentSel;
    startLine = currSel.startLine;
    endLine = currSel.endLine;
    if (currSel.range.collapsed) {

    } else if (endLine === startLine) {
      currSel.range.deleteContents();
    } else {
      this._deleteMultiLinesSelections();
      currSel = this.updateCurrentSelIsStartIsEnd();
      startLine = currSel.startLine;
    }
    if (currSel.rangeIsEndLine) {
      newLine = this._insertLineAfter({
        sourceLine: startLine,
        targetLineType: startLine.lineType,
        targetLineDepthAbs: startLine.lineDepthAbs,
        targetLineDepthRel: startLine.lineDepthRel
      });
      range4sel = rangy.createRange();
      range4sel.collapseToPoint(newLine.line$[0].firstChild.firstChild, 0);
      return currSel.sel.setSingleRange(range4sel);
    } else if (currSel.rangeIsStartLine) {
      newLine = this._insertLineBefore({
        sourceLine: startLine,
        targetLineType: startLine.lineType,
        targetLineDepthAbs: startLine.lineDepthAbs,
        targetLineDepthRel: startLine.lineDepthRel
      });
      range4sel = rangy.createRange();
      range4sel.collapseToPoint(startLine.line$[0].firstChild.firstChild, 0);
      return currSel.sel.setSingleRange(range4sel);
    } else {
      currSel.range.setEndBefore(startLine.line$[0].lastChild);
      endOfLineFragment = currSel.range.extractContents();
      currSel.range.deleteContents();
      newLine = this._insertLineAfter({
        sourceLine: startLine,
        targetLineType: startLine.lineType,
        targetLineDepthAbs: startLine.lineDepthAbs,
        targetLineDepthRel: startLine.lineDepthRel,
        fragment: endOfLineFragment
      });
      range4sel = rangy.createRange();
      range4sel.collapseToPoint(newLine.line$[0].firstChild.firstChild, 0);
      currSel.sel.setSingleRange(range4sel);
      return this.currentSel = null;
    }
  };

  /* ------------------------------------------------------------------------
  #  _findParent1stSibling
  # 
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


  CNeditor.prototype._findParent1stSibling = function(line) {
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

  /** -----------------------------------------------------------------------
   * Find the next sibling line.
   * Returns null if no next sibling, the line otherwise.
   * The sibling is a title (Th, Tu or To), not a line (Lh nor Lu nor Lo)
   * @param  {line} line     The starting line for which we search a sibling
   * @param  {number} depthAbs [optional] If the siblings we search is not
   *                           of the same absolute depth
   * @return {line}          The next sibling if one, null otherwise
  */


  CNeditor.prototype._findNextSibling = function(line, depth) {
    var nextSib;
    if (!(depth != null)) {
      depth = line.lineDepthAbs;
    }
    nextSib = line.lineNext;
    while (true) {
      if (nextSib === null || nextSib.lineDepthAbs < depth) {
        nextSib = null;
        break;
      } else if (nextSib.lineDepthAbs === depth && nextSib.lineType[0] === 'T') {
        break;
      }
      nextSib = nextSib.lineNext;
    }
    return nextSib;
  };

  /** -----------------------------------------------------------------------
   * Find the previous sibling line.
   * Returns null if no previous sibling, the line otherwise.
   * The sibling is a title (Th, Tu or To), not a line (Lh nor Lu nor Lo)
   * @param  {line} line     Rhe starting line for which we search a sibling
   * @param  {number} depthAbs [optional] If the siblings we search is not
   *                           of the same absolute depth
   * @return {line}          The previous sibling if one, null otherwise
  */


  CNeditor.prototype._findPrevSibling = function(line, depth) {
    var prevSib;
    if (!(depth != null)) {
      depth = line.lineDepthAbs;
    }
    prevSib = line.linePrev;
    while (true) {
      if (prevSib === null || prevSib.lineDepthAbs < depth) {
        prevSib = null;
        break;
      } else if (prevSib.lineDepthAbs === depth && prevSib.lineType[0] === 'T') {
        break;
      }
      prevSib = prevSib.linePrev;
    }
    return prevSib;
  };

  /**
  # Delete the user multi line selection :
  #    * The 2 lines (selected of given in param) must be distinct
  #    * If no params :
  #        - @currentSel.theoricalRange will the range used to find the  
  #          lines to delete. 
  #        - Only the range is deleted, not the beginning of startline nor the
  #          end of endLine
  #        - the caret is positionned at the firts break point of range.
  #    * if startLine and endLine is given
  #       - the whole lines from start and endLine are deleted, both included.
  #       - the caret position is not modified
  # @param  {[line]} startLine [optional] if exists, the whole line will be deleted
  # @param  {[line]} endLine   [optional] if exists, the whole line will be deleted
  # @return {[none]}           [nothing]
  */


  CNeditor.prototype._deleteMultiLinesSelections = function(startLine, endLine) {
    var deltaDepth, endLineDepth, endOfLineFragment, range, replaceCaret, startContainer, startLineDepth, startOffset;
    if (startLine === null || endLine === null) {
      throw new Error('CEeditor._deleteMultiLinesSelections called with a null param');
    }
    if (startLine != null) {
      range = rangy.createRange();
      selection.cleanSelection(startLine, endLine, range);
      replaceCaret = false;
    } else {
      range = this.currentSel.theoricalRange;
      startContainer = range.startContainer;
      startOffset = range.startOffset;
      startLine = this.currentSel.startLine;
      endLine = this.currentSel.endLine;
      replaceCaret = true;
    }
    startLineDepth = startLine.lineDepthAbs;
    endLineDepth = endLine.lineDepthAbs;
    deltaDepth = endLineDepth - startLineDepth;
    endOfLineFragment = selection.cloneEndFragment(range, endLine);
    this._adaptEndLineType(startLine, endLine, endLineDepth);
    range.deleteContents();
    this._addMissingFragment(startLine, endOfLineFragment);
    this._removeEndLine(startLine, endLine);
    this._adaptDepth(startLine, startLineDepth, endLineDepth, deltaDepth);
    if (replaceCaret) {
      return this._setCaret(startContainer, startOffset);
    }
  };

  CNeditor.prototype._adaptDepth = function(startLine, startLineDepthAbs, endLineDepthAbs, deltaDepth) {
    var deltaDepth1stLine, depthSibling, firstLineAfterSiblingsOfDeleted, line, newDepth, prevSiblingType;
    line = startLine.lineNext;
    if (line !== null) {
      deltaDepth1stLine = line.lineDepthAbs - startLineDepthAbs;
      if (deltaDepth1stLine > 1) {
        while (line !== null && line.lineDepthAbs >= endLineDepthAbs) {
          newDepth = line.lineDepthAbs - deltaDepth;
          line.setDepthAbs(newDepth);
          line = line.lineNext;
        }
      }
    }
    if (line !== null) {
      if (line.lineType[0] === 'L') {
        if (!(startLine.lineType[1] === line.lineType[1] && startLine.lineDepthAbs === line.lineDepthAbs)) {
          line.setType('T' + line.lineType[1]);
        }
      }
      firstLineAfterSiblingsOfDeleted = line;
      depthSibling = line.lineDepthAbs;
      while (line !== null && line.lineDepthAbs > depthSibling) {
        line = line.linePrev;
      }
      if (line !== null && line !== firstLineAfterSiblingsOfDeleted) {
        prevSiblingType = line.lineType;
        if (firstLineAfterSiblingsOfDeleted.lineType !== prevSiblingType) {
          if (prevSiblingType[1] === 'h') {
            return this.titleList(firstLineAfterSiblingsOfDeleted);
          } else {
            return this.markerList(firstLineAfterSiblingsOfDeleted);
          }
        }
      }
    }
  };

  CNeditor.prototype._addMissingFragment = function(line, fragment) {
    var lastNode, lineEl, newText, node, startFrag, startOffset, _ref;
    startFrag = fragment.childNodes[0];
    lineEl = line.line$[0];
    if (lineEl.lastChild === null) {
      node = document.createElement('span');
      lineEl.insertBefore(node, lineEl.firstChild);
    }
    if (lineEl.lastChild.nodeName === 'BR') {
      lineEl.removeChild(lineEl.lastChild);
    }
    lastNode = lineEl.lastChild;
    if ((startFrag.tagName === (_ref = lastNode.tagName) && _ref === 'SPAN') && startFrag.className === lastNode.className) {
      startOffset = lastNode.textContent.length;
      newText = lastNode.textContent + startFrag.textContent;
      lastNode.firstChild.textContent = newText;
      fragment.removeChild(fragment.firstChild);
      return lineEl.appendChild(fragment);
    } else {
      lineEl.appendChild(fragment);
      return null;
    }
  };

  CNeditor.prototype._removeEndLine = function(startLine, endLine) {
    startLine.lineNext = endLine.lineNext;
    if (endLine.lineNext !== null) {
      endLine.lineNext.linePrev = startLine;
    }
    endLine.line$.remove();
    return delete this._lines[endLine.lineID];
  };

  CNeditor.prototype._adaptEndLineType = function(startLine, endLine, endLineDepth) {
    var endLineType, startLineType;
    endLineType = endLine.lineType;
    startLineType = startLine.lineType;
    if (endLineType[1] === 'h' && startLineType[1] !== 'h') {
      if (endLineType[0] === 'L') {
        endLine.setType('T' + endLineType[1]);
      }
      return this.markerList(endLine);
    }
  };

  CNeditor.prototype._setCaret = function(startContainer, startOffset) {
    var range;
    range = rangy.createRange();
    range.collapseToPoint(startContainer, startOffset);
    return this.currentSel.sel.setSingleRange(range);
  };

  /* ------------------------------------------------------------------------
  #  _insertLineAfter
  # 
  # Insert a line after a source line
  # The line will be inserted in the parent of the source line (which can be 
  # the editor or a fragment in the case of the paste for instance)
  # p = 
  #     sourceLine         : line after which the line will be added
  #     fragment           : [optionnal] - an html fragment that will be added
  #                          in the div of the line.
  #     innerHTML          : [optionnal] - if no fragment is given, an html
  #                          string that will be added to the new line.
  #     targetLineType     : type of the line to add
  #     targetLineDepthAbs : absolute depth of the line to add
  #     targetLineDepthRel : relative depth of the line to add
  */


  CNeditor.prototype._insertLineAfter = function(p) {
    var newLine;
    newLine = new Line(this, p.targetLineType, p.targetLineDepthAbs, p.targetLineDepthRel, p.sourceLine, null, p.fragment);
    return newLine;
  };

  /* ------------------------------------------------------------------------
  #  _insertLineBefore
  # 
  # Insert a line before a source line
  # p = 
  #     sourceLine         : Line before which a line will be added
  #     fragment           : [optionnal] - an html fragment that will be added
  #                          the fragment is not supposed to end with a <br>
  #     targetLineType     : type of the line to add
  #     targetLineDepthAbs : absolute depth of the line to add
  #     targetLineDepthRel : relative depth of the line to add
  */


  CNeditor.prototype._insertLineBefore = function(p) {
    var newLine;
    newLine = new Line(this, p.targetLineType, p.targetLineDepthAbs, p.targetLineDepthRel, null, p.sourceLine, p.fragment);
    return newLine;
  };

  /*  -----------------------------------------------------------------------
  #   _readHtml
  # 
  # Parse a raw html inserted in the iframe in order to update the controller
  */


  CNeditor.prototype._readHtml = function() {
    var deltaDepthAbs, htmlLine, htmlLine$, lineClass, lineDepthAbs, lineDepthAbs_old, lineDepthRel, lineDepthRel_old, lineID, lineID_st, lineNew, lineNext, linePrev, lineType, linesDiv$, _i, _len, _ref;
    linesDiv$ = $(this.linesDiv).children();
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
        deltaDepthAbs = lineDepthAbs - lineDepthAbs_old;
        lineDepthRel_old = lineDepthRel;
        if (lineType === "Th") {
          lineDepthRel = 0;
        } else {
          lineDepthRel = lineDepthRel_old + deltaDepthAbs;
        }
        lineID = parseInt(lineID, 10) + 1;
        lineID_st = "CNID_" + lineID;
        htmlLine$.prop("id", lineID_st);
        lineNew = new Line();
        lineNew.line$ = htmlLine$;
        lineNew.lineID = lineID_st;
        lineNew.lineType = lineType;
        lineNew.lineDepthAbs = lineDepthAbs;
        lineNew.lineDepthRel = lineDepthRel;
        lineNew.lineNext = null;
        lineNew.linePrev = linePrev;
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
  # BUG : when doubleclicking on an end of line then moving this line
  #       down, selection does not behave as expected :-)
  # TODO: correct behavior when moving the second line up
  # TODO: correct behavior when moving the first line down
  # TODO: improve re-insertion of the line swapped with the block
  */


  /* ------------------------------------------------------------------------
  # _moveLinesDown:
  #
  # -variables:
  #    linePrev                                       linePrev
  #    lineStart__________                            lineNext
  #    |.                 | The block                 lineStart_______
  #    |.                 | to move down      ==>     |.              |
  #    lineEnd____________|                           |.              |
  #    lineNext                                       lineEnd_________|
  #
  # -algorithm:
  #    1.delete lineNext with _deleteMultilinesSelections()
  #    2.insert lineNext between linePrev and lineStart
  #    3.if lineNext is more indented than linePrev, untab lineNext
  #      until it is ok
  #    4.else (lineNext less indented than linePrev), select the block
  #      (lineStart and some lines below) that is more indented than lineNext
  #      and untab it until it is ok
  */


  CNeditor.prototype._moveLinesDown = function() {
    var cloneLine, endDiv, endLineID, line, lineEnd, lineNext, linePrev, lineStart, myRange, numOfUntab, range, sel, startDiv, startLineID, _results, _results1;
    sel = this.getEditorSelection();
    range = sel.getRangeAt(0);
    startDiv = selection.getLineDiv(range.startContainer, range.startOffset);
    endDiv = selection.getLineDiv(range.endContainer, range.endOffset);
    startLineID = startDiv.id;
    endLineID = endDiv.id;
    lineStart = this._lines[startLineID];
    lineEnd = this._lines[endLineID];
    linePrev = lineStart.linePrev;
    lineNext = lineEnd.lineNext;
    if (lineNext !== null) {
      cloneLine = Line.clone(lineNext);
      this._deleteMultiLinesSelections(lineEnd, lineNext);
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
        myRange.setStart(lineStart.line$[0], 0);
        myRange.setEnd(line.line$[0], 0);
        numOfUntab = lineStart.lineDepthAbs - lineNext.lineDepthAbs;
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
        numOfUntab = lineNext.lineDepthAbs - linePrev.lineDepthAbs;
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
  #    linePrev                                   lineStart_________
  #    lineStart__________                        |.                |
  #    |.                 | The block             |.                |
  #    |.                 | to move up     ==>    lineEnd___________|
  #    lineEnd____________|                       linePrev
  #    lineNext                                   lineNext
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


  CNeditor.prototype._moveLinesUp = function() {
    var cloneLine, endDiv, endLineID, isSecondLine, line, lineEnd, lineNext, linePrev, lineStart, myRange, numOfUntab, range, sel, startDiv, startLineID, _results, _results1;
    sel = this.getEditorSelection();
    range = sel.getRangeAt(0);
    startDiv = selection.getLineDiv(range.startContainer, range.startOffset);
    endDiv = selection.getLineDiv(range.endContainer, range.endOffset);
    startLineID = startDiv.id;
    endLineID = endDiv.id;
    lineStart = this._lines[startLineID];
    lineEnd = this._lines[endLineID];
    linePrev = lineStart.linePrev;
    lineNext = lineEnd.lineNext;
    if (linePrev !== null) {
      isSecondLine = linePrev.linePrev === null;
      cloneLine = Line.clone(linePrev);
      this._deleteMultiLinesSelections(linePrev.linePrev, linePrev);
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
      if (linePrev.lineDepthAbs <= lineEnd.lineDepthAbs && lineNext !== null) {
        line = linePrev;
        while (line.lineNext !== null && line.lineNext.lineDepthAbs > linePrev.lineDepthAbs) {
          line = line.lineNext;
        }
        if (line.lineNext !== null) {
          line = line.lineNext;
        }
        myRange = rangy.createRange();
        myRange.setStart(lineNext.line$[0], 0);
        myRange.setEnd(line.line$[0], 0);
        numOfUntab = lineNext.lineDepthAbs - linePrev.lineDepthAbs;
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

  /*
      #  HISTORY MANAGEMENT:
      # 1. _addHistory (Save html code, selection markers, positions...)
      # 2. undoPossible (Return true only if unDo can be called)
      # 3. redoPossible (Return true only if reDo can be called)
      # 4. unDo (Undo the previous action)
      # 5. reDo ( Redo a undo-ed action)
      #
      # What is saved in the history:
      #  - current html content
      #  - current selection
      #  - current scrollbar position
      #  - the boolean newPosition
  */


  /*
      #  _addHistory
      # 
      # Add html code and selection markers and scrollbar positions to the history
  */


  CNeditor.prototype._addHistory = function() {
    var savedScroll, savedSel;
    savedSel = this.saveEditorSelection();
    this._history.historySelect.push(savedSel);
    savedScroll = {
      xcoord: this.editorBody$.scrollTop(),
      ycoord: this.editorBody$.scrollLeft()
    };
    this._history.historyScroll.push(savedScroll);
    this._history.historyPos.push(this.newPosition);
    this._history.history.push(this.linesDiv.innerHTML);
    return this._history.index = this._history.history.length - 1;
  };

  /* -------------------------------------------------------------------------
  #  undoPossible
  # Return true only if unDo can be called
  */


  CNeditor.prototype.undoPossible = function() {
    return this._history.index > 0;
  };

  /* -------------------------------------------------------------------------
  #  redoPossible
  # Return true only if reDo can be called
  */


  CNeditor.prototype.redoPossible = function() {
    return this._history.index < this._history.history.length - 2;
  };

  /* -------------------------------------------------------------------------
  #  unDo :
  # Undo the previous action
  */


  CNeditor.prototype.unDo = function() {
    var savedSel, xcoord, ycoord;
    if (this.undoPossible()) {
      if (this._history.index === this._history.history.length - 1) {
        this._addHistory();
        this._history.index -= 1;
      }
      this.newPosition = this._history.historyPos[this._history.index];
      this.linesDiv.innerHTML = this._history.history[this._history.index];
      savedSel = this._history.historySelect[this._history.index];
      rangy.deserializeSelection(savedSel, this.linesDiv);
      xcoord = this._history.historyScroll[this._history.index].xcoord;
      ycoord = this._history.historyScroll[this._history.index].ycoord;
      this.editorBody$.scrollTop(xcoord);
      this.editorBody$.scrollLeft(ycoord);
      this._readHtml();
      return this._history.index -= 1;
    }
  };

  /* -------------------------------------------------------------------------
  #  reDo :
  # Redo a undo-ed action
  */


  CNeditor.prototype.reDo = function() {
    var savedSel, xcoord, ycoord;
    if (this.redoPossible()) {
      this.newPosition = this._history.historyPos[this._history.index + 1];
      this._history.index += 1;
      this.linesDiv.innerHTML = this._history.history[this._history.index + 1];
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
  # EXTENSION  :  auto-summary management and upkeep
  # 
  # initialization
  # TODO: avoid updating the summary too often
  #       it would be best to make the update faster (rather than reading
  #       every line)
  */


  CNeditor.prototype._initSummary = function() {
    var summary;
    summary = this.editorBody$.children("#navi");
    if (summary.length === 0) {
      summary = $(document.createElement('div'));
      summary.attr('id', 'navi');
      summary.prependTo(this.editorBody$);
    }
    return summary;
  };

  CNeditor.prototype._buildSummary = function() {
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
  #  EXTENSION  :  DECORATION FUNCTIONS (bold/italic/underlined/quote)
  #  TODO
  */


  /* ------------------------------------------------------------------------
  #  PASTE MANAGEMENT
  # 0 - save selection
  # 1 - move the cursor into an invisible sandbox
  # 2 - redirect pasted content in this sandox
  # 3 - sanitize and adapt pasted content to the editor's format
  # 4 - restore selection
  # 5 - insert cleaned content is behind the cursor position
  */


  CNeditor.prototype.paste = function(event) {
    var mySandBox, range, sel;
    mySandBox = this.clipboard;
    this.updateCurrentSelIsStartIsEnd();
    range = rangy.createRange();
    range.selectNodeContents(mySandBox);
    sel = this.getEditorSelection();
    sel.setSingleRange(range);
    range.detach();
    if (event && event.clipboardData && event.clipboardData.getData) {
      if (event.clipboardData.types === "text/html") {
        mySandBox.innerHTML = event.clipboardData.getData('text/html');
      } else if (event.clipboardData.types === "text/plain") {
        mySandBox.innerHTML = event.clipboardData.getData('text/plain');
      } else {
        mySandBox.innerHTML = "";
      }
      this._waitForPasteData(mySandBox);
      if (event.preventDefault) {
        event.stopPropagation();
        event.preventDefault();
      }
      return false;
    } else {
      this._waitForPasteData(mySandBox);
      return true;
    }
  };

  /**
  # * init the div where the browser will actualy paste.
  # * this method is called after each refresh of the content of the editor (
  # * replaceContent, deleteContent, setEditorContent)
  # * TODO : should be called just once at editor init : for this the editable
  # * content shouldn't be directly in the body of the iframe but in a div.
  # * @return {obj} a ref to the clipboard div
  */


  CNeditor.prototype._initClipBoard = function() {
    var clipboardEl, getOffTheScreen;
    clipboardEl = document.createElement('div');
    clipboardEl.setAttribute('contenteditable', 'true');
    this.clipboard$ = $(clipboardEl);
    this.clipboard$.attr('id', 'editor-clipboard');
    getOffTheScreen = {
      left: -300
    };
    this.clipboard$.offset(getOffTheScreen);
    this.clipboard$.prependTo(this.editorBody$);
    this.clipboard = this.clipboard$[0];
    this.clipboard.style.setProperty('width', '280px');
    this.clipboard.style.setProperty('position', 'fixed');
    this.clipboard.style.setProperty('overflow', 'hidden');
    return this.clipboard;
  };

  /**
   * Function that will call itself until the browser has pasted data in the
   * clipboar div
   * @param  {element} sandbox      the div where the browser will paste data
   * @param  {function} processpaste the function to call back whan paste 
   * is ok
  */


  CNeditor.prototype._waitForPasteData = function() {
    if (this.clipboard.childNodes && this.clipboard.childNodes.length > 0) {
      return this._processPaste();
    } else {
      return setTimeout(this._waitForPasteData, 100);
    }
  };

  /*
       * Called when the browser has pasted data in the clipboard div. 
       * Its role is to insert the content of the clipboard into the editor.
       * @param  {element} sandbox
  */


  CNeditor.prototype._processPaste = function() {
    var absDepth, breakPoint, caretOffset, caretTextNodeTarget, currSel, currentLineFrag, domWalkContext, dummyLine, elToInsert, endLine, endOffset, endTargetLineFrag, firstAddedLine, frag, htmlStr, lineElements, lineNextStartLine, newText, parendDiv, parent, range, sandbox, secondAddedLine, startLine, startOffset, targetNode, targetText, _i, _len, _ref;
    sandbox = this.clipboard;
    currSel = this.currentSel;
    sandbox.innerHTML = sanitize(sandbox.innerHTML).xss();
    frag = document.createDocumentFragment();
    dummyLine = {
      lineNext: null,
      linePrev: null,
      line$: $("<div id='dummy' class='Tu-1'></div>")
    };
    frag.appendChild(dummyLine.line$[0]);
    currentLineFrag = document.createDocumentFragment();
    absDepth = currSel.startLine.lineDepthAbs;
    if (currSel.startLine.lineType === 'Th') {
      absDepth += 1;
    }
    domWalkContext = {
      frag: frag,
      lastAddedLine: dummyLine,
      currentLineFrag: currentLineFrag,
      currentLineEl: currentLineFrag,
      absDepth: absDepth,
      prevHxLevel: null,
      prevCNLineAbsDepth: null,
      isCurrentLineBeingPopulated: false
    };
    htmlStr = this._domWalk(sandbox, domWalkContext);
    sandbox.innerHTML = "";
    frag.removeChild(frag.firstChild);
    /*
            # TODO : the following steps removes all the styles of the lines in frag
            # Later this will be removed in order to take into account styles.
    */

    /*
            # END TODO
    */

    startLine = currSel.startLine;
    endLine = currSel.endLine;
    if (currSel.range.collapsed) {

    } else if (endLine === startLine) {
      currSel.range.deleteContents();
      selection.normalize(currSel.range);
    } else {
      this._deleteMultiLinesSelections();
      selection.normalize(currSel.range);
      this.newPosition = true;
      currSel = this.updateCurrentSelIsStartIsEnd();
      this.newPosition = false;
      startLine = currSel.startLine;
    }
    /* 5- Insert first line of the frag in the target line
    # We assume that the structure of lines in frag and in the editor are :
    #   <div><span>(TextNode)</span><br></div>
    # what will be incorrect when styles will be taken into account.
    #
    */

    targetNode = currSel.range.startContainer;
    startOffset = currSel.range.startOffset;
    if (this.isChromeOrSafari && targetNode.nodeName !== '#text') {
      breakPoint = selection.normalizeBP(targetNode, startOffset);
      targetNode = breakPoint.cont;
      startOffset = breakPoint.offset;
    }
    endOffset = targetNode.length - startOffset;
    if (frag.childNodes.length > 0) {
      lineElements = Array.prototype.slice.call(frag.firstChild.childNodes);
    } else {
      lineElements = [frag];
    }
    for (_i = 0, _len = lineElements.length; _i < _len; _i++) {
      elToInsert = lineElements[_i];
      this._insertElement;
      if (elToInsert.tagName === 'SPAN') {
        if (targetNode.tagName === 'SPAN' || targetNode.nodeType === Node.TEXT_NODE) {
          targetText = targetNode.textContent;
          newText = targetText.substr(0, startOffset);
          newText += elToInsert.textContent;
          newText += targetText.substr(startOffset);
          targetNode.textContent = newText;
          startOffset += elToInsert.textContent.length;
        } else if (targetNode.tagName === 'A') {
          targetNode.parentElement.insertBefore(elToInsert, targetNode.nextSibling);
          targetNode = targetNode.parentElement;
          startOffset = $(targetNode).children().index(elToInsert) + 1;
        } else if (targetNode.tagName === 'DIV') {
          targetNode.insertBefore(elToInsert, targetNode[startOffset]);
          startOffset += 1;
        }
      } else if (elToInsert.tagName === 'A') {
        if (targetNode.nodeName === '#text') {
          parent = targetNode.parentElement;
          parent.parentElement.insertBefore(elToInsert, parent.nextSibling);
          targetNode = parent.parentElement;
          startOffset = $(targetNode).children().index(elToInsert) + 1;
        } else if ((_ref = targetNode.tagName) === 'SPAN' || _ref === 'A') {
          targetNode.parentElement.insertBefore(elToInsert, targetNode.nextSibling);
          targetNode = targetNode.parentElement;
          startOffset = $(targetNode).children().index(elToInsert) + 1;
        } else if (targetNode.tagName === 'DIV') {
          targetNode.insertBefore(elToInsert, targetNode[startOffset]);
          startOffset += 1;
        }
      }
    }
    /*
            # 6- If the clipboard has more than one line, insert the end of target
            #    line in the last line of frag and delete it
    */

    if (frag.childNodes.length > 1) {
      range = document.createRange();
      range.setStart(targetNode, startOffset);
      parendDiv = targetNode;
      while (parendDiv.tagName !== 'DIV') {
        parendDiv = parendDiv.parentElement;
      }
      range.setEnd(parendDiv, parendDiv.children.length - 1);
      endTargetLineFrag = range.extractContents();
      range.detach();
      this._insertFrag(frag.lastChild, frag.lastChild.children.length - 1, endTargetLineFrag);
      parendDiv = targetNode;
      while (parendDiv.tagName !== 'DIV') {
        parendDiv = parendDiv.parentElement;
      }
    }
    /**
     * remove the firstAddedLine from the fragment
    */

    firstAddedLine = dummyLine.lineNext;
    secondAddedLine = firstAddedLine != null ? firstAddedLine.lineNext : void 0;
    if (frag.firstChild != null) {
      frag.removeChild(frag.firstChild);
    }
    if (firstAddedLine != null) {
      delete this._lines[firstAddedLine.lineID];
    }
    /**
     * 7- updates nextLine and prevLines, insert frag in the editor
    */

    if (secondAddedLine != null) {
      lineNextStartLine = currSel.startLine.lineNext;
      currSel.startLine.lineNext = secondAddedLine;
      secondAddedLine.linePrev = currSel.startLine;
      if (lineNextStartLine === null) {
        this.linesDiv.appendChild(frag);
      } else {
        domWalkContext.lastAddedLine.lineNext = lineNextStartLine;
        lineNextStartLine.linePrev = domWalkContext.lastAddedLine;
        this.linesDiv.insertBefore(frag, lineNextStartLine.line$[0]);
      }
    }
    /**
     * 8- position caret
    */

    if (secondAddedLine != null) {
      caretTextNodeTarget = lineNextStartLine.linePrev.line$[0].childNodes[0].firstChild;
      caretOffset = caretTextNodeTarget.length - endOffset;
      return currSel.sel.collapse(caretTextNodeTarget, caretOffset);
    } else {
      return currSel.sel.collapse(targetNode, startOffset);
    }
  };

  /**
   * Insert a frag in a node container at startOffset
   * ASSERTION : 
   * TODO : this method could be also used in _deleteMultiLinesSelections 
   * especialy if _insertFrag optimizes the insertion by fusionning cleverly
   * the elements
   * @param  {Node} targetContainer the node where to make the insert
   * @param  {Integer} targetOffset    the offset of insertion in targetContainer
   * @param  {fragment} frag           the fragment to insert
   * @return {nothing}                nothing
  */


  CNeditor.prototype._insertFrag = function(targetContainer, targetOffset, frag) {
    var range, targetNode;
    if (targetOffset === 0) {
      range = document.createRange();
      range.setStart(startContainer, startOffset);
      range.setEnd(startContainer, startOffset);
      range.insertNode(frag);
      return range.detach();
    } else {
      if (frag.childNodes.length > 0) {
        targetNode = targetContainer.childNodes[targetOffset - 1];
        return targetNode.textContent += frag.firstChild.textContent;
      }
    }
  };

  /**
   * Walks thoug an html tree in order to convert it in a strutured content
   * that fit to a note structure.
   * @param  {html element} elemt   Reference to an html element to be parsed
   * @param  {object} context _domWalk is recursive and its context of execution
   *                  is kept in this param instead of using the editor context
   *                  (quicker and better) isolation
  */


  CNeditor.prototype._domWalk = function(elemt, context) {
    var p;
    this.__domWalk(elemt, context);
    if (context.currentLineFrag.childNodes.length > 0) {
      p = {
        sourceLine: context.lastAddedLine,
        fragment: context.currentLineFrag,
        targetLineType: "Tu",
        targetLineDepthAbs: context.absDepth,
        targetLineDepthRel: context.absDepth
      };
      return context.lastAddedLine = this._insertLineAfter(p);
    }
  };

  /**
   * Walks thoug an html tree in order to convert it in a strutured content
   * that fit to a note structure.
   * @param  {html element} nodeToParse   Reference to an html element to 
   *                        be parsed
   * @param  {object} context __domWalk is recursive and its context of 
   *                          execution is kept in this param instead of 
   *                          using the editor context (quicker and better) 
   *                          isolation
  */


  CNeditor.prototype.__domWalk = function(nodeToParse, context) {
    var aNode, absDepth, child, deltaHxLevel, lastInsertedEl, prevHxLevel, spanEl, spanNode, txtNode, _i, _len, _ref, _ref1;
    absDepth = context.absDepth;
    prevHxLevel = context.prevHxLevel;
    _ref = nodeToParse.childNodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      switch (child.nodeName) {
        case '#text':
          if ((_ref1 = context.currentLineEl.nodeName) === 'SPAN' || _ref1 === 'A') {
            context.currentLineEl.textContent += child.textContent;
          } else {
            txtNode = document.createTextNode(child.textContent);
            spanEl = document.createElement('span');
            spanEl.appendChild(txtNode);
            context.currentLineEl.appendChild(spanEl);
          }
          context.isCurrentLineBeingPopulated = true;
          break;
        case 'P':
        case 'UL':
        case 'OL':
          context.absDepth = absDepth;
          this.__domWalk(child, context);
          if (context.isCurrentLineBeingPopulated) {
            this._appendCurrentLineFrag(context, absDepth, absDepth);
          }
          break;
        case 'H1':
        case 'H2':
        case 'H3':
        case 'H4':
        case 'H5':
        case 'H6':
          deltaHxLevel = 0;
          this.__domWalk(child, context);
          if (context.isCurrentLineBeingPopulated) {
            this._appendCurrentLineFrag(context, Math.min(0, deltaHxLevel) + absDepth, Math.min(0, deltaHxLevel) + absDepth);
          }
          break;
        case 'LI':
          if (context.isCurrentLineBeingPopulated) {
            this._appendCurrentLineFrag(context, absDepth, absDepth);
          }
          this.__domWalk(child, context);
          if (context.isCurrentLineBeingPopulated) {
            this._appendCurrentLineFrag(context, absDepth, absDepth);
          }
          break;
        case 'TR':
          if (context.isCurrentLineBeingPopulated) {
            this._appendCurrentLineFrag(context, absDepth, absDepth);
          }
          this.__domWalk(child, context);
          if (context.isCurrentLineBeingPopulated) {
            this._appendCurrentLineFrag(context, absDepth, absDepth);
          }
          break;
        case 'BR':
          this._appendCurrentLineFrag(context, absDepth, absDepth);
          break;
        case 'A':
          aNode = document.createElement('a');
          aNode.textContent = child.textContent;
          aNode.href = child.href;
          context.currentLineEl.appendChild(aNode);
          break;
        case 'DIV':
        case 'TABLE':
        case 'TBODY':
          if (child.id.substr(0, 5) === 'CNID_') {
            this._clipBoard_Insert_InternalLine(child, context);
          } else {
            this.__domWalk(child, context);
          }
          break;
        default:
          lastInsertedEl = context.currentLineEl.lastChild;
          if (lastInsertedEl !== null && lastInsertedEl.nodeName === 'SPAN') {
            lastInsertedEl.textContent += child.textContent;
          } else {
            spanNode = document.createElement('span');
            spanNode.textContent = child.textContent;
            context.currentLineEl.appendChild(spanNode);
          }
          context.isCurrentLineBeingPopulated = true;
      }
    }
    return true;
  };

  /**
   * Append to frag the currentLineFrag and prepare a new empty one.
   * @param  {Object} context  [description]
   * @param  {Number} absDepth absolute depth of the line to insert
   * @param  {Number} relDepth relative depth of the line to insert
  */


  CNeditor.prototype._appendCurrentLineFrag = function(context, absDepth, relDepth) {
    var p, spanNode;
    if (context.currentLineFrag.childNodes.length === 0) {
      spanNode = document.createElement('span');
      spanNode.appendChild(document.createTextNode(''));
      context.currentLineFrag.appendChild(spanNode);
    }
    p = {
      sourceLine: context.lastAddedLine,
      fragment: context.currentLineFrag,
      targetLineType: "Tu",
      targetLineDepthAbs: absDepth,
      targetLineDepthRel: relDepth
    };
    context.lastAddedLine = this._insertLineAfter(p);
    context.currentLineFrag = document.createDocumentFragment();
    context.currentLineEl = context.currentLineFrag;
    return context.isCurrentLineBeingPopulated = false;
  };

  /**
   * Insert in the editor a line that was copied in a cozy note editor
   * @param  {html element} elemt a div ex : <div id="CNID_7" class="Lu-3"> ... </div>
   * @return {line}        a ref to the line object
  */


  CNeditor.prototype._clipBoard_Insert_InternalLine = function(elemt, context) {
    var deltaDepth, elemtFrag, i, lineClass, lineDepthAbs, n, p;
    lineClass = elemt.className.split('-');
    lineDepthAbs = +lineClass[1];
    lineClass = lineClass[0];
    if (!context.prevCNLineAbsDepth) {
      context.prevCNLineAbsDepth = lineDepthAbs;
    }
    deltaDepth = lineDepthAbs - context.prevCNLineAbsDepth;
    if (deltaDepth > 0) {

    } else {

    }
    elemtFrag = document.createDocumentFragment();
    n = elemt.childNodes.length;
    i = 0;
    while (i < n) {
      elemtFrag.appendChild(elemt.childNodes[0]);
      i++;
    }
    p = {
      sourceLine: context.lastAddedLine,
      fragment: elemtFrag,
      targetLineType: "Tu",
      targetLineDepthAbs: context.absDepth,
      targetLineDepthRel: context.absDepth
    };
    return context.lastAddedLine = this._insertLineAfter(p);
  };

  /* ------------------------------------------------------------------------
  # EXTENSION  :  cleaned up HTML parsing
  #
  #  (TODO)
  # 
  # We suppose the html treated here has already been sanitized so the DOM
  #  structure is coherent and not twisted
  # 
  # _parseHtml:
  #  Parse an html string and return the matching html in the editor's format
  # We try to restitute the very structure the initial fragment :
  #   > indentation
  #   > lists
  #   > images, links, tables... and their specific attributes
  #   > text
  #   > textuals enhancements (bold, underlined, italic)
  #   > titles
  #   > line return
  # 
  # Ideas to do that :
  #  0- textContent is always kept
  #  1- A, IMG keep their specific attributes
  #  2- UL, OL become divs whose class is Tu/To. LI become Lu/Lo
  #  3- H[1-6] become divs whose class is Th. Depth is determined depending on
  #     where the element was pasted.
  #  4- U, B have the effect of adding to each elt they contain a class (bold
  #     and underlined class)
  #  5- BR delimit the different DIV that will be added
  #  6- relative indentation preserved with imbrication of paragraphs P
  #  7- any other elt is turned into a simple SPAN with a textContent
  #  8- IFRAME, FRAME, SCRIPT are ignored
  */


  CNeditor.prototype.logKeyPress = function(e) {};

  return CNeditor;

})();

CNeditor = exports.CNeditor;
