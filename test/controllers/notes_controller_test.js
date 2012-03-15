require('../test_helper.js').controller('notes', module.exports);

var sinon  = require('sinon');

function ValidAttributes () {
    return {
        title: '',
        content: '',
        createdAt: ''
    };
}

exports['notes controller'] = {

    'GET new': function (test) {
        test.get('/notes/new', function () {
            test.success();
            test.render('new');
            test.render('form.' + app.set('view engine'));
            test.done();
        });
    },

    'GET index': function (test) {
        test.get('/notes', function () {
            test.success();
            test.render('index');
            test.done();
        });
    },

    'GET edit': function (test) {
        var find = Note.find;
        Note.find = sinon.spy(function (id, callback) {
            callback(null, new Note);
        });
        test.get('/notes/42/edit', function () {
            test.ok(Note.find.calledWith('42'));
            Note.find = find;
            test.success();
            test.render('edit');
            test.done();
        });
    },

    'GET show': function (test) {
        var find = Note.find;
        Note.find = sinon.spy(function (id, callback) {
            callback(null, new Note);
        });
        test.get('/notes/42', function (req, res) {
            test.ok(Note.find.calledWith('42'));
            Note.find = find;
            test.success();
            test.render('show');
            test.done();
        });
    },

    'POST create': function (test) {
        var note = new ValidAttributes;
        var create = Note.create;
        Note.create = sinon.spy(function (data, callback) {
            test.strictEqual(data, note);
            callback(null, note);
        });
        test.post('/notes', {Note: note}, function () {
            test.redirect('/notes');
            test.flash('info');
            test.done();
        });
    },

    'POST create fail': function (test) {
        var note = new ValidAttributes;
        var create = Note.create;
        Note.create = sinon.spy(function (data, callback) {
            test.strictEqual(data, note);
            callback(new Error, null);
        });
        test.post('/notes', {Note: note}, function () {
            test.success();
            test.render('new');
            test.flash('error');
            test.done();
        });
    },

    'PUT update': function (test) {
        Note.find = sinon.spy(function (id, callback) {
            test.equal(id, 1);
            callback(null, {id: 1, updateAttributes: function (data, cb) { cb(null); }});
        });
        test.put('/notes/1', new ValidAttributes, function () {
            test.redirect('/notes/1');
            test.flash('info');
            test.done();
        });
    },

    'PUT update fail': function (test) {
        Note.find = sinon.spy(function (id, callback) {
            test.equal(id, 1);
            callback(null, {id: 1, updateAttributes: function (data, cb) { cb(new Error); }});
        });
        test.put('/notes/1', new ValidAttributes, function () {
            test.success();
            test.render('edit');
            test.flash('error');
            test.done();
        });
    },

    'DELETE destroy': function (test) {
        test.done();
    },

    'DELETE destroy fail': function (test) {
        test.done();
    }
};

