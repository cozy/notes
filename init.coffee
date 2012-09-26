server = require './server'
async = require "async"

DataTree = require("./common/data-tree").DataTree

## Small script to intialize finalNote of available applications.

note = new Note
    title: "Tutorial"
    path: ["Tutorial"]
    content: """
# Nav Buttons
+ plus button will create a new note as children of currenlty selected note 
+ x button will delete currenlty selected note 
+ pencil button will let you rename currenlty selected note 
# Text structure
+ You can write bullet point paragraph (default)
+ You can write classic paragraph (indent backward)
+ You can write titles (indent forward)
+ There is the notion of level, levels are represented by identations.
+ Lines at one level are all bullet points or all titles, they can't be both.
+ Just type enter to add a new bullet point, a new line or a new title  of wich level of identation you set.
# Note Buttons
+ First button on the left indents backward
+ Second button indents forward
+ Third button makes your current level becomes bullet points
+ Fourth button makes your current level becomes titles
+ Fifth button saves your note
# Keyboard shortcuts
+ Tab makes your bullet points becoming titles, your title becoming natural paragraph and your natural paragrahp becoming bullet points.
+ Shift + tab makes the opposite.
    """


Note.create note, (err, finalNote) ->
    if err
        console.log err
        console.log "Initialization failed (can't save todo-finalNote)"
        process.exit(0)

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

