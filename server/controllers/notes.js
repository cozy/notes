// Generated by CoffeeScript 1.10.0
var Note, async, handleErr;

async = require('async');

Note = require('../models/note');


/*--------------------------------------#
 * Helpers
 */

handleErr = function(res, msg, code) {
  if (msg == null) {
    msg = 'An error occured';
  }
  if (code == null) {
    code = 500;
  }
  console.log(msg.stack || msg);
  return res.status(code).send({
    error: msg.message || msg
  });
};


/*
 * Grab note corresponding to id given in url before
 * update, destroy or show actions
 */

module.exports.fetch = function(req, res, next, id) {
  return Note.find(id, function(err, note) {
    if (err) {
      return handleErr(res, err);
    }
    if (note === null) {
      return handleErr(res, 'Note not found', 404);
    }
    req.note = note;
    return next();
  });
};


/*--------------------------------------#
 * Actions
 */


/*
 * Return all notes
 */

module.exports.all = function(req, res) {
  return Note.all(function(err, notes) {
    if (err) {
      return res.status(500).send({
        error: "Retrieve notes failed"
      });
    }
    return res.send({
      length: notes.length,
      rows: notes
    });
  });
};


/*
 * Return a note
 */

module.exports.show = function(req, res) {
  return res.status(200).send(req.note);
};


/*
 * Create a new note from data given in the body of request
 * params : post object :
 *               { title : "the title, mandatory",
 *                 parent_id : "the parent note, mandatory, null if root"}
 *          Other attributes of a note are optionnal (content, tags)
 */

module.exports.create = function(req, res) {
  var body, doCreate;
  body = req.body;
  doCreate = function(data) {
    return Note.create(data, function(err, note) {
      if (err) {
        return handleErr(res, err);
      }
      return note.index(["title", "content"], function(err) {
        if (err) {
          console.log('Indexing error', err);
        }
        return res.status(201).send(note);
      });
    });
  };
  if (body.parent_id === 'tree-node-all') {
    body.path = [body.title];
    return doCreate(body);
  } else {
    return Note.find(body.parent_id, function(err, parent) {
      body.path = parent.path.slice(0);
      body.path.push(body.title);
      return doCreate(body);
    });
  }
};


/*
 * Update the note and tree in case of :
 *   change of the title
 *   change of the parent_id (move in the tree)
 *   change of the content
 */

module.exports.update = function(req, res) {
  var body, changedContent, changedParent, changedTitle, hasChanged, ops;
  body = req.body;
  hasChanged = function(body, note, attr) {
    return body[attr] && (body[attr] !== note[attr]);
  };
  changedTitle = hasChanged(body, req.note, 'title');
  changedParent = hasChanged(body, req.note, 'parent_id');
  changedContent = hasChanged(body, req.note, 'content');
  ops = [];
  if (changedTitle || changedParent) {
    ops.push(function(cb) {
      return req.note.moveOrRename(body.title, body.parent_id, function(err, newPath) {
        body.path = newPath;
        return cb(err);
      });
    });
  }
  ops.push(function(cb) {
    body.lastModificationValueOf = (new Date()).getTime();
    return req.note.updateAttributes(body, cb);
  });
  if (changedTitle || changedContent) {
    ops.push(function(cb) {
      return req.note.index(["title", "content"], function(err) {
        console.log(err);
        return cb();
      });
    });
  }
  return async.series(ops, function(err) {
    if (err) {
      return handleErr(res, err);
    }
    return res.status(200).send({
      success: 'Note updated'
    });
  });
};

module.exports.destroy = function(req, res) {
  return req.note.destroyWithChildren(function(err) {
    if (err) {
      return handleErr(res, err);
    }
    return res.status(204).send({
      success: 'Note succesfuly deleted'
    });
  });
};


/*
## Perform a search for given query inside Cozy search engine.
 */

module.exports.search = function(req, res) {
  if (req.body.query == null) {
    return handleErr(res, "wrong request format", 400);
  }
  return Note.search(req.body.query, function(err, notes) {
    if (err) {
      return handleErr(res, err);
    }
    return res.send(notes);
  });
};


/*
 * Return 10 more recents notes
 */

module.exports.latest = function(req, res) {
  var query;
  query = {
    descending: true,
    limit: 10
  };
  return Note.request('lastmodified', query, function(err, notes) {
    if (err) {
      return handleErr(res, err);
    }
    return res.send(notes);
  });
};


/*
 * return the tree of all notes
 */

module.exports.tree = function(req, res) {
  return Note.tree(function(err, tree) {
    if (err) {
      return handleErr(res, err);
    }
    return res.send(JSON.stringify(tree));
  });
};


/*
## Attach a file to given note.
 */

module.exports.addFile = function(req, res) {
  var file;
  file = req.files["qqfile"] || req.files["file"];
  if (file == null) {
    return handleErr(res, "no files", 400);
  }
  return req.note.attachFile(file.path, {
    name: file.name
  }, function(err) {
    return res.status(200).send({
      success: true,
      msg: "Upload succeeds"
    });
  });
};


/*
## Send corresponding to given name for given note.
 */

module.exports.getFile = function(req, res) {
  var name;
  name = req.params.name;
  return req.note.getFile(name, function(err, resp, body) {
    if ((resp != null ? resp.statusCode : void 0) === 404) {
      return handleErr(res, 'File not found', 404);
    }
    if ((resp == null) || resp.statusCode !== 200) {
      return handleErr(res);
    }
    return res.status(200);
  }).pipe(res);
};


/*
## Delete corresponding to given name for given note.
 */

module.exports.delFile = function(req, res) {
  var name;
  name = req.params.name;
  return req.note.removeFile(name, function(err, body) {
    if (err) {
      return handleErr(res, err);
    }
    return res.status(200).send({
      succes: true,
      msg: 'File deleted'
    });
  });
};
