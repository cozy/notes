americano = require 'americano'
should = require 'should'
async = require 'async'
fs = require 'fs'
helpers = require './helpers'

Client = require('request-json').JsonClient
client = new Client "http://localhost:8888/"

describe 'LINKED MODELS', ->

    before (done) ->
        @timeout 5000
        americano.start
            name: 'Notes'
            port: 8888
            root: __dirname + '/..'
        , (app, server) =>
            @server = server
            helpers.cleanDB done

    after (done) ->
        @server.close()
        helpers.cleanDB done


    ###
    # TESTS
    ###


    describe "/tasks", ->

        taskid = null

        it "should create 3 tasks", (done) ->
            async.eachSeries [1..3], (idx, callback) ->
                task =
                     description: "task#{idx}"
                client.post '/tasks', task, (err, resp, task) ->
                    resp.statusCode.should.eql 201

                    taskid = task.id
                    callback err
            , done

        it "should have saved do db", (done) ->
            client.get "/tasks", (err, resp, tasks) ->
                tasks.length.should.eql 3
                done()

        it "should allow update", (done) ->
            updates =
                description: "task - modified"
            client.put "/tasks/#{taskid}", updates, (err, resp, task) ->
                resp.statusCode.should.eql 200
                done()

        it "should have modified server-side", (done) ->
            client.get "/tasks/#{taskid}", (err, resp, task) ->
                task.description.should.eql "task - modified"
                done()

        it "should allow deletion", (done) ->
            client.del "/tasks/#{taskid}", (err, resp, task) ->
                resp.statusCode.should.eql 204
                done()

        it "should not be gettable after deletion", (done) ->
            client.get "/tasks/#{taskid}", (err, resp, task) ->
                resp.statusCode.should.eql 404
                done()

    describe "/contacts", ->

        before helpers.createThreeContacts

        contactid = null

        it "should allow list query", (done) ->
            client.get "/contacts", (err, resp, contacts) ->
                contacts.length.should.eql 3
                contactid = contacts[0].id
                done()

        it "should allow read query", (done) ->
            client.get "/contacts/#{contactid}", (err, resp, contact) ->
                resp.statusCode.should.eql 200
                contact.id.should.eql contactid
                done()

    describe "/alarms", ->

        alarmid = null

        it "should create 3 alarms", (done) ->
            async.eachSeries [1..3], (idx, callback) ->
                alarm =
                    description: "alarm#{idx}"
                    trigg: "Thu Sep 19 2013 0#{idx}:27:00"
                    related: app: "notes", url: "note/3615/"

                client.post '/alarms', alarm, (err, resp, alarm) ->
                    resp.statusCode.should.eql 201

                    alarmid = alarm.id
                    callback err
            , done

        it "should have saved do db", (done) ->
            client.get "/alarms", (err, resp, alarms) ->
                alarms.length.should.eql 3
                done()

        it "should allow update", (done) ->
            updates =
                description: "alarm - modified"
            client.put "/alarms/#{alarmid}", updates, (err, resp, alarm) ->
                resp.statusCode.should.eql 200
                done()

        it "should have modified server-side", (done) ->
            client.get "/alarms/#{alarmid}", (err, resp, alarm) ->
                alarm.description.should.eql "alarm - modified"
                alarm.related.app.should.eql "notes"
                done()

        it "should allow deletion", (done) ->
            client.del "/alarms/#{alarmid}", (err, resp, alarm) ->
                resp.statusCode.should.eql 204
                done()

        it "should not be gettable after deletion", (done) ->
            client.get "/alarms/#{alarmid}", (err, resp, alarm) ->
                resp.statusCode.should.eql 404
                done()
