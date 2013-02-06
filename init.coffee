server = require './server'
async = require "async"

DataTree = require("./common/data-tree").DataTree

## Small script to intialize finalNote of available applications.

note = new Note
    title: "Tutorial"
    path: "[\"Tutorial\"]"
    content: """
# Navigation Buttons

* plus button will create a new note as a child of currenlty selected note.
* x button will delete currenlty selected note.
* pencil button will allow you to rename currently selected note.

# Text structure

* You can write bullet point paragraph (default).
* You can write classic paragraph (indent backward).
* You can write titles (indent forward).
* There is the notion of level, levels are represented by identations.
* Lines at one level are all bullet points or all titles, they can't be both.
* Just type enter to add a new bullet point, a new line or a new title  of wich level of identation you set.

# Note Buttons

* First button on the left indents backward.
* Second button indents forward.
* Third button makes your current level becomes bullet points.
* Fourth button makes your current level becomes titles.
* Fifth button saves your note.
* The trombon on the upper-right is there for file attachment, just click on it to attach a file to your note.

# Keyboard shortcuts

* Tab makes your bullet points becoming titles, your title becoming natural paragraph and your natural paragraph becoming bullet points.
* Shift + tab makes the opposite.

# Search field

* Type keywords in search field, it will perform a double search:
    * One in the tree, focusing on titles
    * One in your index to extract all note relevant to your search.
"""

Note.create note, (err, finalNote) ->
    if err
        console.log err
        console.log "Initialization failed (can't save note)"
        process.exit 0

    finalNote.index ["title", "content"], (err) ->
        Tree.getOrCreate (err, tree) ->
            if err
                console.log err
                console.log "Initialization failed (cannot update tree)"
                process.exit(0)
            dataTree = new DataTree tree.struct
            dataTree.addNode finalNote

            tree.updateAttributes struct: dataTree.toJson(), (err) ->
                console.log "Initialization succeeds."
                process.exit(0)
