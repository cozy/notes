should = require('should')
async = require('async')
Client = require('request-json').JsonClient

request = require('request')
URL = require('url')

app = require('../server')
helpers = require("./helpers")

DataTree = require("../lib/data-tree").DataTree #TODO BJA : vérifier utilité


client = new Client("http://localhost:8888/")

note1 = note2 = note3 = note4 = null

###
# HELPERS 
###

createNoteFunction = (title, parentNote_id, content, creationCbk) ->
    (syncCallback) ->
        noteData =
            title     : title
            content   : content
            parent_id : parentNote_id

        client.post "notes/", noteData, (error, response, body) ->
            creationCbk(body)
            syncCallback()

before (done) ->
    app.listen(8888)
    helpers.cleanDb done

after (done) ->
    app.close()
    # helpers.cleanDb done
    done()

###
# TESTS
###

describe "/notes", ->


    describe "- POST - Creation of several notes", ->

        it "should create 3 notes", (done) ->
            async.series [
                createNoteFunction "Recipe", "all", "\n+ 01\n", (newNote)->
                    note1=newNote
                createNoteFunction "Todo", "all", "\n+ 02\n", (newNote)->
                    note2=newNote
            ], ->
                async.series [
                    createNoteFunction "Dessert", note1.id, "\n+ 03\n", (newNote)->
                        note3=newNote
                ], ->
                    should.exist note1
                    should.exist note2
                    should.exist note3
                    note1.title.should.equal 'Recipe'
                    note2.title.should.equal 'Todo'
                    note3.title.should.equal 'Dessert'
                    should.exist note3.path.length
                    note3.path.should.be.a('object').and.have.property('length')
                    done()

        it "should create the Tree.tree model and a Tree.dataTree", ->
            should.exist Tree.tree
            should.exist Tree.tree.struct
            should.exist Tree.dataTree
            should.exist Tree.dataTree.root
            should.exist Tree.dataTree.nodes
            
        it "should produce an internal tree with root->node1->node3 & root->node2 ", (done)->
            root  = Tree.dataTree.root 
            node1 = Tree.dataTree.nodes[note1.id]
            node2 = Tree.dataTree.nodes[note2.id]
            node3 = Tree.dataTree.nodes[note3.id]
            node1._parent.should.equal root
            node2._parent.should.equal root
            node3._parent.should.equal node1
            root.children[0].should.equal node1
            root.children[1].should.equal node2
            node1.children[0].should.equal node3
            done()

        it 'should store a correct tree', (done)->
            client.get "tree/", (error, response, tree) ->
                response.statusCode.should.equal 200
                tree.data.should.equal "All"
                tree.children[0].data.should.equal "Recipe"
                tree.children[1].data.should.equal "Todo"
                tree.children[0].children[0].data.should.equal "Dessert"                    
                tree.children[0].attr.id.should.equal note1.id
                tree.children[1].attr.id.should.equal note2.id
                tree.children[0].children[0].attr.id.should.equal note3.id
                done()


    describe "- GET -", ->
            
        it "should get back all the notes", (done) ->

            client.get "notes/", (error, response, notes) ->
                response.statusCode.should.equal 200
                notes.rows.length.should.equal 3
                n1 = notes.rows[0]
                n2 = notes.rows[1]
                n3 = notes.rows[2]
                originalNotes={}
                originalNotes[note1.id]=note1
                originalNotes[note2.id]=note2
                originalNotes[note3.id]=note3
                n1.title.should.equal originalNotes[n1.id].title
                n2.title.should.equal originalNotes[n2.id].title
                n3.title.should.equal originalNotes[n3.id].title
                n1.path.should.eql note1.path
                n2.path.should.eql note2.path
                n3.path.should.eql note3.path
                n1.content.should.equal originalNotes[n1.id].content
                n2.content.should.equal originalNotes[n2.id].content
                n3.content.should.equal originalNotes[n3.id].content
                done()


describe "/notes/:id", ->

    describe "GET", ->

        it "should get one note", (done)->

            client.get "notes/#{note3.id}", (error, response, note) =>
                response.statusCode.should.equal 200
                should.exist note.path.length
                note.path.length.should.equal 2
                note.path[0].should.equal 'All'
                note.path[1].should.equal 'Dessert'
                note.title.should.equal "Dessert"
                note.content.should.equal '\n+ 03\n'
                done()

    describe "PUT - update the name", ->
        it "should update the note, the tree", ->
            url = "http://localhost:8888/notes/50478dcbe7ec457204000003"
            console.log "ee"
            console.log url
            # url = URL.parse url
            # console.log "ee"
            # console.log url

            # console.log "client 11111111111111111111"
            # params = 
            #     method: "PUT"
            #     uri: url
            #     json: '{"key1":"val1"}'
            # console.log params
            # debugger;
            # request params, ->
            #     console.log "done ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! ! "


            console.log "\ninitial value of note2"
            console.log note2
            note2.title = "Todo - modified"
            note2.content = "\n+ 03 - modified\n"
            note2.title = "Todo - modified"
            json = JSON.stringify(note2)
            client.put "notes/#{note2.id}", json, (err, resp, note) ->
                console.log "\n\ncccccccccccccccccccccccccccccccccc"
                console.log "\nupdate answer"
                console.log err
                console.log body


#         it "should update the path of the sons of the note", ->
            