{beautify} = require 'views/ed_beautify'
CNEditor = require('views/ed_editor').CNEditor

# Modules de conversion Markdown <--> Cozy
CNcozyToMarkdown = require('views/ed_cozyToMarkdown').CNcozyToMarkdown
CNmarkdownToCozy = require('views/ed_markdownToCozy').CNmarkdownToCozy
cozy2md = new CNcozyToMarkdown()
md2cozy = new CNmarkdownToCozy()

# Module de test automatique
AutoTest = require('views/ed_autoTest').AutoTest
checker = new AutoTest()


# attributes of the class
editorBody$  = undefined # body of iframe
editor_head$ = undefined # head of iframe
editor_css$  = undefined # ref to the stylesheet element
# boolean, true if the classe of the line
# is automatically added at the beginning of the line.
editor_doAddClasseToLines = undefined


exports.initPage =  ()->
    $("#note-area").html require('./templates/editor')
    editorIframe$ = $("iframe")

    # callback to execute after editor's initialization
    # the contexte (this) inside the function is the editor
    cb = () ->
       
        # after load, i don't know why, editorBody$ refers still to a body but a "inactivated" one ??? (light blue in ff console)
        # editor_html$ = $("iframe").contents().find("html")
        # editorBody$  = editor_html$.find("body")
        # editorBody$.parent().attr('id','__ed-iframe-html')
        # editorBody$.attr("contenteditable", "true")
        # editorBody$.attr("id","__ed-iframe-body")
        # editor_head$ = editor_html$.find("head")
        # editor_css$  = editor_head$.html('<link href="stylesheets/app.css" rel="stylesheet">')
        
        # initialisation of the controler
        #edCtrl = editorFactory.create( editorIframe$ )

        ### initialisation of the page
        this.replaceContent( require('./templates/content-full') )
        this.replaceContent( require('./templates/content-empty') )
        this.replaceContent( require('./templates/content-full-marker') )
        this.replaceContent( require('./templates/content-shortlines-marker') )
        ###
        this.replaceContent( require('./templates/content-shortlines-all') )
        
        # buttons init, beautify actions
        editorCtrler = this
        editorBody$  = this.editorBody$

        beautify(editorBody$)
        
        editorBody$.on 'keyup' , ->
            beautify(editorBody$)
            
        $("#resultBtnBar_coller").on  'click' , ->
            beautify(editorBody$)
            
        $("#printRangeBtn").on "click", () ->
            sel = rangy.getIframeSelection(editorCtrler.editorIframe)
            i = 0
            l = sel.rangeCount
            console.log "Printing current ranges"
            while i<l
                console.log "Range N°#{i}"
                range = sel.getRangeAt(i)
                console.log "offsets:  start=#{range.startOffset}  -  end=#{range.endOffset}"
                console.log range.startContainer
                console.log range.endContainer
                i++
                
        # Allows user to load a file in the Cozy format
        $('#contentSelect').on "change" , (e) ->
            console.log "./templates/#{e.currentTarget.value}"
            editorCtrler.replaceContent( require("./templates/#{e.currentTarget.value}") )
            beautify(editorBody$)

        # Allows user to load a style sheet for the page
        $('#cssSelect').on "change" , (e) ->
            editorCtrler.replaceCSS( e.currentTarget.value )

        # Buttons for the editor
        $("#indentBtn").on "click", () ->
            editorCtrler.tab()
        $("#unIndentBtn").on "click", () ->
            editorCtrler.shiftTab()
        $("#markerListBtn").on "click", () ->
            editorCtrler.markerList()
        $("#titleBtn").on "click", () ->
            editorCtrler.titleList()


        #### -------------------------------------------------------------------
        # Special buttons (to be removed later)
        #  > tests the code structure
        $("#checkBtn").on "click", () ->
            checker.checkLines(editorCtrler)
        #  > translate cozy code into markdown and markdown to cozy code
        #    Note: in the markdown code there should be two \n between each line
        $("#markdownBtn").on "click", () ->
            $("#resultText").val(cozy2md.translate $("#resultText").val())
        $("#cozyBtn").on "click", () ->
            $("#resultText").val(md2cozy.translate $("#resultText").val())
        $("#addClass").toggle(
            () ->
                addClassToLines("sel")
            () ->
                removeClassFromLines("sel")
            )
        $("#summaryBtn").on "click", () ->
            editorCtrler.buildSummary()

        #### -------------------------------------------------------------------
        # Returns an object containing every selected line in the iframe
        getSelectedLines = (sel) ->
            myDivs = []             # Array containing each selected DIV
            if sel.rangeCount == 0
                return
            #_For each selected area
            for i in [0..sel.rangeCount-1]
                range = sel.getRangeAt(i)
                #_Case of multiline selection (includes always at least one div)
                divs = range.getNodes([1], (element) -> element.nodeName=='DIV')
                #_If a single DIV is selected
                if divs.length == 0
                    # (bug-counter) the whole body can be "selected"
                    if range.commonAncestorContainer.nodeName != 'BODY'
                        node = range.commonAncestorContainer
                        if node.nodeName != 'DIV'
                            node = $(node).parents("div")[0]
                        divs.push node
                # We fill myDivs with the encountered DIV
                k = 0
                while k < divs.length
                    myDivs.push $(divs[k])
                    k++
            return myDivs

            
        #### -------------------------------------------------------------------
        # Add class at beginning of lines
        addClassToLines = (mode) =>
            sel = rangy.getIframeSelection(this.editorIframe)
            if mode == "sel"
                lines = getSelectedLines(sel)
                k = 0
                while k < lines.length
                    div = lines[k]
                    div.attr('toDisplay', div.attr('class') + '] ')
                    k++
            else
                lines = this._lines
                for lineID of lines
                    div = $ lines[lineID].line$[0]
                    div.attr('toDisplay', div.attr('class') + '] ')

        #### -------------------------------------------------------------------
        # Remove class from beginning of lines
        removeClassFromLines = (mode) =>
            sel = rangy.getIframeSelection(this.editorIframe)
            if mode == "sel"
                lines = getSelectedLines(sel)
                k = 0
                while k < lines.length
                    div = lines[k]
                    div.attr('toDisplay', '')
                    k++
            else
                lines = this._lines
                for lineID of lines
                    div = $ lines[lineID].line$[0]
                    div.attr('toDisplay', '')

        #### -------------------------------------------------------------------
        # (de)activates class auto-display at the beginning of lines
        $("#addClass2LineBtn").on "click", () ->
            addClassToLines()
            if editor_doAddClasseToLines
                $("#addClass2LineBtn").html "Show Class on Lines"
                editor_doAddClasseToLines = false
                editorBody$.off 'keyup' , addClassToLines
                removeClassFromLines()
            else
                $("#addClass2LineBtn").html "Hide Class on Lines"
                editor_doAddClasseToLines = true
                editorBody$.on 'keyup' , addClassToLines
            
        # default behaviour regarding the class at the beginning of the line :
        # comment or uncomment depending default expected behaviour
        # addClassToLines()
        # $("#addClass2LineBtn").html "Hide Class on Lines"
        # editorBody$.on 'keyup', addClassToLines
        # editor_doAddClasseToLines = true

        # display whether the user has moved the carret with keyboard or mouse.
        this.editorBody$.on 'mouseup' , () =>
            this.newPosition = true
            $("#editorPropertiesDisplay").text("newPosition = true")

        # automatic summary
        this.editorBody$.on 'mouseup', () =>
            this.buildSummary()
        this.editorBody$.on 'keyup', () =>
            this.buildSummary()
    # creation of the editor
    editor = new CNEditor( $('#editorIframe')[0], cb )
    return editor
