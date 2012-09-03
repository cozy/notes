should = require('should')
async = require('async')
Client = require('../common/test/client').Client
app = require('../server')
helpers = require("./helpers")

DataTree = require("../lib/data-tree").DataTree #TODO BJA : vérifier utilité


client = new Client("http://localhost:8888/")

note1 = note2 = note3 = note4 = null


#helpers 

createNoteFunction = (title, parentNote_id, content, creationCbk) ->
    (syncCallback) ->
        noteData =
            title     : title
            content   : content
            parent_id : parentNote_id

        client.post "notes/", noteData, (error, response, body) ->
            creationCbk(body)
            syncCallback()

describe "/notes", ->

    before (done) ->
        app.listen(8888)
        helpers.cleanDb done

    after (done) ->
        app.close()
        #helpers.cleanDb done
        done()

    describe "- POST -", ->

        describe "Creation of several notes", ->

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
                client.get "tree/", (error, response, body) ->
                    response.statusCode.should.equal 200
                    tree=JSON.parse(body)
                    tree.data.should.equal "All"
                    tree.children[0].data.should.equal "Recipe"
                    tree.children[1].data.should.equal "Todo"
                    tree.children[0].children[0].data.should.equal "Dessert"                    
                    tree.children[0].attr.id.should.equal note1.id
                    tree.children[1].attr.id.should.equal note2.id
                    tree.children[0].children[0].attr.id.should.equal note3.id
                    done()


    describe "- GET -", ->
        it "should get back all the notes", (done)->
            client.get "notes/", (error, response, body) ->
                response.statusCode.should.equal 200
                notes = JSON.parse(body)
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
                debugger;
                n1.path.should.equal note1.path
                # notes.rows[0].humanPath.should.equal "All,Recipe"
                # @recipeNote = notes.rows[0]
                done()

# describe "/note/:id", ->
#     describe "- GET -", ->
#         it "should get on note", (done)->
#             client.get "notes/#{note1.id}", (error, response, body) =>
#                 console.log 'grgrgrgrgrgrgrgrgrgrgrgrgr'
#                 debugger;
#                 console.log response
#                 should.equal 0,0
#                 done()