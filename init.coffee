server = require './server'
async = require "async"
Note  = require './server/models/note'
Tree  = require './server/models/tree'


## Small script to intialize finalNote of available applications.

note = new Note
    title: "Tutorial"
    parent_id: "tree-node-all"
    path: "[\"Tutorial\"]"
    content: """
# What is Cozy Notes ?

Cozy Notes is a simple yet powerful note manager.
It can be used entirely with the keyboard and its original text editor
makes formating incredibly fast.

# Navigation

You organize your notes following a tree structure.
* To create a top level note, click the "+" button in the left panet on the
right side of "My notes" logo
* To create a sub level note, hover the mouse on an existing note and press
the "+" button

# Layout

You can structure your notes with two actions.
* Toggle between titles and bullet points pressing Alt + A or clicking
"T" button
* Indent and un-indent lines pressing Tab and Shift + Tab or using the buttons

# Tools

* Add in text links pressing Ctrl + K or using the button
* Attach files to a note by clicking the paper clip
* Search your notes using the top left input box

# Tips

* Lines of similar indent level are either titles or bullet point
* You can implement a list of decreasing indent level
    * like this one
		* by indenting a selection of lines

"""

Note.create note, (err, finalNote) ->
    if err
        console.log err
        console.log "Initialization failed (can't save note)"
        process.exit 0

    finalNote.index ["title", "content"], (err) ->
        if err
            console.log err
            console.log "Initialization failed (can't index note)"
        else
            console.log "Done creating tutorial"
        process.exit 0

