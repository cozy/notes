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
  var line, lineMetaData, lines, markCode, prevLineMetaData, segment, _i, _j, _len, _len1, _ref, _ref1;
  md2cozy.currentDepth = 0;
  lines = [];
  prevLineMetaData = null;
  _ref = linesDiv.children();
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    line = _ref[_i];
    if (line.id === 'CNE_urlPopover') {
      continue;
    }
    line = $(line);
    lineMetaData = md2cozy.getLineMetadata(line.attr('class'));
    markCode = md2cozy.buildMarkdownPrefix(lineMetaData, prevLineMetaData);
    prevLineMetaData = lineMetaData;
    _ref1 = line.children();
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      segment = _ref1[_j];
      if (segment.nodeType === 1) {
        markCode += md2cozy.convertInlineEltToMarkdown($(segment));
      } else {
        markCode += $(segment).text();
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
  var alt, classList, href, src, title;
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
      classList = obj[0].classList;
      if (classList.contains('CNE_strong')) {
        return '**' + obj.text() + '**';
      } else if (classList.contains('CNE_underline')) {
        return obj.text();
      } else {
        return obj.text();
      }
      break;
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
 * Returns a break point in the most pertinent text node given a random bp.
 * @param  {element} cont   the container of the break point
 * @param  {number} offset offset of the break point
 * @param  {boolean} preferNext [optional] if true, in case BP8, we will choose
 *                              to go in next sibling - if it exists - rather 
 *                              than in the previous one.
 * @return {object} the suggested break point : {cont:newCont,offset:newOffset}
*/


selection.normalizeBP = function(cont, offset, preferNext) {
  var newCont, newOffset, res, _ref;
  if (cont.nodeName === '#text') {
    res = {
      cont: cont,
      offset: offset
    };
  } else if ((_ref = cont.nodeName) === 'SPAN' || _ref === 'A') {
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
      if (preferNext) {
        newCont = cont.children[offset];
        if (newCont.nodeName === 'BR') {
          newCont = cont.children[offset - 1];
        }
        newOffset = 0;
        res = selection.normalizeBP(newCont, newOffset);
      } else {
        newCont = cont.children[offset - 1];
        newOffset = newCont.childNodes.length;
        res = selection.normalizeBP(newCont, newOffset);
      }
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

/**
 * Normalize an array of breakpoints.
 * @param  {Array} bps   An array of break points to normalize
 * @param  {boolean} preferNext [optional] if true, in case BP8, we will choose
 *                              to go in next sibling - if it exists - rather 
 *                              than in the previous one.
 * @return {Array} A ref to the array of normalized bp.
*/


selection.normalizeBPs = function(bps, preferNext) {
  var bp, newBp, _i, _len;
  for (_i = 0, _len = bps.length; _i < _len; _i++) {
    bp = bps[_i];
    newBp = selection.normalizeBP(bp.cont, bp.offset, preferNext);
    bp.cont = newBp.cont;
    bp.offset = newBp.offset;
  }
  return bps;
};

/**
 * return the div corresponding to an element inside a line and tells wheter
 * the breabk point is at the end or at the beginning of the line
 * @param  {element} cont   the container of the break point
 * @param  {number} offset offset of the break point
 * @return {object}        {div[element], isStart[bool], isEnd[bool]}
*/


selection.getLineDivIsStartIsEnd = function(cont, offset) {
  var index, isEnd, isStart, n, parent;
  if (cont.nodeName === 'DIV' && (cont.id != null) && cont.id.substr(0, 5) === 'CNID_') {
    if (cont.textContent === '') {
      return {
        div: cont,
        isStart: true,
        isEnd: true
      };
    }
    isStart = offset === 0;
    n = cont.childNodes.length;
    isEnd = (offset === n) || (offset === n - 1);
    return {
      div: cont,
      isStart: isStart,
      isEnd: isEnd
    };
  } else {
    if (cont.length != null) {
      isStart = offset === 0;
      isEnd = offset === cont.length;
    } else {
      isStart = offset === 0;
      isEnd = offset === cont.childNodes.length;
    }
  }
  parent = cont.parentNode;
  while (!(parent.nodeName === 'DIV' && (parent.id != null) && parent.id.substr(0, 5) === 'CNID_') && parent.parentNode !== null) {
    index = selection.getNodeIndex(cont);
    isStart = isStart && (index === 0);
    isEnd = isEnd && (index === parent.childNodes.length - 1);
    cont = parent;
    parent = parent.parentNode;
  }
  if (parent.textContent === '') {
    return {
      div: parent,
      isStart: true,
      isEnd: true
    };
  }
  index = selection.getNodeIndex(cont);
  n = parent.childNodes.length;
  isStart = isStart && (index === 0);
  isEnd = isEnd && ((index === n - 1) || (index === n - 2));
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

selection._getLineDiv = function(elt) {
  var parent;
  parent = elt;
  while (!((parent.nodeName === 'DIV' && (parent.id != null) && (parent.id.substr(0, 5) === 'CNID_' || parent.id === 'editor-lines')) && parent.parentNode !== null)) {
    parent = parent.parentNode;
  }
  return parent;
};

/**
 * Returns the segment (span or a or lineDiv) of the line where the break 
 * point is. If the break point is not in a segment, ie in the line div or even
 * in editor-lines, then it is the line div that will be returned.
 * @param  {element} cont   The contener of the break point
 * @param  {number} offset Offset of the break point.
 * @return {element}        The DIV of the line where the break point is.
*/


selection.getSegment = function(cont, offset) {
  var startDiv;
  if (cont.nodeName === 'DIV') {
    if (cont.id === 'editor-lines') {
      startDiv = cont.children[Math.min(offset, cont.children.length - 1)];
    } else if ((cont.id != null) && cont.id.substr(0, 5) === 'CNID_') {
      startDiv = cont;
    } else {
      startDiv = selection.getNestedSegment(cont);
    }
  } else {
    startDiv = selection.getNestedSegment(cont);
  }
  return startDiv;
};

selection.getNestedSegment = function(elt) {
  var parent;
  parent = elt.parentNode;
  while (!((parent.nodeName === 'DIV' && (parent.id != null) && (parent.id.substr(0, 5) === 'CNID_' || parent.id === 'editor-lines')) && parent.parentNode !== null)) {
    elt = parent;
    parent = elt.parentNode;
  }
  return elt;
};

/**
 * Returns the normalized break point at the end of the previous segment of the
 * segment of an element.
 * @param {[type]} elmt [description]
*/


selection.setBpPreviousSegEnd = function(elmt) {
  var bp, index, seg;
  seg = selection.getNestedSegment(elmt);
  index = selection.getNodeIndex(seg);
  return bp = selection.normalizeBP(seg.parentNode, index);
};

/**
 * Returns the normalized break point at the start of the next segment of the
 * segment of an element.
 * @param {[type]} elmt [description]
*/


selection.setBpNextSegEnd = function(elmt) {
  var bp, index, seg;
  seg = selection.getNestedSegment(elmt);
  index = selection.getNodeIndex(seg) + 1;
  return bp = selection.normalizeBP(seg.parentNode, index, true);
};

selection.getNodeIndex = function(node) {
  var i, index, sibling, _i, _len, _ref;
  _ref = node.parentNode.childNodes;
  for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
    sibling = _ref[i];
    if (sibling === node) {
      index = i;
      break;
    }
  }
  return index;
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
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __slice = [].slice;

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
          fragment        # [optional] a fragment to insert in the line, will
                            add a br at the end if none in the fragment.
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
    newLineEl.setAttribute('class', type + '-' + depthAbs);
    if (fragment != null) {
      newLineEl.appendChild(fragment);
      if (newLineEl.lastChild.nodeName !== 'BR') {
        newLineEl.appendChild(document.createElement('br'));
      }
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
    newLineEl.id = lineID;
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
    this.editorTarget = editorTarget;
    this._processPaste = __bind(this._processPaste, this);

    this._waitForPasteData = __bind(this._waitForPasteData, this);

    this._validateUrlPopover = __bind(this._validateUrlPopover, this);

    this._cancelUrlPopoverCB = __bind(this._cancelUrlPopoverCB, this);

    this._cancelUrlPopover = __bind(this._cancelUrlPopover, this);

    this._detectClickOutUrlPopover = __bind(this._detectClickOutUrlPopover, this);

    this._keyUpCorrection = __bind(this._keyUpCorrection, this);

    this._keyDownCallBack = __bind(this._keyDownCallBack, this);

    this.registerKeyDownCbForTest = __bind(this.registerKeyDownCbForTest, this);

    this._keyDownCallBackTry = __bind(this._keyDownCallBackTry, this);

    this._pasteCB = __bind(this._pasteCB, this);

    this._clickCB = __bind(this._clickCB, this);

    this._keyupCast = __bind(this._keyupCast, this);

    this._mouseupCB = __bind(this._mouseupCB, this);

    this.loadEditor = __bind(this.loadEditor, this);

    this.editorTarget$ = $(this.editorTarget);
    this.callBack = callBack;
    if (this.editorTarget.nodeName === "IFRAME") {
      this.isInIframe = true;
      this.editorTarget$.on('load', this.loadEditor);
      this.editorTarget.src = '';
    } else if (this.editorTarget.nodeName === "DIV") {
      this.isInIframe = false;
      this.loadEditor();
    }
    return this;
  }

  CNeditor.prototype.loadEditor = function() {
    var HISTORY_SIZE, cssLink, editor_head$, editor_html$;
    if (this.isInIframe) {
      editor_html$ = this.editorTarget$.contents().find("html");
      this.editorBody$ = editor_html$.find("body");
      editor_head$ = editor_html$.find("head");
      cssLink = '<link id="editorCSS" ';
      cssLink += 'href="stylesheets/CNeditor.css" rel="stylesheet">';
      editor_head$.html(cssLink);
    } else {
      this.editorBody$ = this.editorTarget$;
    }
    this.document = this.editorBody$[0].ownerDocument;
    this.linesDiv = document.createElement('div');
    this.linesDiv.setAttribute('id', 'editor-lines');
    this.linesDiv.setAttribute('class', 'editor-frame');
    this.linesDiv.setAttribute('contenteditable', 'true');
    this.editorBody$.append(this.linesDiv);
    this._initClipBoard();
    this._initUrlPopover();
    this._lines = {};
    this.newPosition = true;
    this._highestId = 0;
    this._deepest = 1;
    this._firstLine = null;
    HISTORY_SIZE = 100;
    this.HISTORY_SIZE = HISTORY_SIZE;
    this._history = {
      index: HISTORY_SIZE - 1,
      history: new Array(HISTORY_SIZE),
      historySelect: new Array(HISTORY_SIZE),
      historyScroll: new Array(HISTORY_SIZE),
      historyPos: new Array(HISTORY_SIZE)
    };
    this._lastKey = null;
    this.currentSel = {
      sel: this.getEditorSelection()
    };
    this.isFirefox = 'MozBoxSizing' in document.documentElement.style;
    this.isSafari = Object.prototype.toString.call(window.HTMLElement);
    this.isSafari = this.isSafari.indexOf('Constructor') > 0;
    this.isChrome = !this.isSafari && 'WebkitTransform' in document.documentElement.style;
    this.isChromeOrSafari = this.isChrome || this.isSafari;
    this.enable();
    return this.callBack.call(this);
  };

  CNeditor.prototype._mouseupCB = function() {
    return this.newPosition = true;
  };

  CNeditor.prototype._keyupCast = function(e) {
    var keyCode, metaKeyCode, shortcut, _ref;
    _ref = this.getShortCut(e), metaKeyCode = _ref[0], keyCode = _ref[1];
    shortcut = metaKeyCode + '-' + keyCode;
    switch (shortcut) {
      case 'Ctrl-S':
      case 'Ctrl-other':
        return;
    }
    return this.editorTarget$.trigger(jQuery.Event("onKeyUp"));
  };

  CNeditor.prototype._clickCB = function(e) {
    var segments, url;
    this._lastKey = null;
    this.updateCurrentSel();
    segments = this._getLinkSegments();
    if (segments) {
      if (e.ctrlKey) {
        url = segments[0].href;
        window.open(url, '_blank');
        return e.preventDefault();
      } else {
        this._showUrlPopover(segments, false);
        e.stopPropagation();
        return e.preventDefault();
      }
    }
  };

  CNeditor.prototype._pasteCB = function(event) {
    return this.paste(event);
  };

  CNeditor.prototype._registerEventListeners = function() {
    this.linesDiv.addEventListener('keydown', this._keyDownCallBackTry, true);
    if (this.isChromeOrSafari) {
      this.linesDiv.addEventListener('keyup', this._keyUpCorrection, false);
    }
    this.linesDiv.addEventListener('mouseup', this._mouseupCB, true);
    this.editorBody$.on('keyup', this._keyupCast);
    this.editorBody$.on('click', this._clickCB);
    return this.editorBody$.on('paste', this._pasteCB);
  };

  CNeditor.prototype._unRegisterEventListeners = function() {
    this.linesDiv.removeEventListener('keydown', this._keyDownCallBackTry, true);
    if (this.isChromeOrSafari) {
      this.linesDiv.removeEventListener('keyup', this._keyUpCorrection, false);
    }
    this.linesDiv.removeEventListener('mouseup', this._mouseupCB, true);
    this.editorBody$.off('keyup', this._keyupCast);
    this.editorBody$.off('click', this._clickCB);
    return this.editorBody$.off('paste', this._pasteCB);
  };

  CNeditor.prototype.disable = function() {
    this.isEnabled = false;
    return this._unRegisterEventListeners();
  };

  CNeditor.prototype.enable = function() {
    this.isEnabled = true;
    return this._registerEventListeners();
  };

  /**
   * Set focus on the editor
  */


  CNeditor.prototype.setFocus = function() {
    return this.linesDiv.focus();
  };

  /**
   * Methods to deal selection on an iframe
   * This method is modified during construction if the editor target is not
   * an iframe
   * @return {selection} The selection on the editor.
  */


  CNeditor.prototype.getEditorSelection = function() {
    return this.document.getSelection();
  };

  /**
   * this method is modified during construction if the editor target is not
   * an iframe
   * @return {String} Returns the serialized current selection within the 
   *                  editor. In case serialisation is impossible (for 
   *                  instance if there is no selectio within editor), then
   *                  false is returned.
  */


  CNeditor.prototype.saveEditorSelection = function() {
    var sel;
    sel = this.document.getSelection();
    if (sel.rangeCount === 0) {
      return false;
    }
    return this.serializeRange(sel.getRangeAt(0));
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

  /** -----------------------------------------------------------------------
   * Initialize the editor content from a html string
   * The html string should not been pretified because of the spaces and
   * charriage return. 
   * If unPretify = true then a regex tries to set up things
  */


  CNeditor.prototype.replaceContent = function(htmlString, unPretify) {
    if (unPretify) {
      htmlString = htmlString.replace(/>[\n ]*</g, "><");
    }
    if (this.isUrlPopoverOn) {
      this._cancelUrlPopover(false);
    }
    this.linesDiv.innerHTML = htmlString;
    this._readHtml();
    this._setCaret(this.linesDiv.firstChild.firstChild, 0, true);
    return this.newPosition = true;
  };

  /* ------------------------------------------------------------------------
  # Clear editor content
  */


  CNeditor.prototype.deleteContent = function() {
    var emptyLine;
    emptyLine = '<div id="CNID_1" class="Tu-1"><span></span><br></div>';
    return this.replaceContent(emptyLine);
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
    return this.replaceContent(cozyContent);
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
          case 66:
            keyCode = 'B';
            break;
          case 85:
            keyCode = 'U';
            break;
          case 75:
            keyCode = 'K';
            break;
          case 76:
            keyCode = 'L';
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
    if (metaKeyCode === '' && (keyCode === 'A' || keyCode === 'B' || keyCode === 'U' || keyCode === 'K' || keyCode === 'L' || keyCode === 'S' || keyCode === 'V' || keyCode === 'Y' || keyCode === 'Z')) {
      keyCode = 'other';
    }
    return [metaKeyCode, keyCode];
  };

  /**
   * Callback to be used in production.
   * In case of error thrown by the editor, we catch it and undo the content
   * to avoid to loose data.
   * @param  {event} e  The key event
  */


  CNeditor.prototype._keyDownCallBackTry = function(e) {
    try {
      return this._keyDownCallBack(e);
    } catch (error) {
      alert('A bug occured, we prefer to undo your last action not to take any risk.\n\nMessage :\n' + error);
      e.preventDefault();
      return this.unDo();
    }
  };

  /**
   * Change the callback called by keydown event for the "test" callback.
   * The aim is that during test we don't want to intercept errors so that 
   * the test can detect the error.
  */


  CNeditor.prototype.registerKeyDownCbForTest = function() {
    this.linesDiv.removeEventListener('keydown', this._keyDownCallBackTry, true);
    this._keyDownCallBackTry = this._keyDownCallBack;
    return this.linesDiv.addEventListener('keydown', this._keyDownCallBackTry, true);
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
    var keyCode, metaKeyCode, sel, shortcut, _ref;
    if (!this.isEnabled) {
      return true;
    }
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
    if (this._lastKey !== shortcut && (shortcut === '-return' || shortcut === '-backspace' || shortcut === '-suppr' || shortcut === 'CtrlShift-down' || shortcut === 'CtrlShift-up' || shortcut === 'CtrlShift-left' || shortcut === 'CtrlShift-right' || shortcut === 'Ctrl-V' || shortcut === '-space' || shortcut === '-other')) {
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
        e.preventDefault();
        return this.editorTarget$.trigger(jQuery.Event('onChange'));
      case '-backspace':
        this.updateCurrentSelIsStartIsEnd();
        this._backspace();
        this.newPosition = true;
        e.preventDefault();
        return this.editorTarget$.trigger(jQuery.Event('onChange'));
      case '-tab':
        this.tab();
        e.preventDefault();
        return this.editorTarget$.trigger(jQuery.Event('onChange'));
      case 'Shift-tab':
        this.shiftTab();
        e.preventDefault();
        return this.editorTarget$.trigger(jQuery.Event('onChange'));
      case '-suppr':
        this.updateCurrentSelIsStartIsEnd();
        this._suppr(e);
        this.newPosition = true;
        return this.editorTarget$.trigger(jQuery.Event('onChange'));
      case 'Ctrl-A':
        selection.selectAll(this);
        return e.preventDefault();
      case 'Alt-L':
        this.markerList();
        e.preventDefault();
        return this.editorTarget$.trigger(jQuery.Event('onChange'));
      case 'Alt-A':
        this.toggleType();
        e.preventDefault();
        return this.editorTarget$.trigger(jQuery.Event('onChange'));
      case '-other':
      case '-space':
        if (this.newPosition) {
          sel = this.updateCurrentSel();
          if (!sel.theoricalRange.collapsed) {
            this._backspace();
          }
          this.newPosition = false;
        }
        return this.editorTarget$.trigger(jQuery.Event('onChange'));
      case 'Ctrl-V':
        this.editorTarget$.trigger(jQuery.Event('onChange'));
        return true;
      case 'Ctrl-B':
        e.preventDefault();
        return this.editorTarget$.trigger(jQuery.Event('onChange'));
      case 'Ctrl-K':
        this.linkifySelection();
        return e.preventDefault();
      case 'Ctrl-S':
        this.editorTarget$.trigger(jQuery.Event('saveRequest'));
        e.preventDefault();
        return e.stopPropagation();
      case 'Ctrl-Z':
        this.unDo();
        e.preventDefault();
        return this.editorTarget$.trigger(jQuery.Event('onChange'));
      case 'Ctrl-Y':
        this.reDo();
        e.preventDefault();
        return this.editorTarget$.trigger(jQuery.Event('onChange'));
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
    var div, endContainer, endLine, firstLineIsEnd, initialEndOffset, initialStartOffset, isEnd, isStart, lastLineIsStart, newEndBP, newStartBP, range, rangeIsEndLine, rangeIsStartLine, sel, startContainer, startLine, theoricalRange, _ref, _ref1, _ref2;
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
    _ref1 = selection.getLineDivIsStartIsEnd(startContainer, initialStartOffset), div = _ref1.div, isStart = _ref1.isStart, isEnd = _ref1.isEnd;
    startLine = this._lines[div.id];
    rangeIsStartLine = isStart;
    firstLineIsEnd = isEnd;
    _ref2 = selection.getLineDivIsStartIsEnd(endContainer, initialEndOffset), div = _ref2.div, isStart = _ref2.isStart, isEnd = _ref2.isEnd;
    endLine = this._lines[div.id];
    rangeIsEndLine = isEnd;
    lastLineIsStart = isStart;
    this.currentSel = {
      sel: sel,
      range: range,
      startLine: startLine,
      endLine: endLine,
      rangeIsStartLine: rangeIsStartLine,
      rangeIsEndLine: rangeIsEndLine,
      firstLineIsEnd: firstLineIsEnd,
      lastLineIsStart: lastLineIsStart,
      theoricalRange: theoricalRange
    };
    return this.currentSel;
  };

  /**
   * This function is called only if in Chrome, because the insertion of a 
   * caracter by the browser may be out of a span. 
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

  /**
   * Check if the first range of the selection is NOT in the editor
   * @param  {Boolean}  expectWide [optional] If true, tests if the first
   *                               range of the selection is collapsed. If it
   *                               is the case, then return false
   * @return {Boolean} True if there is a selection, false otherwise.
  */


  CNeditor.prototype.hasNoSelection = function(expectWide) {
    var cont, rg, sel;
    sel = this.document.getSelection();
    if (sel.rangeCount > 0) {
      rg = sel.getRangeAt(0);
      if (expectWide && rg.collapsed) {
        return true;
      }
      cont = rg.startContainer;
      while (cont !== null) {
        if (cont === this.linesDiv) {
          break;
        }
        cont = cont.parentNode;
      }
      if (cont === null) {
        return true;
      }
      cont = rg.endContainer;
      while (cont === null) {
        if (cont === this.linesDiv) {
          return false;
        }
        cont = cont.parentNode;
      }
      if (cont === null) {
        return true;
      }
    } else {
      return true;
    }
  };

  /**
   * Put a strong (bold) css class on the selection of the editor.
   * History is incremented before action and focus is set on the editor.
   * @return {[type]} [description]
  */


  CNeditor.prototype.strong = function() {
    var rg;
    if (!this.isEnabled || this.hasNoSelection(true)) {
      return true;
    }
    this._addHistory();
    rg = this._applyMetaDataOnSelection('CNE_strong');
    if (!rg) {
      return this._removeLastHistoryStep();
    }
  };

  CNeditor.prototype.underline = function() {
    if (!this.isEnabled || this.hasNoSelection(true)) {
      return true;
    }
    this._addHistory();
    return this._applyMetaDataOnSelection('CNE_underline');
  };

  CNeditor.prototype.linkifySelection = function() {
    var currentSel, range, rg, segments;
    if (!this.isEnabled || this.hasNoSelection()) {
      return true;
    }
    currentSel = this.updateCurrentSelIsStartIsEnd();
    range = currentSel.theoricalRange;
    if (range.collapsed) {
      segments = this._getLinkSegments();
      if (segments) {
        this._showUrlPopover(segments, false);
      }
    } else {
      segments = this._getLinkSegments();
      if (segments) {
        this._showUrlPopover(segments, false);
      } else {
        this._addHistory();
        rg = this._applyMetaDataOnSelection('A', 'http://');
        if (rg) {
          segments = this._getLinkSegments(rg);
          this._showUrlPopover(segments, true);
        }
      }
    }
    return true;
  };

  /**
   * Show, positionate and initialise the popover for link edition.
   * @param  {array} segments  An array with the segments of 
   *                           the link [<a>,...<a>]. Must be created even if
   *                           it is a creation in order to put a background
   *                           on the segment where the link will be.
   * @param  {boolean} isLinkCreation True is it is a creation. In this case,
   *                                  if the process is canceled, the initial
   *                                  state without link will be restored.
  */


  CNeditor.prototype._showUrlPopover = function(segments, isLinkCreation) {
    var href, pop, seg, txt, _i, _j, _len, _len1;
    pop = this.urlPopover;
    this.disable();
    this.isUrlPopoverOn = true;
    pop.isLinkCreation = isLinkCreation;
    pop.initialSelRg = this.currentSel.theoricalRange.cloneRange();
    pop.segments = segments;
    seg = segments[0];
    pop.style.left = seg.offsetLeft + 'px';
    pop.style.top = seg.offsetTop + 20 + 'px';
    href = seg.href;
    if (href === '' || href === 'http:///') {
      href = 'http://';
    }
    pop.urlInput.value = href;
    txt = '';
    for (_i = 0, _len = segments.length; _i < _len; _i++) {
      seg = segments[_i];
      txt += seg.textContent;
    }
    pop.textInput.value = txt;
    pop.initialTxt = txt;
    if (isLinkCreation) {
      pop.titleElt.textContent = 'Create Link';
      pop.link.style.display = 'none';
    } else {
      pop.titleElt.textContent = 'Edit Link';
      pop.link.style.display = 'inline-block';
      pop.link.href = href;
    }
    seg.parentElement.parentElement.appendChild(pop);
    pop.evt = this.editorBody$[0].addEventListener('mouseup', this._detectClickOutUrlPopover);
    pop.urlInput.select();
    pop.urlInput.focus();
    for (_j = 0, _len1 = segments.length; _j < _len1; _j++) {
      seg = segments[_j];
      seg.style.backgroundColor = '#dddddd';
    }
    return true;
  };

  /**
   * The callback for a click outside the popover
  */


  CNeditor.prototype._detectClickOutUrlPopover = function(e) {
    var isOut;
    isOut = e.target !== this.urlPopover && $(e.target).parents('#CNE_urlPopover').length === 0;
    if (isOut) {
      return this._cancelUrlPopover(true);
    }
  };

  /**
   * Close the popover and revert modifications if isLinkCreation == true
   * @param  {boolean} doNotRestoreOginalSel If true, lets the caret at its
   *                                         position (used when you click
   *                                         outside url popover in order not 
   *                                         to loose the new selection)
  */


  CNeditor.prototype._cancelUrlPopover = function(doNotRestoreOginalSel) {
    var pop, seg, segments, sel, serial, _i, _len;
    pop = this.urlPopover;
    segments = pop.segments;
    this.editorBody$[0].removeEventListener('mouseup', this._detectClickOutUrlPopover);
    pop.parentElement.removeChild(pop);
    this.isUrlPopoverOn = false;
    for (_i = 0, _len = segments.length; _i < _len; _i++) {
      seg = segments[_i];
      seg.style.removeProperty('background-color');
    }
    if (pop.isLinkCreation) {
      if (doNotRestoreOginalSel) {
        serial = this.serializeSel();
        this._forceUndo();
        if (serial) {
          this.deSerializeSelection(serial);
        }
      } else {
        this._forceUndo();
      }
    } else if (!doNotRestoreOginalSel) {
      sel = this.document.getSelection();
      sel.removeAllRanges();
      sel.addRange(pop.initialSelRg);
    }
    this.setFocus();
    this.enable();
    return true;
  };

  /**
   * Same as _cancelUrlPopover but used in events call backs
  */


  CNeditor.prototype._cancelUrlPopoverCB = function(e) {
    e.stopPropagation();
    return this._cancelUrlPopover(false);
  };

  /**
   * Close the popover and applies modifications to the link.
  */


  CNeditor.prototype._validateUrlPopover = function(event) {
    var bp1, bp2, bps, i, l, lastSeg, parent, pop, rg, seg, segments, sel, _i, _j, _k, _len, _len1, _ref;
    if (event) {
      event.stopPropagation();
    }
    pop = this.urlPopover;
    segments = pop.segments;
    if (pop.urlInput.value === '' && pop.isLinkCreation) {
      this._cancelUrlPopover(false);
      return true;
    }
    this.editorBody$[0].removeEventListener('mouseup', this._detectClickOutUrlPopover);
    pop.parentElement.removeChild(pop);
    this.isUrlPopoverOn = false;
    for (_i = 0, _len = segments.length; _i < _len; _i++) {
      seg = segments[_i];
      seg.style.removeProperty('background-color');
    }
    if (!pop.isLinkCreation) {
      sel = this.document.getSelection();
      sel.removeAllRanges();
      sel.addRange(pop.initialSelRg);
      this._addHistory();
    }
    if (pop.urlInput.value === '') {
      l = segments.length;
      bp1 = {
        cont: segments[0].firstChild,
        offset: 0
      };
      bp2 = {
        cont: segments[l - 1].firstChild,
        offset: segments[l - 1].firstChild.length
      };
      bps = [bp1, bp2];
      this._applyAhrefToSegments(segments[0], segments[l - 1], bps, false, '');
      rg = document.createRange();
      bp1 = bps[0];
      bp2 = bps[1];
      rg.setStart(bp1.cont, bp1.offset);
      rg.setEnd(bp2.cont, bp2.offset);
      sel = this.document.getSelection();
      sel.removeAllRanges();
      sel.addRange(rg);
      this.setFocus();
      return true;
    } else if (pop.initialTxt === pop.textInput.value) {
      for (_j = 0, _len1 = segments.length; _j < _len1; _j++) {
        seg = segments[_j];
        seg.href = pop.urlInput.value;
      }
      lastSeg = seg;
    } else {
      seg = segments[0];
      seg.href = pop.urlInput.value;
      seg.textContent = pop.textInput.value;
      parent = seg.parentNode;
      for (i = _k = 1, _ref = segments.length - 1; _k <= _ref; i = _k += 1) {
        seg = segments[i];
        parent.removeChild(seg);
      }
      lastSeg = segments[0];
    }
    this._setCaretAfter(lastSeg);
    this.setFocus();
    this.enable();
    return this.editorTarget$.trigger(jQuery.Event('onChange'));
  };

  /**
   * initialise the popover during the editor initialization.
  */


  CNeditor.prototype._initUrlPopover = function() {
    var b, btnCancel, btnDelete, btnOK, frag, pop, textInput, urlInput, _ref, _ref1,
      _this = this;
    frag = document.createDocumentFragment();
    pop = document.createElement('div');
    pop.id = 'CNE_urlPopover';
    pop.className = 'CNE_urlpop';
    pop.setAttribute('contenteditable', 'false');
    frag.appendChild(pop);
    pop.innerHTML = "<span class=\"CNE_urlpop_head\">Link</span>\n<span  class=\"CNE_urlpop_shortcuts\">(Ctrl+K)</span>\n<div class=\"CNE_urlpop-content\">\n    <a target=\"_blank\">Open link <span class=\"CNE_urlpop_shortcuts\">(Ctrl+click)</span></a></br>\n    <span>url</span><input type=\"text\"></br>\n    <span>Text</span><input type=\"text\"></br>\n    <button>ok</button>\n    <button>Cancel</button>\n    <button>Delete</button>\n</div>";
    pop.titleElt = pop.firstChild;
    pop.link = pop.getElementsByTagName('A')[0];
    b = document.querySelector('body');
    _ref = pop.querySelectorAll('button'), btnOK = _ref[0], btnCancel = _ref[1], btnDelete = _ref[2];
    btnOK.addEventListener('click', this._validateUrlPopover);
    btnCancel.addEventListener('click', this._cancelUrlPopoverCB);
    btnDelete.addEventListener('click', function() {
      pop.urlInput.value = '';
      return _this._validateUrlPopover();
    });
    _ref1 = pop.querySelectorAll('input'), urlInput = _ref1[0], textInput = _ref1[1];
    pop.urlInput = urlInput;
    pop.textInput = textInput;
    pop.addEventListener('keypress', function(e) {
      if (e.keyCode === 13) {
        _this._validateUrlPopover();
        e.stopPropagation();
      } else if (e.keyCode === 27) {
        _this._cancelUrlPopover(false);
      }
      return false;
    });
    this.urlPopover = pop;
    return true;
  };

  /**
   * Tests if a the start break point of the selection or of a range is in a 
   * segment being a link. If yes returns the array of the segments 
   * corresponding to the link starting in this bp, false otherwise.
   * The link can be composed of several segments, but they are on a single
   * line. Only the start break point is taken into account, not the end bp.
   * Prerequisite : thit.currentSel must havec been updated before calling
   * this function.
   * @param {Range} rg [optionnal] The range to use instead of selection.
   * @return {Boolean} The segment if in a link, false otherwise
  */


  CNeditor.prototype._getLinkSegments = function(rg) {
    var segment1, segments, sibling;
    if (!rg) {
      rg = this.currentSel.theoricalRange;
    }
    segment1 = selection.getSegment(rg.startContainer, rg.startOffset);
    segments = [segment1];
    if (segment1.nodeName === 'A') {
      sibling = segment1.nextSibling;
      while (sibling !== null && sibling.nodeName === 'A' && sibling.href === segment1.href) {
        segments.push(sibling);
        sibling = sibling.nextSibling;
      }
      segments.reverse();
      sibling = segment1.previousSibling;
      while (sibling !== null && sibling.nodeName === 'A' && sibling.href === segment1.href) {
        segments.push(sibling);
        sibling = sibling.previousSibling;
      }
      segments.reverse();
      return segments;
    } else {
      return false;
    }
  };

  /**
   * Applies a metadata such as STRONG, UNDERLINED, A/href etc... on the
   * selected text. The selection must not be collapsed.
   * @param  {string} metaData  The css class of the meta data or 'A' if link
   * @param  {string} others... Other params if metadata requires 
   *                            some (href for instance)
  */


  CNeditor.prototype._applyMetaDataOnSelection = function() {
    var addMeta, bp1, bp2, bps, currentSel, endLine, isAlreadyMeta, line, linesRanges, metaData, others, range, rg, rgEnd, rgStart, sel, _i, _j, _len, _len1;
    metaData = arguments[0], others = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    currentSel = this.updateCurrentSelIsStartIsEnd();
    range = currentSel.theoricalRange;
    if (range.collapsed) {
      return;
    }
    line = currentSel.startLine;
    endLine = currentSel.endLine;
    if (currentSel.firstLineIsEnd) {
      if (line.line$[0].textContent !== '') {
        line = line.lineNext;
        if (line === null) {
          return;
        }
        range.setStartBefore(line.line$[0].firstChild);
        selection.normalize(range);
        if (range.collapsed) {
          return;
        }
      }
    }
    if (currentSel.lastLineIsStart) {
      if (endLine.line$[0].textContent !== '') {
        endLine = endLine.linePrev;
        if (endLine === null) {
          return;
        }
        range.setEndBefore(endLine.line$[0].lastChild);
        selection.normalize(range);
        if (range.collapsed) {
          return;
        }
      }
    }
    if (metaData === 'A' && line !== endLine) {
      range.setEndBefore(line.line$[0].lastChild);
      selection.normalize(range);
      endLine = line;
      if (range.collapsed) {
        return;
      }
    }
    if (line === endLine) {
      linesRanges = [range];
    } else {
      rgStart = range.cloneRange();
      rgStart.setEndBefore(line.line$[0].lastChild);
      selection.normalize(rgStart);
      linesRanges = [rgStart];
      line = line.lineNext;
      while (line !== endLine) {
        rg = this.document.createRange();
        rg.selectNodeContents(line.line$[0]);
        selection.normalize(rg);
        linesRanges.push(rg);
        line = line.lineNext;
      }
      rgEnd = range.cloneRange();
      rgEnd.setStartBefore(endLine.line$[0].firstChild);
      selection.normalize(rgEnd);
      linesRanges.push(rgEnd);
    }
    isAlreadyMeta = true;
    for (_i = 0, _len = linesRanges.length; _i < _len; _i++) {
      range = linesRanges[_i];
      isAlreadyMeta = isAlreadyMeta && this._checkIfMetaIsEverywhere(range, metaData, others);
    }
    addMeta = !isAlreadyMeta;
    bps = [];
    for (_j = 0, _len1 = linesRanges.length; _j < _len1; _j++) {
      range = linesRanges[_j];
      bps.push(this._applyMetaOnLineRange(range, addMeta, metaData, others));
    }
    rg = this.document.createRange();
    bp1 = bps[0][0];
    bp2 = bps[bps.length - 1][1];
    rg.setStart(bp1.cont, bp1.offset);
    rg.setEnd(bp2.cont, bp2.offset);
    sel = this.currentSel.sel;
    sel.removeAllRanges();
    sel.addRange(rg);
    return rg;
  };

  /**
   * Walk though the segments delimited by the range (which must be in a 
   * single line) to check if the meta si on all of them.
   * @param  {range} range a range contained within a line. The range must be
   *                 normalized, ie its breakpoints must be in text nodes.
   * @param  {string} meta  The name of the meta data to look for. It can be
   *                        a css class ('CNE_strong' for instance), or a
   *                        metadata type ('A' for instance)
   * @param  {string} href  Others parameters of the meta data type if 
   *                        required (href value for a 'A' meta)
   * @return {boolean}       true if the meta data is already on all the 
   *                         segments delimited by the range.
  */


  CNeditor.prototype._checkIfMetaIsEverywhere = function(range, meta, others) {
    if (meta === 'A') {
      return this._checkIfAhrefIsEverywhere(range, others[0]);
    } else {
      return this._checkIfCSSIsEverywhere(range, meta);
    }
  };

  CNeditor.prototype._checkIfCSSIsEverywhere = function(range, CssClass) {
    var endSegment, segment, stopNext;
    segment = range.startContainer.parentNode;
    endSegment = range.endContainer.parentNode;
    stopNext = segment === endSegment;
    while (true) {
      if (!segment.classList.contains(CssClass)) {
        return false;
      } else {
        if (stopNext) {
          return true;
        }
        segment = segment.nextSibling;
        stopNext = segment === endSegment;
      }
    }
  };

  CNeditor.prototype._checkIfAhrefIsEverywhere = function(range, href) {
    var endSegment, segment, stopNext;
    segment = range.startContainer.parentNode;
    endSegment = range.endContainer.parentNode;
    stopNext = segment === endSegment;
    while (true) {
      if (segment.nodeName !== 'A' || segment.href !== href) {
        return false;
      } else {
        if (stopNext) {
          return true;
        }
        segment = segment.nextSibling;
        stopNext = segment === endSegment;
      }
    }
  };

  /**
   * Add or remove a meta data to the segments delimited by the range. The
   * range must be within a single line and normalized (its breakpoints must
   * be in text nodes)
   * @param  {range} range    The range on which we want to apply the 
   *                          metadata. The range must be within a single line
   *                          and normalized (its breakpoints must be in text
   *                          nodes). The start breakpoint can not be at the
   *                          end of the line, except in the case of an empty 
   *                          line fully selected. Same for end breakpoint : 
   *                          it can not be at the beginning of the line, 
   *                          except in the case of an empty line fully 
   *                          selected.
   * @param  {boolean} addMeta  True if the action is to add the metaData, 
   *                            False if the action is to remove it.
   * @param  {string} metaData The name of the meta data to look for. It can
   *                           be a css class ('CNE_strong' for instance), 
   *                           or a metadata type ('A' for instance)
   * @param {array} others Array of others params fot meta, can be [] but not
   *                       null (not optionnal)
   * @return {array}          [bp1,bp2] : the breakpoints corresponding to the
   *                          initial range after the line transformation.
  */


  CNeditor.prototype._applyMetaOnLineRange = function(range, addMeta, metaData, others) {
    var bp1, bp2, bps, breakPoints, endSegment, frag1, frag2, isAlreadyMeta, lineDiv, rg, span, startSegment;
    lineDiv = selection.getLineDiv(range.startContainer, range.startOffset);
    startSegment = range.startContainer.parentNode;
    endSegment = range.endContainer.parentNode;
    bp1 = {
      cont: range.startContainer,
      offset: range.startOffset
    };
    bp2 = {
      cont: range.endContainer,
      offset: range.endOffset
    };
    breakPoints = [bp1, bp2];
    if (bp1.offset === 0) {

    } else if (bp1.offset === bp1.cont.length) {
      startSegment = startSegment.nextSibling;
      if (startSegment === null || startSegment.nodeName === 'BR') {
        return;
      }
    } else {
      isAlreadyMeta = this._isAlreadyMeta(startSegment, metaData, others);
      if (isAlreadyMeta && !addMeta || !isAlreadyMeta && addMeta) {
        rg = range.cloneRange();
        if (endSegment === startSegment) {
          frag1 = rg.extractContents();
          span = document.createElement(startSegment.nodeName);
          if (startSegment.className !== '') {
            span.className = startSegment.className;
          }
          if (startSegment.nodeName === 'A') {
            span.href = startSegment.href;
          }
          span = frag1.appendChild(span);
          span.appendChild(frag1.firstChild);
          rg.setEndAfter(startSegment);
          frag2 = rg.extractContents();
          if (frag2.textContent !== '') {
            rg.insertNode(frag2);
          }
          rg.insertNode(frag1);
          startSegment = span;
          endSegment = startSegment;
          bp1.cont = startSegment.firstChild;
          bp1.offset = 0;
          bp2.cont = endSegment.lastChild;
          bp2.offset = endSegment.lastChild.length;
        } else {
          rg.setEndAfter(startSegment);
          frag1 = rg.extractContents();
          startSegment = frag1.firstChild;
          bp1.cont = startSegment.firstChild;
          bp1.offset = 0;
          rg.insertNode(frag1);
        }
      }
    }
    if (bp2.offset === bp2.cont.length) {

    } else if (bp2.offset === 0) {
      endSegment = endSegment.previousSibling;
      if (endSegment === null) {
        return;
      }
    } else {
      isAlreadyMeta = this._isAlreadyMeta(endSegment, metaData, others);
      if (isAlreadyMeta && !addMeta || !isAlreadyMeta && addMeta) {
        rg = range.cloneRange();
        rg.setStartBefore(endSegment);
        frag1 = rg.extractContents();
        if (endSegment === startSegment) {
          startSegment = frag1.firstChild;
          bp1.cont = startSegment.firstChild;
          bp1.offset = 0;
        }
        endSegment = frag1.firstChild;
        bp2.cont = endSegment.lastChild;
        bp2.offset = endSegment.lastChild.length;
        rg.insertNode(frag1);
      }
    }
    if (metaData === 'A') {
      bps = [bp1, bp2];
      this._applyAhrefToSegments(startSegment, endSegment, bps, addMeta, others[0]);
    } else {
      this._applyCssToSegments(startSegment, endSegment, addMeta, metaData);
    }
    this._fusionSimilarSegments(lineDiv, breakPoints);
    return [bp1, bp2];
  };

  /**
   * Test if a segment already has the meta : same type, same class and other 
   * for complex meta (for instance href for <a>)
   * @param  {element}  segment  The segment to test
   * @param  {string}  metaData the type of meta data : A or a CSS class
   * @param  {array}  others   An array of the other parameter of the meta,
   *                           for instance si metaData == 'A', 
   *                           others[0] == href
   * @return {Boolean}          True if the segment already have the meta data
  */


  CNeditor.prototype._isAlreadyMeta = function(segment, metaData, others) {
    if (metaData === 'A') {
      return segment.nodeName === 'A' && segment.href === others[0];
    } else {
      return segment.classList.contains(metaData);
    }
  };

  /**
   * Applies or remove a meta data of type "A" (link) on a succession of 
   * segments (from startSegment to endSegment which must be on the same line)
   * @param  {element} startSegment The first segment to modify
   * @param  {element} endSegment   The last segment to modify (must be in the
   *                                same line as startSegment)
   * @param  {Array} bps          [{cont,offset}...] An array of breakpoints 
   *                              to update if their container is modified
   *                              while applying the meta data.
   * @param  {Boolean} addMeta      True to apply the meta, False to remove
   * @param  {string} href         the href to use if addMeta is true.
  */


  CNeditor.prototype._applyAhrefToSegments = function(startSegment, endSegment, bps, addMeta, href) {
    var a, bp, segment, span, stopNext, _i, _j, _len, _len1;
    segment = startSegment;
    stopNext = segment === endSegment;
    while (true) {
      if (addMeta) {
        if (segment.nodeName === 'A') {
          segment.href = href;
        } else {
          a = document.createElement('A');
          a.href = href;
          a.textContent = segment.textContent;
          a.className = segment.className;
          for (_i = 0, _len = bps.length; _i < _len; _i++) {
            bp = bps[_i];
            if (bp.cont.parentNode === segment) {
              bp.cont = a.firstChild;
            }
          }
          segment.parentNode.replaceChild(a, segment);
          segment = a;
        }
      } else {
        span = document.createElement('SPAN');
        span.textContent = segment.textContent;
        span.className = segment.className;
        for (_j = 0, _len1 = bps.length; _j < _len1; _j++) {
          bp = bps[_j];
          if (bp.cont.parentNode === segment) {
            bp.cont = span.firstChild;
          }
        }
        segment.parentNode.replaceChild(span, segment);
        segment = span;
      }
      if (stopNext) {
        break;
      }
      segment = segment.nextSibling;
      stopNext = segment === endSegment;
    }
    return null;
  };

  /**
   * Applies or remove a CSS class to a succession of segments (from 
   * startsegment to endSegment which must be on the same line)
   * @param  {element} startSegment The first segment to modify
   * @param  {element} endSegment   The last segment to modify (must be in the
   *                                same line as startSegment)
   * @param  {Boolean} addMeta      True to apply the meta, False to remove
   * @param  {String} cssClass     The name of the CSS class to add or remove
  */


  CNeditor.prototype._applyCssToSegments = function(startSegment, endSegment, addMeta, cssClass) {
    var segment, stopNext;
    segment = startSegment;
    stopNext = segment === endSegment;
    while (true) {
      if (addMeta) {
        segment.classList.add(cssClass);
      } else {
        segment.classList.remove(cssClass);
      }
      if (stopNext) {
        break;
      }
      segment = segment.nextSibling;
      stopNext = segment === endSegment;
    }
    return null;
  };

  /**
   * Walk through a line div in order to :
   *   * Concatenate successive similar segments. Similar == same nodeName, 
   *     class and if required href.
   *   * Remove empty segments.
   * @param  {element} lineDiv     the DIV containing the line
   * @param  {Object} breakPoints [{con,offset}...] array of respectively the 
   *                              container and offset of the breakpoint to 
   *                              update if cont is in a segment modified by 
   *                              the fusion. 
   *                              /!\ The breakpoint must be normalized, ie 
   *                              containers must be in textnodes.
   *                              If the contener of a bp is deleted, then it
   *                              is put before the deleted segment. At the
   *                              bp might be between segments, ie NOT 
   *                              normalized since not in a textNode.
   * @return {Object}             A reference to the updated breakpoint.
  */


  CNeditor.prototype._fusionSimilarSegments = function(lineDiv, breakPoints) {
    var nextSegment, segment;
    segment = lineDiv.firstChild;
    nextSegment = segment.nextSibling;
    if (nextSegment.nodeName === 'BR') {
      return breakPoints;
    }
    while (nextSegment.nodeName !== 'BR') {
      if (segment.textContent === '') {
        segment = this._removeSegment(segment, breakPoints);
        selection.normalizeBPs(breakPoints);
        nextSegment = segment.nextSibling;
      } else if (this._haveSameMeta(segment, nextSegment)) {
        this._fusionSegments(segment, nextSegment, breakPoints);
        nextSegment = segment.nextSibling;
      } else {
        segment = nextSegment;
        nextSegment = nextSegment.nextSibling;
      }
    }
    if (segment.textContent === '' && segment.previousSibling !== null) {
      segment = this._removeSegment(segment, breakPoints);
      selection.normalizeBPs(breakPoints);
    }
    return breakPoints;
  };

  /**
   * Removes a segment and returns a reference to previous sibling or, 
   * if doesn't exist, to the next sibling.
   * @param  {element} segment     The segment to remove. Must be in a line.
   * @param  {Array} breakPoints An Array of breakpoint to preserve : if its
   *                             is deleted, the bp is put before the deleted
   *                             segment (it is NOT normalized, since not in a
   *                             textNode)
   * @return {element}       A reference to the previous sibling or, 
   *                         if doesn't exist, to the next sibling.
  */


  CNeditor.prototype._removeSegment = function(segment, breakPoints) {
    var bp, newRef, offset, _i, _j, _len, _len1;
    if (breakPoints.length > 0) {
      for (_i = 0, _len = breakPoints.length; _i < _len; _i++) {
        bp = breakPoints[_i];
        bp.seg = selection.getNestedSegment(bp.cont);
      }
    }
    for (_j = 0, _len1 = breakPoints.length; _j < _len1; _j++) {
      bp = breakPoints[_j];
      if (bp.seg === segment) {
        offset = selection.getNodeIndex(segment);
        bp.cont = segment.parentNode;
        bp.offset = offset;
      }
    }
    newRef = segment.previousSibling;
    if (!newRef) {
      newRef = segment.nextSibling;
    }
    segment.parentNode.removeChild(segment);
    return newRef;
  };

  /**
   * Imports the content of segment2 in segment1 and updates the breakpoint if
   * this on is  inside segment2
   * @param  {element} segment1    the segment in which the fusion operates
   * @param  {element} segment2    the segement that will be imported in segment1
   * @param  {Array} breakPoints [{con,offset}...] array of respectively the 
   *                              container and offset of the breakpoint to 
   *                              update if cont is in segment2. /!\ The 
   *                              breakpoint must be normalized, ie containers
   *                              must be in textnodes.
  */


  CNeditor.prototype._fusionSegments = function(segment1, segment2, breakPoints) {
    var bp, child, children, txtNode1, txtNode2, _i, _j, _len, _len1, _ref;
    children = Array.prototype.slice.call(segment2.childNodes);
    _ref = segment2.childNodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      child = _ref[_i];
      segment1.appendChild(child);
    }
    txtNode1 = segment1.firstChild;
    txtNode2 = txtNode1.nextSibling;
    while (txtNode2 !== null) {
      if ((txtNode1.nodeName === '#text' && '#text' === txtNode2.nodeName)) {
        for (_j = 0, _len1 = breakPoints.length; _j < _len1; _j++) {
          bp = breakPoints[_j];
          if (bp.cont === txtNode2) {
            bp.cont = txtNode1;
            bp.offset = txtNode1.length + bp.offset;
          }
        }
        txtNode1.textContent += txtNode2.textContent;
        segment1.removeChild(txtNode2);
        txtNode2 = txtNode1.nextSibling;
      } else {
        txtNode1 = segment1.firstChild;
        txtNode2 = txtNode1.nextSibling;
      }
    }
    segment2.parentNode.removeChild(segment2);
    return true;
  };

  CNeditor.prototype._haveSameMeta = function(segment1, segment2) {
    var clas, list1, list2, _i, _len;
    if (segment1.nodeName !== segment2.nodeName) {
      return false;
    } else if (segment1.nodeName === 'A') {
      if (segment1.href !== segment2.href) {
        return false;
      }
    }
    list1 = segment1.classList;
    list2 = segment2.classList;
    if (list1.length !== list2.length) {
      return false;
    }
    if (list1.length === 0) {
      return true;
    }
    for (_i = 0, _len = list2.length; _i < _len; _i++) {
      clas = list2[_i];
      if (!list1.contains(clas)) {
        return false;
      }
    }
    return true;
  };

  /* ------------------------------------------------------------------------
  #  _suppr :
  # 
  # Manage deletions when suppr key is pressed
  */


  CNeditor.prototype._suppr = function(event) {
    var bp, sel, startLine, startOffset, textNode, txt;
    sel = this.currentSel;
    startLine = sel.startLine;
    if (sel.range.collapsed) {
      if (sel.rangeIsEndLine) {
        if (startLine.lineNext !== null) {
          sel.range.setEndBefore(startLine.lineNext.line$[0].firstChild);
          sel.theoricalRange = sel.range;
          sel.endLine = startLine.lineNext;
          this._deleteMultiLinesSelections();
        } else {

        }
      } else {
        textNode = sel.range.startContainer;
        startOffset = sel.range.startOffset;
        if (startOffset === textNode.length) {
          bp = selection.setBpNextSegEnd(textNode);
          textNode = bp.cont;
          startOffset = bp.offset;
        }
        txt = textNode.textContent;
        textNode.textContent = txt.substr(0, startOffset) + txt.substr(startOffset + 1);
        bp = {
          cont: textNode,
          offset: startOffset
        };
        if (textNode.textContent.length === 0) {
          this._fusionSimilarSegments(startLine.line$[0], [bp]);
        }
        this._setCaret(bp.cont, bp.offset);
      }
    } else if (sel.endLine === startLine) {
      sel.range.deleteContents();
      bp = {
        cont: sel.range.startContainer,
        offset: sel.range.startOffset
      };
      this._fusionSimilarSegments(sel.startLine.line$[0], [bp]);
      this._setCaret(bp.cont, bp.offset);
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
    var bp, cloneRg, sel, startLine, startOffset, textNode, txt;
    sel = this.currentSel;
    startLine = sel.startLine;
    if (sel.range.collapsed) {
      if (sel.rangeIsStartLine) {
        if (startLine.linePrev !== null) {
          cloneRg = sel.range.cloneRange();
          cloneRg.setStartBefore(startLine.linePrev.line$[0].lastChild);
          selection.normalize(cloneRg);
          sel.theoricalRange = cloneRg;
          sel.startLine = startLine.linePrev;
          this._deleteMultiLinesSelections();
        }
      } else {
        textNode = sel.range.startContainer;
        startOffset = sel.range.startOffset;
        if (startOffset === 0) {
          bp = selection.setBpPreviousSegEnd(textNode);
          textNode = bp.cont;
          startOffset = bp.offset;
        }
        txt = textNode.textContent;
        textNode.textContent = txt.substr(0, startOffset - 1) + txt.substr(startOffset);
        bp = {
          cont: textNode,
          offset: startOffset - 1
        };
        if (textNode.textContent.length === 0) {
          this._fusionSimilarSegments(sel.startLine.line$[0], [bp]);
        }
        this._setCaret(bp.cont, bp.offset);
      }
    } else if (sel.endLine === startLine) {
      sel.range.deleteContents();
      bp = {
        cont: sel.range.startContainer,
        offset: sel.range.startOffset
      };
      this._fusionSimilarSegments(sel.startLine.line$[0], [bp]);
      this._setCaret(bp.cont, bp.offset);
    } else {
      this._deleteMultiLinesSelections();
    }
    return true;
  };

  /**
   * Turn selected lines in a title List (Th). History is incremented.
   * @param  {Line} l [optionnal] The line to convert in Th
  */


  CNeditor.prototype.titleList = function(l) {
    var endDiv, endLineID, line, range, startDiv, startDivID, _results;
    if (!this.isEnabled || this.hasNoSelection()) {
      return true;
    }
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

  /**
   * Turn selected lines or the one given in parameter in a 
   * Marker List line (Tu)
   * @param  {Line} l [optional] The line to turn in to a Tu
  */


  CNeditor.prototype.markerList = function(l) {
    var endDiv, endLineID, line, range, startDiv, startDivID, _results;
    if (!this.isEnabled || this.hasNoSelection()) {
      return true;
    }
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

  /**
   * Toggle the type of the selected lines.
   * Lx => Tx and Tu <=> Th
   * Increments history.
   * @return {[type]} [description]
  */


  CNeditor.prototype.toggleType = function() {
    var currentDepth, depthIsTreated, done, endDiv, endLineID, line, range, sel, startDiv;
    if (!this.isEnabled || this.hasNoSelection()) {
      return true;
    }
    this._addHistory();
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
      case 'Lu':
        lineTypeTarget = 'Tu';
        break;
      case 'Lh':
        lineTypeTarget = 'Th';
        break;
      default:
        return false;
    }
    line.setType(lineTypeTarget);
    return true;
  };

  /**
   * Indent selection. History is incremented. 
   * @param  {[type]} l [description]
   * @return {[type]}   [description]
  */


  CNeditor.prototype.tab = function(l) {
    var endDiv, endLineID, line, range, sel, startDiv, _results;
    if (!this.isEnabled || this.hasNoSelection()) {
      return true;
    }
    this._addHistory();
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
        prevSibling = this._findPrevSiblingT(line);
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
        prevSib = this._findPrevSiblingT(line, depthAbsTarget);
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
    line.setType(typeTarget);
    return this.adjustSiblingsToType(line);
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

  /**
   * Un-indent the selection. History is incremented.
   * @param  {Range} range [optional] A range containing the lines to un-indent
  */


  CNeditor.prototype.shiftTab = function(range) {
    var endDiv, endLineID, line, sel, startDiv;
    if (!this.isEnabled || this.hasNoSelection()) {
      return true;
    }
    this._addHistory();
    if (range == null) {
      sel = this.getEditorSelection();
      range = sel.getRangeAt(0);
    }
    startDiv = selection.getLineDiv(range.startContainer, range.startOffset);
    endDiv = selection.getLineDiv(range.endContainer, range.endOffset);
    endLineID = endDiv.id;
    line = this._lines[startDiv.id];
    while (true) {
      this._shiftTabLine(line);
      if (line.lineID === endDiv.id) {
        break;
      } else {
        line = line.lineNext;
      }
    }
    return true;
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
        nextL = line.lineNext;
        if (nextL && nextL.lineDepthAbs > line.lineDepthAbs) {
          while (nextL && nextL.lineDepthAbs > line.lineDepthAbs) {
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
        prevSib = this._findPrevSiblingT(line, depthAbsTarget);
        prevSibType = prevSib === null ? null : prevSib.lineType;
        typeTarget = this._chooseTypeTarget(prevSibType, nextSibType);
    }
    line.setType(typeTarget);
    return this.adjustSiblingsToType(line);
  };

  CNeditor.prototype.adjustSiblingsToType = function(line) {
    var lineIt, _results;
    lineIt = line;
    _results = [];
    while (true) {
      if (lineIt.lineDepthAbs === line.lineDepthAbs) {
        if (lineIt.lineType[1] !== line.lineType[1]) {
          lineIt.setType(lineIt.lineType[0] + line.lineType[1]);
        }
      }
      lineIt = lineIt.lineNext;
      if (lineIt === null || lineIt.lineDepthAbs < line.lineDepthAbs) {
        break;
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  /* ------------------------------------------------------------------------
  #  _return
  # return keypress
  #   e = event
  */


  CNeditor.prototype._return = function() {
    var bp1, currSel, dh, endLine, endOfLineFragment, l, newLine, p, rg, startLine, testFrag, _ref;
    currSel = this.currentSel;
    startLine = currSel.startLine;
    endLine = currSel.endLine;
    if (currSel.range.collapsed) {

    } else if (endLine === startLine) {
      rg = currSel.range;
      rg.deleteContents();
      bp1 = selection.normalizeBP(rg.startContainer, rg.startOffset);
      this._fusionSimilarSegments(startLine.line$[0], [bp1]);
      rg.setStart(bp1.cont, bp1.offset);
      rg.collapse(true);
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
      this._setCaret(newLine.line$[0].firstChild.firstChild, 0);
    } else if (currSel.rangeIsStartLine) {
      newLine = this._insertLineBefore({
        sourceLine: startLine,
        targetLineType: startLine.lineType,
        targetLineDepthAbs: startLine.lineDepthAbs,
        targetLineDepthRel: startLine.lineDepthRel
      });
      this._setCaret(startLine.line$[0].firstChild.firstChild, 0);
    } else {
      currSel.range.setEndBefore(startLine.line$[0].lastChild);
      testFrag = currSel.range.cloneContents();
      endOfLineFragment = currSel.range.extractContents();
      newLine = this._insertLineAfter({
        sourceLine: startLine,
        targetLineType: startLine.lineType,
        targetLineDepthAbs: startLine.lineDepthAbs,
        targetLineDepthRel: startLine.lineDepthRel,
        fragment: endOfLineFragment
      });
      this._fusionSimilarSegments(newLine.line$[0], []);
      this._setCaret(newLine.line$[0].firstChild.firstChild, 0);
    }
    l = newLine.line$[0];
    p = l.parentNode;
    dh = p.getBoundingClientRect().height;
    if (!(((l.offsetTop + 20 - dh) < (_ref = p.scrollTop) && _ref < l.offsetTop))) {
      return l.scrollIntoView(false);
    }
  };

  CNeditor.prototype.getFirstline = function() {
    return this._lines[this.linesDiv.childNodes[0].id];
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
   * Find the previous sibling line being a Title.
   * Returns null if no previous sibling, the line otherwise.
   * The sibling is a title (Th, Tu or To), not a line (Lh nor Lu nor Lo)
   * @param  {line} line     Rhe starting line for which we search a sibling
   * @param  {number} depthAbs [optional] If the siblings we search is not
   *                           of the same absolute depth
   * @return {line}          The previous sibling if one, null otherwise
  */


  CNeditor.prototype._findPrevSiblingT = function(line, depth) {
    var prevSib;
    if (!depth) {
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

  /** -----------------------------------------------------------------------
   * Find the previous sibling line (can be a line 'Lx' or a title 'Tx').
   * Returns null if no previous sibling, the line otherwise.
   * @param  {line} line     The starting line for which we search a sibling
   * @param  {number} depthAbs [optional] If the siblings we search is not
   *                           of the same absolute depth
   * @return {line}          The previous sibling if one, null otherwise
  */


  CNeditor.prototype._findPrevSibling = function(line, depth) {
    var prevSib;
    if (!depth) {
      depth = line.lineDepthAbs;
    }
    prevSib = line.linePrev;
    while (true) {
      if (prevSib === null || prevSib.lineDepthAbs < depth) {
        prevSib = null;
        break;
      } else if (prevSib.lineDepthAbs === depth) {
        break;
      }
      prevSib = prevSib.linePrev;
    }
    return prevSib;
  };

  /**
  # Delete the user multi line selection :
  #    * The 2 lines (selected or given in param) must be distinct
  #    * If no params :
  #        - @currentSel.theoricalRange will the range used to find the  
  #          lines to delete. 
  #        - Only the range is deleted, not the beginning of startline nor the
  #          end of endLine
  #        - the caret is positionned at the firts break point of range.
  #    * if startLine and endLine is given
  #       - the whole lines from start and endLine are deleted, both included.
  #       - the caret position is not updated by this function.
  # @param  {[line]} startLine [optional] if exists, the whole line will be deleted
  # @param  {[line]} endLine   [optional] if exists, the whole line will be deleted
  # @return {[none]}           [nothing]
  */


  CNeditor.prototype._deleteMultiLinesSelections = function(startLine, endLine) {
    var bp, currentDelta, deltaInserted, endLineDepth, endOfLineFragment, firstNextLine, firstNextLineDepth, range, replaceCaret, startContainer, startLineDepth, startOffset;
    if (startLine === null || endLine === null) {
      throw new Error('CEeditor._deleteMultiLinesSelections called with a null param');
    }
    if (startLine != null) {
      range = this.document.createRange();
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
    endLineDepth = endLine.lineDepthAbs;
    endOfLineFragment = selection.cloneEndFragment(range, endLine);
    range.deleteContents();
    this._addMissingFragment(startLine, endOfLineFragment);
    this._removeEndLine(startLine, endLine);
    startLineDepth = startLine.lineDepthAbs;
    firstNextLine = startLine.lineNext;
    if (firstNextLine) {
      firstNextLineDepth = firstNextLine.lineDepthAbs;
      currentDelta = firstNextLine.lineDepthAbs - startLineDepth;
      deltaInserted = endLineDepth - startLineDepth;
      this._adaptDepth(startLine, deltaInserted, currentDelta, startLineDepth);
      this._adaptType(startLine);
    }
    if (replaceCaret) {
      bp = {
        cont: startContainer,
        offset: startOffset
      };
      this._fusionSimilarSegments(startLine.line$[0], [bp]);
      return this._setCaret(bp.cont, bp.offset);
    } else {
      return this._fusionSimilarSegments(startLine.line$[0], []);
    }
  };

  CNeditor.prototype._adaptDepth = function(startLine, deltaInserted, currentDelta, minDepth) {
    var firstNextLine, lineIt;
    if (startLine.lineNext === null) {
      return;
    }
    firstNextLine = startLine.lineNext;
    if (currentDelta > 1) {
      lineIt = firstNextLine;
      lineIt = this._unIndentBlock(lineIt, deltaInserted);
      while (lineIt !== null && lineIt.lineDepthAbs > minDepth) {
        lineIt = this._unIndentBlock(lineIt, deltaInserted);
      }
    }
    return true;
  };

  CNeditor.prototype._adaptType = function(startLine) {
    var lineIt, prev;
    lineIt = startLine.lineNext;
    while (lineIt !== null) {
      prev = this._findPrevSibling(lineIt);
      if (prev === null) {
        if (lineIt.lineType[0] !== 'T') {
          lineIt.setType('T' + lineIt.lineType[1]);
        }
      } else if (prev.lineType[1] !== lineIt.lineType[1]) {
        lineIt.setType(lineIt.lineType[0] + prev.lineType[1]);
      }
      lineIt = lineIt.lineNext;
    }
    return true;
  };

  CNeditor.prototype._unIndentBlock = function(firstLine, delta) {
    var firstLineDepth, line, newDepth;
    line = firstLine;
    firstLineDepth = firstLine.lineDepthAbs;
    newDepth = Math.max(1, line.lineDepthAbs - delta);
    delta = line.lineDepthAbs - newDepth;
    while (line !== null && line.lineDepthAbs >= firstLineDepth) {
      newDepth = line.lineDepthAbs - delta;
      line.setDepthAbs(newDepth);
      line = line.lineNext;
    }
    return line;
  };

  CNeditor.prototype._adaptDepthV0 = function(startLine, startLineDepthAbs, endLineDepthAbs, deltaDepth) {
    var deltaDepth1stLine, depthLine, highestPrevSib, line, lineAfterEndLineSons, minDepth, newDepth, prev, _results;
    if (startLine.lineNext === null) {
      return;
    }
    line = startLine.lineNext;
    deltaDepth1stLine = line.lineDepthAbs - startLineDepthAbs;
    if (deltaDepth1stLine > 1) {
      while (line !== null && line.lineDepthAbs >= endLineDepthAbs) {
        newDepth = line.lineDepthAbs - deltaDepth;
        line.setDepthAbs(newDepth);
        line = line.lineNext;
      }
    }
    lineAfterEndLineSons = line;
    line = startLine.lineNext;
    if (line.lineType[0] === 'L') {
      prev = this._findPrevSiblingT(line);
      if (prev === null) {
        line.setType('T' + line.lineType[1]);
      } else {
        line.setType('L' + prev.lineType[1]);
      }
    }
    if (line === lineAfterEndLineSons) {
      line = line.lineNext;
    } else {
      line = lineAfterEndLineSons;
    }
    highestPrevSib = line.linePrev;
    minDepth = line.lineDepthAbs + 1;
    _results = [];
    while (line !== null && line.lineDepthAbs > 1) {
      depthLine = line.lineDepthAbs;
      if (line.lineDepthAbs < minDepth) {
        minDepth = line.lineDepthAbs;
        if (line.lineType[0] === 'L') {
          prev = highestPrevSib;
          while (prev.lineDepthAbs > depthLine) {
            prev = prev.linePrev;
          }
          highestPrevSib = prev;
          if (line.lineType[1] !== prev.lineType[1]) {
            while (line.lineDepthAbs >= prev.lineDepthAbs) {
              if (line.lineDepthAbs === prev.lineDepthAbs) {
                if (line.lineType[0] === 'L') {
                  line.setType('L' + prev.lineType[1]);
                } else {
                  break;
                }
              }
              line = line.lineNext;
            }
          }
        }
      }
      _results.push(line = line.lineNext);
    }
    return _results;
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

  CNeditor.prototype._adaptEndLineType = function(startLine, endLine, endLineDepthAbs) {
    var deltaDepth, endType, line, newDepth, startType, _results, _results1, _results2;
    endType = endLine.lineType;
    startType = startLine.lineType;
    deltaDepth = endLineDepthAbs - startLine.lineDepthAbs;
    if (endType === 'Tu' && startType === 'Th') {
      this._toggleLineType(endLine);
      line = endLine;
      if (deltaDepth > 0) {
        _results = [];
        while (line !== null && line.lineDepthAbs >= endLineDepthAbs) {
          newDepth = line.lineDepthAbs - deltaDepth;
          line.setDepthAbs(newDepth);
          _results.push(line = line.lineNext);
        }
        return _results;
      }
    } else if (endType === 'Th' && startType === 'Tu') {
      this._toggleLineType(endLine);
      line = endLine;
      if (deltaDepth > 0) {
        _results1 = [];
        while (line !== null && line.lineDepthAbs >= endLineDepthAbs) {
          newDepth = line.lineDepthAbs - deltaDepth;
          line.setDepthAbs(newDepth);
          _results1.push(line = line.lineNext);
        }
        return _results1;
      }
    } else if (endType === 'Th' && startType === 'Th') {
      line = endLine;
      if (deltaDepth > 0) {
        _results2 = [];
        while (line !== null && line.lineDepthAbs >= endLineDepthAbs) {
          newDepth = line.lineDepthAbs - deltaDepth;
          line.setDepthAbs(newDepth);
          _results2.push(line = line.lineNext);
        }
        return _results2;
      }
    }
  };

  /**
   * Put caret at given position. The break point will be normalized (ie put 
   * in the closest text node).
   * @param {element} startContainer Container of the break point
   * @param {number} startOffset    Offset of the break point
   * @param  {boolean} preferNext [optional] if true, in case BP8, we will choose
   *                              to go in next sibling - if it exists - rather 
   *                              than in the previous one.
   * @return {Object} {cont,offset} the normalized break point
  */


  CNeditor.prototype._setCaret = function(startContainer, startOffset, preferNext) {
    var bp, range, sel;
    bp = selection.normalizeBP(startContainer, startOffset, preferNext);
    range = this.document.createRange();
    range.setStart(bp.cont, bp.offset);
    range.collapse(true);
    sel = this.document.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    return bp;
  };

  CNeditor.prototype._setCaretAfter = function(elemt) {
    var index, nextEl, parent;
    nextEl = elemt;
    while (nextEl.nextSibling === null) {
      nextEl = nextEl.parentElement;
    }
    nextEl = nextEl.nextSibling;
    if (nextEl.nodeName === 'BR') {
      index = 0;
      parent = elemt.parentNode;
      while (parent.childNodes[index] !== elemt) {
        index += 1;
      }
      return this._setCaret(parent, index + 1);
    } else {
      return this._setCaret(nextEl, 0);
    }
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
    var deltaDepthAbs, htmlLine, htmlLine$, lineClass, lineDepthAbs, lineDepthAbs_old, lineDepthRel, lineDepthRel_old, lineID, lineID_st, lineNew, lineNext, linePrev, lineType, linesDiv$, txt, _i, _len, _ref;
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
        if (htmlLine.textContent === '') {
          if (htmlLine.firstChild.childNodes.length === 0) {
            txt = document.createTextNode('');
            htmlLine.firstChild.appendChild(txt);
          }
        }
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
        myRange = this.document.createRange();
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
        myRange = this.document.createRange();
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
        myRange = this.document.createRange();
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
        myRange = this.document.createRange();
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


  /**
   * Add html, selection markers and scrollbar positions to the history.
   * No effect if the url popover is displayed
  */


  CNeditor.prototype._addHistory = function() {
    var i, savedScroll, savedSel;
    if (this.isUrlPopoverOn) {
      return;
    }
    if (this._history.index < this.HISTORY_SIZE - 1) {
      i = this.HISTORY_SIZE - 1 - this._history.index;
      while (i--) {
        this._history.historySelect.pop();
        this._history.historyScroll.pop();
        this._history.historyPos.pop();
        this._history.history.pop();
        this._history.historySelect.unshift(void 0);
        this._history.historyScroll.unshift(void 0);
        this._history.historyPos.unshift(void 0);
        this._history.history.unshift(void 0);
      }
    }
    savedSel = this.saveEditorSelection();
    this._history.historySelect.push(savedSel);
    savedScroll = {
      xcoord: this.linesDiv.scrollTop,
      ycoord: this.linesDiv.scrollLeft
    };
    this._history.historyScroll.push(savedScroll);
    this._history.historyPos.push(this.newPosition);
    this._history.history.push(this.linesDiv.innerHTML);
    this._history.index = this.HISTORY_SIZE - 1;
    this._history.historySelect.shift();
    this._history.historyScroll.shift();
    this._history.historyPos.shift();
    return this._history.history.shift();
  };

  CNeditor.prototype._initHistory = function() {
    var HISTORY_SIZE, h;
    HISTORY_SIZE = this.HISTORY_SIZE;
    h = this._history;
    h.history = new Array(HISTORY_SIZE);
    h.historySelect = new Array(HISTORY_SIZE);
    h.historyScroll = new Array(HISTORY_SIZE);
    h.historyPos = new Array(HISTORY_SIZE);
    return this._addHistory();
  };

  CNeditor.prototype._removeLastHistoryStep = function() {
    this._history.historySelect.pop();
    this._history.historyScroll.pop();
    this._history.historyPos.pop();
    this._history.history.pop();
    this._history.historySelect.unshift(void 0);
    this._history.historyScroll.unshift(void 0);
    this._history.historyPos.unshift(void 0);
    this._history.history.unshift(void 0);
    return this._history.index = this.HISTORY_SIZE - 1;
  };

  /* ------------------------------------------------------------------------
  #  undoPossible
  # Return true only if unDo can be called
  */


  CNeditor.prototype.undoPossible = function() {
    var i;
    i = this._history.index;
    return i >= 0 && this._history.historyPos[i] !== void 0;
  };

  /* -------------------------------------------------------------------------
  #  redoPossible
  # Return true only if reDo can be called
  */


  CNeditor.prototype.redoPossible = function() {
    return this._history.index < this._history.history.length - 2;
  };

  /**------------------------------------------------------------------------
   * Undo the previous action
  */


  CNeditor.prototype.unDo = function() {
    if (this.undoPossible() && this.isEnabled) {
      return this._forceUndo();
    }
  };

  CNeditor.prototype._forceUndo = function() {
    var savedScroll, savedSel, stepIndex;
    if (this._history.index === this._history.history.length - 1) {
      this._addHistory();
      this._history.index -= 1;
    }
    stepIndex = this._history.index;
    this.newPosition = this._history.historyPos[stepIndex];
    if (this.isUrlPopoverOn) {
      this._cancelUrlPopover(false);
    }
    this.linesDiv.innerHTML = this._history.history[stepIndex];
    savedSel = this._history.historySelect[stepIndex];
    if (savedSel) {
      this.deSerializeSelection(savedSel);
    }
    savedScroll = this._history.historyScroll[stepIndex];
    this.linesDiv.scrollTop = savedScroll.xcoord;
    this.linesDiv.scrollLeft = savedScroll.ycoord;
    this._readHtml();
    return this._history.index -= 1;
  };

  /* ------------------------------------------------------------------------
  #  reDo :
  # Redo a undo-ed action
  */


  CNeditor.prototype.reDo = function() {
    var i, index, savedSel, xcoord, ycoord;
    if (this.redoPossible() && this.isEnabled) {
      index = (this._history.index += 1);
      i = index + 1;
      this.newPosition = this._history.historyPos[i];
      if (this.isUrlPopoverOn) {
        this._cancelUrlPopover(false);
      }
      this.linesDiv.innerHTML = this._history.history[i];
      savedSel = this._history.historySelect[i];
      if (savedSel) {
        this.deSerializeSelection(savedSel);
      }
      xcoord = this._history.historyScroll[i].xcoord;
      ycoord = this._history.historyScroll[i].ycoord;
      this.linesDiv.scrollTop = xcoord;
      this.linesDiv.scrollLeft = ycoord;
      return this._readHtml();
    }
  };

  /**
   * A utility fuction for debugging
   * @param  {string} txt A text to print in front of the log
  */


  CNeditor.prototype.__printHistory = function(txt) {
    var arrow, content, i, step, _i, _len, _ref;
    if (!txt) {
      txt = '';
    }
    console.log(txt + ' _history.index : ' + this._history.index);
    _ref = this._history.history;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      step = _ref[i];
      if (this._history.index === i) {
        arrow = ' <---';
      } else {
        arrow = ' ';
        content = $(step).text();
        if (content === '') {
          content = '_';
        }
      }
      console.log(i, content, this._history.historySelect[i], arrow);
    }
    return true;
  };

  /**
   * Deserialize a range and return it.
   * @param  {String} serial   A string corresponding to a serialized range.
   * @param  {element} rootNode The root node used for the serialization
   * @return {range}          The expected range
  */


  CNeditor.prototype.deSerializeRange = function(serial, rootNode) {
    var endCont, endPath, i, offset, parentCont, range, serials, startCont, startPath;
    if (!rootNode) {
      rootNode = this.linesDiv;
    }
    range = rootNode.ownerDocument.createRange();
    serials = serial.split(',');
    startPath = serials[0].split('/');
    endPath = serials[1].split('/');
    startCont = rootNode;
    i = startPath.length;
    while (--i) {
      parentCont = startCont;
      startCont = startCont.childNodes[startPath[i]];
    }
    offset = parseInt(startPath[i], 10);
    if (!startCont && offset === 0) {
      startCont = document.createTextNode('');
      parentCont.appendChild(startCont);
    }
    range.setStart(startCont, offset);
    endCont = rootNode;
    i = endPath.length;
    while (--i) {
      parentCont = endCont;
      endCont = endCont.childNodes[endPath[i]];
    }
    offset = parseInt(endPath[i], 10);
    if (!endCont && offset === 0) {
      endCont = document.createTextNode('');
      parentCont.appendChild(endCont);
    }
    range.setEnd(endCont, offset);
    return range;
  };

  /**
   * Serialize a range. 
   * The breakpoint are 2 strings separated by a comma.
   * Structure of a serialized bp : {offset}{/index}*
   * Global struct : {startOffset}{/index}*,{endOffset}{/index}*
   * @param  {Range} range    The range to serialize
   * @param  {element} rootNode [optional] the root used for serialization.
   *                            If none, we use the body of the ownerDocument
   *                            of range.startContainer
   * @return {String}          The string, exemple : "10/0/2/1,3/1", or false
   *                           if the rootNode is not a parent of one of the 
   *                           range's break point.
  */


  CNeditor.prototype.serializeRange = function(range, rootNode) {
    var i, node, res, sib;
    if (!rootNode) {
      rootNode = this.linesDiv;
    }
    res = range.startOffset;
    node = range.startContainer;
    while (node !== null && node !== rootNode) {
      i = 0;
      sib = node.previousSibling;
      while (sib !== null) {
        i++;
        sib = sib.previousSibling;
      }
      res += '/' + i;
      node = node.parentNode;
    }
    if (node === null) {
      return false;
    }
    res += ',' + range.endOffset;
    node = range.endContainer;
    while (node !== null && node !== rootNode) {
      i = 0;
      sib = node.previousSibling;
      while (sib !== null) {
        i++;
        sib = sib.previousSibling;
      }
      res += '/' + i;
      node = node.parentNode;
    }
    if (node === null) {
      return false;
    }
    return res;
  };

  CNeditor.prototype.serializeSel = function() {
    var s;
    s = this.document.getSelection();
    if (s.rangeCount === 0) {
      return false;
    }
    return this.serializeRange(s.getRangeAt(0));
  };

  CNeditor.prototype.deSerializeSelection = function(serial) {
    var sel;
    sel = this.document.getSelection();
    sel.removeAllRanges();
    return sel.addRange(this.deSerializeRange(serial));
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
    range = this.document.createRange();
    range.selectNodeContents(mySandBox);
    sel = this.getEditorSelection();
    sel.removeAllRanges();
    sel.addRange(range);
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
    clipboardEl.id = 'editor-clipboard';
    this.clipboard$ = $(clipboardEl);
    getOffTheScreen = {
      left: -300
    };
    this.clipboard$.offset(getOffTheScreen);
    this.clipboard$.prependTo(this.editorBody$);
    this.clipboard = this.clipboard$[0];
    clipboardEl.style.setProperty('width', '10px');
    clipboardEl.style.setProperty('height', '10px');
    clipboardEl.style.setProperty('position', 'fixed');
    clipboardEl.style.setProperty('overflow', 'hidden');
    return clipboardEl;
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

  /**
   * Called when the browser has pasted data in the clipboard div. 
   * Its role is to insert the content of the clipboard into the editor.
  */


  CNeditor.prototype._processPaste = function() {
    var absDepth, bp, br, childNodes, currSel, currentDelta, currentLineFrag, deltaInserted, domWalkContext, dummyLine, endLine, endTargetLineFrag, firstAddedLine, frag, htmlStr, l, lastAdded, lastAddedDepth, lastFragLine, lineElements, lineNextStartLine, n, parendDiv, range, sandbox, secondAddedLine, segToInsert, startLine, startLineDepth, startOffset, targetNode, _i, _j, _len;
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

    targetNode = currSel.theoricalRange.startContainer;
    startOffset = currSel.theoricalRange.startOffset;
    bp = {
      cont: targetNode,
      offset: startOffset
    };
    if (frag.childNodes.length > 0) {
      lineElements = Array.prototype.slice.call(frag.firstChild.childNodes);
      lineElements.pop();
    } else {
      lineElements = [frag];
    }
    for (_i = 0, _len = lineElements.length; _i < _len; _i++) {
      segToInsert = lineElements[_i];
      this._insertSegment(segToInsert, bp);
    }
    if (bp.cont.nodeName !== '#text') {
      bp = selection.normalizeBP(bp.cont, bp.offset, true);
    }
    this._fusionSimilarSegments(startLine.line$[0], [bp]);
    targetNode = bp.cont;
    startOffset = bp.offset;
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
      lastFragLine = frag.lastChild;
      br = lastFragLine.lastChild;
      n = lastFragLine.childNodes.length - 1;
      bp = selection.normalizeBP(lastFragLine, n);
      childNodes = endTargetLineFrag.childNodes;
      l = childNodes.length;
      for (n = _j = 1; _j <= l; n = _j += 1) {
        lastFragLine.insertBefore(childNodes[0], br);
      }
      this._fusionSimilarSegments(lastFragLine, [bp]);
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
     * 8- Adapt lines type.
    */

    lastAdded = domWalkContext.lastAddedLine;
    if (lastAdded.lineNext) {
      lastAddedDepth = lastAdded.lineDepthAbs;
      startLineDepth = startLine.lineDepthAbs;
      deltaInserted = startLineDepth - lastAddedDepth;
      currentDelta = lastAdded.lineNext.lineDepthAbs - lastAddedDepth;
      this._adaptDepth(domWalkContext.lastAddedLine, deltaInserted, currentDelta, lastAddedDepth);
      this._adaptType(currSel.startLine);
    }
    /**
     * 9- position caret
    */

    return bp = this._setCaret(bp.cont, bp.offset);
  };

  /**
   * Insert segment at the position of the breakpoint. 
   * /!\ The bp is updated but not normalized. The break point will between 2
   * segments if the insertion splits a segment in two. This is normal. If you
   * want to have a break point normalized (ie in a text node), then you have
   * to do it afterwards. 
   * /!\ If the inserted segment should be fusionned with its similar sibling,
   * you have to run _fusionSimilarSegments() over the whole line after the
   * insertion.
   * @param  {element} segment The segment to insert
   * @param  {Object} bp      {cont, offset} resp. the container and offset of
   *                          the breakpoint where to insert segment. The
   *                          breakpoint must be in a segment, ie cont or one
   *                          of its parent must be a segment.
  */


  CNeditor.prototype._insertSegment = function(newSeg, bp) {
    var targetNode, targetSeg;
    targetNode = bp.cont;
    targetSeg = selection.getSegment(targetNode);
    if (targetSeg.nodeName === 'DIV') {
      targetSeg.insertBefore(newSeg, targetSeg.children[bp.offset]);
      bp.offset++;
    } else if (newSeg.nodeName === 'SPAN') {
      if (targetSeg.nodeName === 'A' || this._haveSameMeta(targetSeg, newSeg)) {
        this._insertTextInSegment(newSeg.textContent, bp, targetSeg);
      } else {
        this._splitAndInsertSegment(newSeg, bp, targetSeg);
      }
    } else if (this._haveSameMeta(targetSeg, newSeg)) {
      this._insertTextInSegment(newSeg.textContent, bp, targetSeg);
    } else {
      this._splitAndInsertSegment(newSeg, bp, targetSeg);
    }
    return true;
  };

  CNeditor.prototype._insertTextInSegment = function(txt, bp, targetSeg) {
    var newText, offset, targetText;
    if (txt === '') {
      return true;
    }
    if (!targetSeg) {
      targetSeg = selection.getSegment(bp.cont);
    }
    targetText = targetSeg.textContent;
    offset = bp.offset;
    newText = targetText.substr(0, offset);
    newText += txt;
    newText += targetText.substr(offset);
    targetSeg.textContent = newText;
    offset += txt.length;
    bp.cont = targetSeg.firstChild;
    bp.offset = offset;
    return true;
  };

  CNeditor.prototype._splitAndInsertSegment = function(newSegment, bp, targetSeg) {
    var children, frag, i, rg;
    if (!targetSeg) {
      targetSeg = selection.getSegment(bp.cont);
    }
    rg = document.createRange();
    rg.setStart(bp.cont, bp.offset);
    rg.setEndAfter(targetSeg);
    frag = rg.extractContents();
    frag.insertBefore(newSegment, frag.firstChild);
    targetSeg.parentNode.insertBefore(frag, targetSeg.nextSibling);
    bp.cont = targetSeg.parentNode;
    i = 0;
    children = bp.cont.childNodes;
    while (children[i] !== targetSeg) {
      i++;
    }
    return bp.offset = i + 2;
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
   *                          using the editor context (faster and better 
   *                          isolation)
  */


  CNeditor.prototype.__domWalk = function(nodeToParse, context) {
    var aNode, absDepth, child, clas, classes, deltaHxLevel, lastInsertedEl, newClass, prevHxLevel, spanEl, spanNode, txtNode, _i, _j, _len, _len1, _ref, _ref1;
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
            classes = child.classList;
            newClass = '';
            for (_j = 0, _len1 = classes.length; _j < _len1; _j++) {
              clas = classes[_j];
              if (clas.slice(0, 3) === 'CNE') {
                newClass += ' ' + clas;
              }
            }
            spanNode.className = newClass;
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
    var deltaDepth, elemtFrag, i, lineClass, lineDepthAbs, n, p, seg, span;
    lineClass = elemt.className.split('-');
    lineDepthAbs = +lineClass[1];
    lineClass = lineClass[0];
    if (!context.prevCNLineAbsDepth) {
      context.prevCNLineAbsDepth = lineDepthAbs;
    }
    deltaDepth = lineDepthAbs - context.prevCNLineAbsDepth;
    if (deltaDepth > 0) {
      context.absDepth += 1;
    } else {
      context.absDepth += deltaDepth;
      context.absDepth = Math.max(1, context.absDepth);
    }
    context.prevCNLineAbsDepth = lineDepthAbs;
    elemtFrag = document.createDocumentFragment();
    n = elemt.childNodes.length;
    i = 0;
    while (i < n) {
      seg = elemt.childNodes[0];
      if (seg.nodeName === '#text') {
        span = document.createElement('SPAN');
        span.appendChild(seg);
        elemtFrag.appendChild(span);
      } else {
        elemtFrag.appendChild(seg);
      }
      i++;
    }
    p = {
      sourceLine: context.lastAddedLine,
      fragment: elemtFrag,
      targetLineType: lineClass,
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
