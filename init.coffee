server = require './server'
async = require "async"

DataTree = require("./common/data-tree").DataTree

## Small script to intialize finalNote of available applications.

note = new Note
    title: "Tutorial"
    path: "[\"Tutorial\"]"
    content: """
# What is Cozy Notes ?

Cozy Notes is a simple yet powerful note manager. You structure efficiently your notes by easily toggling between titles and bullet points, formatting becomes incredibly fast. You also can search and attach files to your notes. 

# Navigation

Your notes can be organized following a tree structure. To create a “daughter” note simply hover over a note and press the “+” button. You can also alternate the tree structure by dragging and dropping notes in the tree. The “pencil” button allows you to rename the note while the “x” lets you delete it.

To attach a file, simply click the paper clip in the top right corner.

# Formating your text:

* When you create a note, by default you are writing bullet points.
* Indenting a bullet point line makes it successively a classic paragraph, then a sub-level bullet. You can similarly un-indent.
* You can indent successively a selection of several lines to implement a decreasing-level bullet point list. 
* Titles are created using the "change selection to title" button. This action makes every line of similar indent level a title within the same sub-section (under the previous title).
* Indenting a title line makes it successively a simple text and a title of a different level. 
* No line can be indented more than one level than the previous one.

That covers pretty much it. Once used to it, I bet you will no longer want to use any other note editor ;-)

# Keyboard shortcuts

* Tab = indent
* Shift + Tab = un-indent

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
