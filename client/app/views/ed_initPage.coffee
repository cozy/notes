{beautify} = require 'views/ed_beautify'
CNEditor = require('views/ed_editor').CNEditor

# attributes of the class
editorBody$  = undefined # body of iframe
editor_head$ = undefined # head of iframe
editor_css$  = undefined # ref to the stylesheet element
# boolean, true if the classe of the line
# is automatically added at the beginning of the line.
editor_doAddClasseToLines = undefined

exports.initPage =  (selector)->
    $(selector).html require('./templates/editor')
    editorIframe$ = $("#{selector} iframe")

    # callback to execute after editor's initialization
    # the contexte (this) inside the function is the editor
    
    cb = () ->
        this.replaceContent( require('./templates/content-empty') )
        # buttons init, beautify actions
        editorCtrler = this
        editorBody$  = this.editorBody$
               
        beautify(editorBody$)
               
        editorBody$.on 'keyup' , ->
            beautify(editorBody$)

        # Buttons for the editor
        $("#indentBtn").on "click", () ->
            editorCtrler.tab()
        $("#unIndentBtn").on "click", () ->
            editorCtrler.shiftTab()
        $("#markerListBtn").on "click", () ->
            editorCtrler.markerList()
        $("#titleBtn").on "click", () ->
            editorCtrler.titleList()

        # display whether the user has moved the carret with keyboard or mouse.
        this.editorBody$.on 'mouseup' , () =>
            this.newPosition = true

        # automatic summary
        this.editorBody$.on 'mouseup', () =>
            this.buildSummary()
        this.editorBody$.on 'keyup', () =>
            this.buildSummary()
    # creation of the editor
    editor = new CNEditor( $('#editorIframe')[0], cb )
    return editor
