
### ------------------------------------------------------------------------
# CLASS FOR THE COZY NOTE EDITOR
#
# usage : 
#
# newEditor = new CNEditor( iframeTarget,callBack )
#   iframeTarget = iframe where the editor will be nested
#   callBack     = launched when editor ready, the context 
#                  is set to the editorCtrl (callBack.call(this))
# properties & methods :
#   replaceContent    : (htmlContent) ->  # TODO: replace with markdown
#   _keyPressListener : (e) =>
#   _insertLineAfter  : (param) ->
#   _insertLineBefore : (param) ->
#   
#   editorIframe      : the iframe element where is nested the editor
#   editorBody$       : the jquery pointer on the body of the iframe
#   _lines            : {} an objet, each property refers a line
#   _highestId        : 
#   _firstLine        : pointes the first line : TODO : not taken into account 
###
class exports.CNEditor extends Backbone.View

    ###
    #   Constructor : newEditor = new CNEditor( iframeTarget,callBack )
    #       iframeTarget = iframe where the editor will be nested
    #       callBack     = launched when editor ready, the context 
    #                      is set to the editorCtrl (callBack.call(this))
    ###
    constructor : (iframeTarget,callBack) ->
        #iframe$ = $('<iframe style="width:50%;height:100%"></iframe>').appendTo(iframeTarget)
        #iframe$ = $(iframeTarget).replaceWith('<iframe  style="width:50%;height:100%"></iframe>')
        iframe$ = $(iframeTarget)
        iframe$.on 'load', () =>
            # 1- preparation of the iframe
            editor_html$ = iframe$.contents().find("html")
            editorBody$  = editor_html$.find("body")
            editorBody$.parent().attr('id','__ed-iframe-html')
            editorBody$.attr("contenteditable", "true")
            editorBody$.attr("id","__ed-iframe-body")
            editor_head$ = editor_html$.find("head")
            editor_css$  = editor_head$.html('<link href="stylesheets/app.css" 
                                               rel="stylesheet">')
            # 2- set the properties of the editor
            @editorBody$   = editorBody$
            console.log @editorBody$
            @editorIframe  = iframe$[0]
            @_lines        = {}
            @_highestId    = 0
            @_deepest      = 1
            @_firstLine    = null
            # 3- initialize event listeners
            editorBody$.prop( '__editorCtl', this)
            editorBody$.on 'keypress' , @_keyPressListener
            # 4- return a ref to the editor's controler
            callBack.call(this)
            return this

    ### ------------------------------------------------------------------------
    # Find the maximal deep (thus the deepest line) of the text
    # TODO: improve it so it only calculates the new depth from the modified
    #       lines (not all of them)
    # TODO: set a class system rather than multiple CSS files. Thus titles
    #       classes look like "Th-n depth3" for instance if max depth is 3
    # note: These todos arent our priority for now
    ###
    _updateDeepest : ->
        max = 1
        lines = @_lines
        for c of lines
            if @editorBody$.children("#" + "#{lines[c].lineID}").length > 0 and lines[c].lineType == "Th" and lines[c].lineDepthAbs > max
                max = @_lines[c].lineDepthAbs
                
        # Following code is way too ugly to be kept
        # It needs to be replaced with a way to change a variable in a styl or
        # css file... but I don't even know if it is possible.
        if max != @_deepest
            @_deepest = max
            if max < 4
                @replaceCSS("stylesheets/app-deep-#{max}.css")
            else
                @replaceCSS("stylesheets/app-deep-4.css")
        

    ### ------------------------------------------------------------------------
    # Initialize the editor content from a html string
    ###
    replaceContent : (htmlContent) ->
        @editorBody$.html( htmlContent )
        @_readHtml()
        #@_buildSummary()

    ###
    # Returns a markdown string representing the editor content
    ###
    getEditorContent : () ->
        cozyContent = @editorBody$.html()
        return @_cozy2md cozyContent
        
    ###
    # Sets the editor content from a markdown string
    ###
    setEditorContent : (mdContent) ->
        cozyContent = @_md2cozy mdContent
        @editorBody$.html cozyContent
        # update the controler
        @_readHtml()
                  
    ###
    # Change the path of the css applied to the editor iframe
    ###
    replaceCSS : (path) ->
        $(this.editorIframe).contents().find("link[rel=stylesheet]").attr({href : path})

    ###
    # Utility functions for accurate node selections
    ###
    _putEndOnEnd : (range, elt) ->
        if elt.firstChild?
            offset = $(elt.firstChild).text().length
            range.setEnd(elt.firstChild, offset)
        else
            range.setEnd(elt, 0)
    _putStartOnEnd : (range, elt) ->
        if elt.firstChild?
            offset = $(elt.firstChild).text().length
            range.setStart(elt.firstChild, offset)
        else
            range.setStart(elt, 0)
    _putEndOnStart : (range, elt) ->
        if elt.firstChild?
            range.setEnd(elt.firstChild, 0)
        else
            range.setEnd(elt, 0)
    _putStartOnStart : (range, elt) ->
        if elt.firstChild?
            range.setStart(elt.firstChild, 0)
        else
            range.setStart(elt, 0)

    ###
    # Normalize the actual selection
    ###
    _normalize : (range) ->
        # We suppose that a div can be selected only when clicking on the right
        # 1. if it's a div
        startContainer = range.startContainer
        if startContainer.nodeName == "DIV"
            elt = startContainer.lastChild.previousElementSibling
            @_putStartOnEnd(range, elt)
        # 2. if it's between two labels span/img/a
        else if ! startContainer.parentNode in ["SPAN","IMG","A"]
            next=startContainer.nextElementSibling
            prev=startContainer.previousElementSibling
            if next != null
                @_putStartOnStart(range, next)
            else
                @_putEndOnEnd(range, prev)
                
        # same with the selection end
        # 1. if it's a div
        endContainer = range.endContainer
        if endContainer.nodeName == "DIV"
            elt = endContainer.lastChild.previousElementSibling
            @_putEndOnEnd(range, elt)
        else if ! endContainer.parentNode in ["SPAN","IMG","A"]
            next=endContainer.nextElementSibling
            prev=endContainer.previousElementSibling
            if next != null
                @_putStartOnStart(range, next)
            else
                @_putEndOnEnd(range, prev)

    
    ### ------------------------------------------------------------------------
    #    The listener of keyPress event on the editor's iframe... the king !
    ###
    # 
    # Params :
    # e : the event object. Interesting attributes : 
    #   .which : added by jquery : code of the caracter (not of the key)
    #   .altKey
    #   .ctrlKey
    #   .metaKey
    #   .shiftKey
    #   .keyCode
    ###
    # SHORTCUT  |-----------------------> (suggestion: see jquery.hotkeys.js ? )
    #
    # Definition of a shortcut : 
    #   a combination alt,ctrl,shift,meta
    #   + one caracter(.which) 
    #   or 
    #     arrow (.keyCode=dghb:) or 
    #     return(keyCode:13) or 
    #     bckspace (which:8) or 
    #     tab(keyCode:9)
    #   ex : shortcut = 'CtrlShift-up', 'Ctrl-115' (ctrl+s), '-115' (s),
    #                   'Ctrl-'
    ###
    # Variables :
    #   metaKeyStrokesCode : ex : ="Alt" or "CtrlAlt" or "CtrlShift" ...
    #   keyStrokesCode     : ex : ="return" or "_102" (when the caracter 
    #                               N°102 f is stroke) or "space" ...
    #
    _keyPressListener : (e) =>
        
        # 1- Prepare the shortcut corresponding to pressed keys
        # TODO: when pressed key is a letter, prevent the browser default action
        metaKeyStrokesCode = `(e.altKey ? "Alt" : "") + 
                              (e.ctrlKey ? "Ctrl" : "") + 
                              (e.shiftKey ? "Shift" : "")`
        switch e.keyCode
            when 13 then keyStrokesCode = "return"
            when 35 then keyStrokesCode = "end"
            when 36 then keyStrokesCode = "home"
            when 33 then keyStrokesCode = "pgUp"
            when 34 then keyStrokesCode = "pgDwn"
            when 37 then keyStrokesCode = "left"
            when 38 then keyStrokesCode = "up"
            when 39 then keyStrokesCode = "right"
            when 40 then keyStrokesCode = "down"
            when 9  then keyStrokesCode = "tab"
            when 8  then keyStrokesCode = "backspace"
            when 32 then keyStrokesCode = "space"
            when 27 then keyStrokesCode = "esc"
            when 46 then keyStrokesCode = "suppr"
            else
                switch e.which # TODO : to be deleted if it works with e.keyCode
                    when 32 then keyStrokesCode = "space"  
                    when 8  then keyStrokesCode = "backspace"
                    else  keyStrokesCode = e.which
        shortcut = metaKeyStrokesCode + '-' + keyStrokesCode

        # for tests and check the key and caracter numbers :
        # console.clear()
        # console.log '__keyPressListener____________________________'
        # console.log e
        # console.log "ctrl #{e.ctrlKey}; Alt #{e.altKey}; Shift #{e.shiftKey}; which #{e.which}; keyCode #{e.keyCode}"
        # console.log "metaKeyStrokesCode:'#{metaKeyStrokesCode} keyStrokesCode:'#{keyStrokesCode}'"

        # 2- manage the newPosition flag
        #    newPosition == true if the position of carret or selection has been
        #    modified with keyboard or mouse.
        #    If newPosition == true, then the selection must be "normalized" :
        #       - carret must be in a span
        #       - selection must start and end in a span

        # 2.1- Set a flag if the user moved the carret with keyboard
        if keyStrokesCode in ["left","up","right","down","pgUp","pgDwn","end",
                              "home"] and 
                              shortcut not in ['CtrlShift-down','CtrlShift-up']
            @newPosition = true
        
        #if there was no keyboard move action but the previous action was a move
        # then "normalize" the selection
        else
            if @newPosition
                @newPosition = false
                # TODO: following line is just for test, must be somewhere else.
                $("#editorPropertiesDisplay").text("newPosition = false")

                sel = rangy.getIframeSelection(@editorIframe)
                # if sthg is selected
                num = sel.rangeCount
                if num > 0
                    # for each selected area
                    for i in [0..num-1]
                        range = sel.getRangeAt(i)
                        @_normalize(range)

        # 4- the current selection is initialized on each keypress
        this.currentSel = null
       
        # 5- launch the action corresponding to the pressed shortcut
        switch shortcut

            # RETURN
            when "-return"
                @_return()
                e.preventDefault()
                #@_updateDeepest()
            
            # TAB
            when "-tab"
                @tab()
                e.preventDefault()
                #@_updateDeepest()
            
            # BACKSPACE
            when "-backspace"
                @_backspace(e)
                #@_updateDeepest()
            
            # SUPPR
            when "-suppr"
                @_suppr(e)
                #@_updateDeepest()

            # CTRL SHIFT DOWN
            when "CtrlShift-down"
                @_moveLinesDown()
                e.preventDefault()

            # CTRL SHIFT UP
            when "CtrlShift-up"
                @_moveLinesUp()
                e.preventDefault()

            # SHIFT TAB
            when "Shift-tab"
                @shiftTab()
                e.preventDefault()
                #@_updateDeepest()
            
            # TOGGLE LINE TYPE (Alt + a)                  
            when "Alt-97"
                @_toggleLineType()
                e.preventDefault()
            
            # PASTE (Ctrl + c)                  
            when "Ctrl-118"
                # TODO
                # console.log "TODO : PASTE"
                e.preventDefault()
                #@_updateDeepest()
            
            # SAVE (Ctrl + s)                  
            when "Ctrl-115"
                # TODO
                # console.log "TODO : SAVE"
                e.preventDefault()


    ### ------------------------------------------------------------------------
    # Manage deletions when suppr key is pressed
    ###
    _suppr : (e) ->
        @_findLinesAndIsStartIsEnd()
        sel = this.currentSel
        startLine = sel.startLine

        # 1- Case of a caret "alone" (no selection)
        if sel.range.collapsed
            # 1.1 caret is at the end of the line
            if sel.rangeIsEndLine
                # if there is a next line : modify the selection to make
                # a multiline deletion
                if startLine.lineNext != null
                    sel.range.setEndBefore(startLine.lineNext.line$[0].firstChild)
                    sel.endLine = startLine.lineNext
                    @_deleteMultiLinesSelections()
                    e.preventDefault()
                # if there is no next line :
                # no modification, just prevent default action
                else
                    e.preventDefault()
            # 1.2 caret is in the middle of the line : nothing to do
            # else

        # 2- Case of a selection contained in a line
        else if sel.endLine == startLine
            sel.range.deleteContents()
            e.preventDefault()

        # 3- Case of a multi lines selection
        else
            @_deleteMultiLinesSelections()
            e.preventDefault()


    ### ------------------------------------------------------------------------
    #  Manage deletions when backspace key is pressed
    ###
    _backspace : (e) ->
        @_findLinesAndIsStartIsEnd()
        sel = this.currentSel
        startLine = sel.startLine

        # 1- Case of a caret "alone" (no selection)
        if sel.range.collapsed
            # 1.1 caret is at the beginning of the line
            if sel.rangeIsStartLine
                # if there is a previous line : modify the selection to make
                # a multiline deletion
                if startLine.linePrev != null
                    sel.range.setStartBefore(startLine.linePrev.line$[0].lastChild)
                    sel.startLine = startLine.linePrev
                    @_deleteMultiLinesSelections()
                    e.preventDefault()
                # if there is no previous line :
                # no modification, just prevent default action
                else
                    e.preventDefault()
            # 1.2 caret is in the middle of the line : nothing to do
            # else

        # 2- Case of a selection contained in a line
        else if sel.endLine == startLine
            sel.range.deleteContents()
            e.preventDefault()

        # 3- Case of a multi lines selection
        else
            @_deleteMultiLinesSelections()
            e.preventDefault()



    ### ------------------------------------------------------------------------
    #  Turn selected lines in a title List (Th)
    ###
    titleList : () ->
        # 1- Variables
        sel                = rangy.getIframeSelection(@editorIframe)
        range              = sel.getRangeAt(0)
        startContainer     = range.startContainer
        endContainer       = range.endContainer
        initialStartOffset = range.startOffset
        initialEndOffset   = range.endOffset
        # 2- find first and last div corresponding to the 1rst and
        #    last selected lines
        startDiv = startContainer
        if startDiv.nodeName != "DIV"
            startDiv = $(startDiv).parents("div")[0]
        endDiv = endContainer
        if endDiv.nodeName != "DIV"
            endDiv = $(endDiv).parents("div")[0]
        endLineID = endDiv.id
        # 3- loop on each line between the firts and last line selected
        # TODO : deal the case of a multi range (multi selections). 
        #        Currently only the first range is taken into account.
        line = @_lines[startDiv.id]
        endDivID = endDiv.id
        loop
            @_line2titleList(line)
            if line.lineID == endDivID
                break
            else 
                line = line.lineNext


    ### ------------------------------------------------------------------------
    #  Turn a given line in a title List Line (Th)
    ###
    _line2titleList : (line)->
        if line.lineType != 'Th'
            if line.lineType[0] =='L'
                line.lineType = 'Tu'
                line.lineDepthAbs +=1    
            @_titilizeSiblings(line)
            parent1stSibling = @_findParent1stSibling(line)
            while parent1stSibling!=null and parent1stSibling.lineType!='Th'
                @_titilizeSiblings(parent1stSibling)
                parent1stSibling = @_findParent1stSibling(parent1stSibling)


    ### ------------------------------------------------------------------------
    #  Turn selected lines in a Marker List
    ###
    markerList : (l) ->
        # 1- Variables
        if l? 
            startDivID = l.lineID
            endLineID  = startDivID
        else
            range              = rangy.getIframeSelection(@editorIframe).getRangeAt(0)
            endContainer       = 
            initialStartOffset = range.startOffset
            initialEndOffset   = range.endOffset
            # 2- find first and last div corresponding to the 1rst and
            #    last selected lines
            startDiv = range.startContainer
            if startDiv.nodeName != "DIV"
                startDiv = $(startDiv).parents("div")[0]
            startDivID =  startDiv.id
            endDiv = range.endContainer
            if endDiv.nodeName != "DIV"
                endDiv = $(endDiv).parents("div")[0]
            endLineID = endDiv.id
        # 3- loop on each line between the firts and last line selected
        # TODO : deal the case of a multi range (multi selections). 
        #        Currently only the first range is taken into account.
        line = @_lines[startDivID]
        loop
            switch line.lineType
                when 'Th'
                    lineTypeTarget = 'Tu'
                    # transform all next Th & Lh siblings in Tu & Lu
                    l = line.lineNext
                    while l!=null and l.lineDepthAbs >= line.lineDepthAbs
                        switch l.lineType
                            when 'Th'
                                l.line$.prop("class","Tu-#{l.lineDepthAbs}")
                                l.lineType = 'Tu'
                                l.lineDepthRel = @_findDepthRel(l)
                            when 'Lh'
                                l.line$.prop("class","Lu-#{l.lineDepthAbs}")
                                l.lineType = 'Lu'
                                l.lineDepthRel = @_findDepthRel(l)
                        l=l.lineNext
                    # transform all previous Th &vLh siblings in Tu & Lu
                    l = line.linePrev
                    while l!=null and l.lineDepthAbs >= line.lineDepthAbs
                        switch l.lineType
                            when 'Th'
                                l.line$.prop("class","Tu-#{l.lineDepthAbs}")
                                l.lineType = 'Tu'
                                l.lineDepthRel = @_findDepthRel(l)
                            when 'Lh'
                                l.line$.prop("class","Lu-#{l.lineDepthAbs}")
                                l.lineType = 'Lu'
                                l.lineDepthRel = @_findDepthRel(l)
                        l=l.linePrev
                when 'Lh', 'Lu'
                    # remember : the default indentation action is to make 
                    # a marker list, that's why it works here.
                    @tab(line) 
                else
                    lineTypeTarget = false
            # TODO: à supprimer en mettant commençant les boucles par la ligne elle meme et non la suivante
            if lineTypeTarget 
                line.line$.prop("class","#{lineTypeTarget}-#{line.lineDepthAbs}")
                line.lineType = lineTypeTarget
            if line.lineID == endLineID
                break
            else 
                line = line.lineNext


    ### ------------------------------------------------------------------------
    # Calculates the relative depth of the line
    #   usage   : cycle : Tu => To => Lx => Th
    #   param   : line : the line we want to find the relative depth
    #   returns : a number
    # 
    ###
    _findDepthRel : (line) ->
        if line.lineDepthAbs == 1
            if line.lineType[1] == "h"
                return 0
            else
                return 1
        else 
            linePrev = line.linePrev
            while linePrev.lineDepthAbs >= line.lineDepthAbs
                linePrev = linePrev.linePrev
            return linePrev.lineDepthRel+1


    ### ------------------------------------------------------------------------
    # Toggle line type
    #   usage : cycle : Tu => To => Lx => Th
    #   param :
    #       e = event
    ###
    _toggleLineType : () ->
        # 1- Variables
        sel                = rangy.getIframeSelection(@editorIframe)
        range              = sel.getRangeAt(0)
        startContainer     = range.startContainer
        endContainer       = range.endContainer
        initialStartOffset = range.startOffset
        initialEndOffset   = range.endOffset
        # 2- find first and last div corresponding to the 1rst and
        #    last selected lines
        startDiv = startContainer
        if startDiv.nodeName != "DIV"
            startDiv = $(startDiv).parents("div")[0]
        endDiv = endContainer
        if endDiv.nodeName != "DIV"
            endDiv = $(endDiv).parents("div")[0]
        endLineID = endDiv.id
        # 3- loop on each line between the firts and last line selected
        # TODO : deal the case of a multi range (multi selections). 
        #        Currently only the first range is taken into account.
        line = @_lines[startDiv.id]
        loop
            switch line.lineType
                when 'Tu' # can be turned in a Th only if his parent is a Th
                    lineTypeTarget = 'Th'
                    # transform all its siblings in Th
                    l = line.lineNext 
                    while l!=null and l.lineDepthAbs >= line.lineDepthAbs
                        if l.lineDepthAbs == line.lineDepthAbs
                            if l.lineType == 'Tu'
                                l.line$.prop("class","Th-#{line.lineDepthAbs}")
                                l.lineType = 'Th'
                            else
                                l.line$.prop("class","Lh-#{line.lineDepthAbs}")
                                l.lineType = 'Lh'
                        l=l.lineNext
                    l = line.linePrev 
                    while l!=null and l.lineDepthAbs >= line.lineDepthAbs
                        if l.lineDepthAbs == line.lineDepthAbs
                            if l.lineType == 'Tu'
                                l.line$.prop("class","Th-#{line.lineDepthAbs}")
                                l.lineType = 'Th'
                            else
                                l.line$.prop("class","Lh-#{line.lineDepthAbs}")
                                l.lineType = 'Lh'
                        l=l.linePrev

                when 'Th'
                    lineTypeTarget = 'Tu'
                    # transform all its siblings in Tu
                    l = line.lineNext
                    while l!=null and l.lineDepthAbs >= line.lineDepthAbs
                        if l.lineDepthAbs == line.lineDepthAbs
                            if l.lineType == 'Th'
                                l.line$.prop("class","Tu-#{line.lineDepthAbs}")
                                l.lineType = 'Tu'
                            else
                                l.line$.prop("class","Lu-#{line.lineDepthAbs}")
                                l.lineType = 'Lu'
                        l=l.lineNext
                    l = line.linePrev
                    while l!=null and l.lineDepthAbs >= line.lineDepthAbs
                        if l.lineDepthAbs == line.lineDepthAbs
                            if l.lineType == 'Th'
                                l.line$.prop("class","Tu-#{line.lineDepthAbs}")
                                l.lineType = 'Tu'
                            else
                                l.line$.prop("class","Lu-#{line.lineDepthAbs}")
                                l.lineType = 'Lu'
                        l=l.linePrev
                # when 'Lh'
                #     lineTypeTarget = 'Th'
                # when 'Lu'
                #     lineTypeTarget = 'Tu'
                else
                    lineTypeTarget = false
            if lineTypeTarget 
                line.line$.prop("class","#{lineTypeTarget}-#{line.lineDepthAbs}")
                line.lineType = lineTypeTarget
            if line.lineID == endDiv.id
                break
            else 
                line = line.lineNext


    ### ------------------------------------------------------------------------
    # tab keypress
    #   l = optional : a line to indent. If none, the selection will be indented
    ###
    tab :  (l) ->
        # 1- Variables
        if l? 
            startDiv = l.line$[0]
            endDiv   = startDiv
        else
            sel      = rangy.getIframeSelection(@editorIframe)
            range    = sel.getRangeAt(0)
            startDiv = range.startContainer
            endDiv   = range.endContainer
       
        # 2- find first and last div corresponding to the 1rst and
        #    last selected lines
        if startDiv.nodeName != "DIV"
            startDiv = $(startDiv).parents("div")[0]
        if endDiv.nodeName != "DIV"
            endDiv = $(endDiv).parents("div")[0]
        endLineID = endDiv.id
        # 3- loop on each line between the firts and last line selected
        # TODO : deal the case of a multi range (multi selections). 
        #        Currently only the first range is taken into account.
        line = @_lines[startDiv.id]
        loop
            switch line.lineType
                when 'Tu','Th'
                    # find previous sibling to check if a tab is possible.
                    linePrevSibling = @_findPrevSibling(line)
                    if linePrevSibling == null
                        isTabAllowed=false
                    else 
                        isTabAllowed=true
                        # determine new lineType
                        if linePrevSibling.lineType == 'Th'
                            lineTypeTarget = 'Lh'
                        else 
                            if linePrevSibling.lineType == 'Tu'
                                lineTypeTarget = 'Lu'
                            else
                                lineTypeTarget = 'Lo'
                            if line.lineType == 'Th'
                                # in case of a Th => Lx then all the following 
                                # siblings must be turned to Tx and Lh into Lx
                                # first we must find the previous sibling line                                
                                # linePrevSibling = @_findPrevSibling(line)
                                # linePrev = line.linePrev
                                # while linePrev.lineDepthAbs > firstChild
                                #     textContent
                                lineNext = line.lineNext
                                while lineNext != null and lineNext.lineDepthAbs > line.lineDepthAbs
                                    switch lineNext.lineType
                                        when 'Th'
                                            lineNext.lineType = 'Tu'
                                            line.line$.prop("class","Tu-#{lineNext.lineDepthAbs}")
                                            nextLineType = prevTxType
                                        when 'Tu'
                                            nextLineType = 'Lu'
                                        when 'To'
                                            nextLineType = 'Lo'
                                        when 'Lh'
                                            lineNext.lineType = nextLineType
                                            line.line$.prop("class","#{nextLineType}-#{lineNext.lineDepthAbs}")
                when 'Lh', 'Lu', 'Lo'
                    # TODO : if there are new siblings, the target type must be 
                    # the one of those, otherwise Tu is default.
                    lineNext = line.lineNext
                    lineTypeTarget = null
                    while lineNext != null and lineNext.lineDepthAbs >= line.lineDepthAbs
                        if lineNext.lineDepthAbs != line.lineDepthAbs + 1
                            lineNext = lineNext.lineNext
                        else
                            lineTypeTarget = lineNext.lineType
                            lineNext=null
                    if lineTypeTarget == null
                        linePrev = line.linePrev
                        while linePrev != null and linePrev.lineDepthAbs >= line.lineDepthAbs
                            if linePrev.lineDepthAbs==line.lineDepthAbs + 1
                                lineTypeTarget = linePrev.lineType
                                linePrev=null
                            else
                                linePrev = linePrev.linePrev
                    if lineTypeTarget == null
                        isTabAllowed       = true
                        lineTypeTarget     = 'Tu'
                        line.lineDepthAbs += 1
                        line.lineDepthRel += 1
                    else
                        if lineTypeTarget == 'Th'
                            isTabAllowed       = true
                            line.lineDepthAbs += 1
                            line.lineDepthRel  = 0
                        if lineTypeTarget == 'Tu' or  lineTypeTarget == 'To'
                            isTabAllowed       = true
                            line.lineDepthAbs += 1
                            line.lineDepthRel += 1
            if isTabAllowed
                line.line$.prop("class","#{lineTypeTarget}-#{line.lineDepthAbs}")
                line.lineType = lineTypeTarget
            if line.lineID == endLineID
                break
            else 
                line = line.lineNext


    ### ------------------------------------------------------------------------
    # shift + tab keypress
    #   e = event
    ###
    shiftTab : () ->

        # 1- Variables
        sel                = rangy.getIframeSelection(@editorIframe)

        l = sel.rangeCount
        if l == 0
            return
        c = 0
        while c < l
            range              = sel.getRangeAt(c)
            startDiv           = range.startContainer
            endDiv             = range.endContainer
            initialStartOffset = range.startOffset
            initialEndOffset   = range.endOffset
        
            # 2- find first and last div corresponding to the 1rst and
            #    last selected lines
            if startDiv.nodeName != "DIV"
                startDiv = $(startDiv).parents("div")[0]
            if endDiv.nodeName != "DIV"
                endDiv = $(endDiv).parents("div")[0]
            endLineID = endDiv.id
        
            # 3- loop on each line between the firts and last line selected
            line = @_lines[startDiv.id]
            loop
                switch line.lineType
                    when 'Tu','Th','To'
                        # find the closest parent to choose the new lineType.
                        parent = line.linePrev
                        while parent != null and parent.lineDepthAbs >= line.lineDepthAbs
                            parent = parent.linePrev
                        if parent != null
                            isTabAllowed   = true
                            lineTypeTarget = parent.lineType
                            lineTypeTarget = "L" + lineTypeTarget.charAt(1)
                            line.lineDepthAbs -= 1
                            line.lineDepthRel -= parent.lineDepthRel
                            # if lineNext is a Lx, then it must be turned in a Tx
                            if line.lineNext.lineType[0]=='L'
                                nextL = line.lineNext
                                nextL.lineType='T'+nextL.lineType[1] 
                                nextL.line$.prop('class',"#{nextL.lineType}-#{nextL.lineDepthAbs}")
                        else 
                            isTabAllowed = false
                    when 'Lh'
                        isTabAllowed=true
                        lineTypeTarget     = 'Th'
                    when 'Lu'
                        isTabAllowed=true
                        lineTypeTarget     = 'Tu'
                    when 'Lo'
                        isTabAllowed=true
                        lineTypeTarget     = 'To'
                if isTabAllowed
                    line.line$.prop("class","#{lineTypeTarget}-#{line.lineDepthAbs}")
                    line.lineType = lineTypeTarget
                if line.lineID == endDiv.id
                    break
                else 
                    line = line.lineNext
            c++

    ### ------------------------------------------------------------------------
    # return keypress
    #   e = event
    ###
    _return : ()->
        @_findLinesAndIsStartIsEnd()
        currSel   = this.currentSel
        startLine = currSel.startLine
        endLine   = currSel.endLine
        
        # 1- Delete the selections so that the selection is collapsed
        if currSel.range.collapsed
            
        else if endLine == startLine
            currSel.range.deleteContents()
        else
            @_deleteMultiLinesSelections()
            @_findLinesAndIsStartIsEnd()
            currSel   = this.currentSel
            startLine = currSel.startLine
        
        # 2- Caret is at the end of the line
        if currSel.rangeIsEndLine
            newLine = @_insertLineAfter (
                sourceLineID       : startLine.lineID
                targetLineType     : startLine.lineType
                targetLineDepthAbs : startLine.lineDepthAbs
                targetLineDepthRel : startLine.lineDepthRel
            )
            # Position caret
            range4sel = rangy.createRange()
            range4sel.collapseToPoint(newLine.line$[0].firstChild,0)
            currSel.sel.setSingleRange(range4sel)

        # 3- Caret is at the beginning of the line
        else if currSel.rangeIsStartLine
            newLine = @_insertLineBefore (
                sourceLineID       : startLine.lineID
                targetLineType     : startLine.lineType
                targetLineDepthAbs : startLine.lineDepthAbs
                targetLineDepthRel : startLine.lineDepthRel
            )
            # Position caret
            range4sel = rangy.createRange()
            range4sel.collapseToPoint(startLine.line$[0].firstChild,0)
            currSel.sel.setSingleRange(range4sel)
        # 4- Caret is in the middle of the line
        else                     
            # Deletion of the end of the original line
            currSel.range.setEndBefore( startLine.line$[0].lastChild )
            endOfLineFragment = currSel.range.extractContents()
            currSel.range.deleteContents()
            # insertion
            newLine = @_insertLineAfter (
                sourceLineID       : startLine.lineID
                targetLineType     : startLine.lineType
                targetLineDepthAbs : startLine.lineDepthAbs
                targetLineDepthRel : startLine.lineDepthRel
                fragment           : endOfLineFragment
            )
            # Position caret
            range4sel = rangy.createRange()
            range4sel.collapseToPoint(newLine.line$[0].firstChild.childNodes[0],0)
            currSel.sel.setSingleRange(range4sel)
            this.currentSel = null


    ### ------------------------------------------------------------------------
    # turn in Th or Lh of the siblings of line (and line itself of course)
    # the children are note modified
    ### 
    _titilizeSiblings : (line) ->
        lineDepthAbs = line.lineDepthAbs
        # 1- transform all its next siblings in Th
        l = line
        while l!=null and l.lineDepthAbs >= lineDepthAbs
            if l.lineDepthAbs == lineDepthAbs
                switch l.lineType 
                    when 'Tu','To'
                        l.line$.prop("class","Th-#{lineDepthAbs}")
                        l.lineType = 'Th'
                        l.lineDepthRel = 0
                    when 'Lu','Lo'
                        l.line$.prop("class","Lh-#{lineDepthAbs}")
                        l.lineType = 'Lh'
                        l.lineDepthRel = 0
            l=l.lineNext
        # 2- transform all its previous siblings in Th
        l = line.linePrev 
        while l!=null and l.lineDepthAbs >= lineDepthAbs
            if l.lineDepthAbs == lineDepthAbs
                switch l.lineType
                    when 'Tu','To'
                        l.line$.prop("class","Th-#{lineDepthAbs}")
                        l.lineType = 'Th'
                        l.lineDepthRel = 0
                    when 'Lu','Lo'
                        l.line$.prop("class","Lh-#{lineDepthAbs}")
                        l.lineType = 'Lh'
                        l.lineDepthRel = 0
            l=l.linePrev
        return true


    ### ------------------------------------------------------------------------
    # find the sibling line of the parent of line that is the first of the list
    # ex :
    #   . Sibling1  <= _findParent1stSibling(line)
    #   . Sibling2
    #   . Parent
    #      . child1
    #      . line     : the line in argument
    # returns null if no previous sibling, the line otherwise
    # the sibling is a title (Th, Tu or To), not a line (Lh nor Lu nor Lo)
    ### 
    _findParent1stSibling : (line) ->
        lineDepthAbs = line.lineDepthAbs
        linePrev = line.linePrev
        if linePrev == null
            return line
        if lineDepthAbs <= 2
            # in the 2 first levels the answer is _firstLine
            while linePrev.linePrev != null
                linePrev = linePrev.linePrev
            return linePrev
        else
            while linePrev != null and linePrev.lineDepthAbs > (lineDepthAbs - 2)
                linePrev = linePrev.linePrev
            return linePrev.lineNext


    ### ------------------------------------------------------------------------
    # find the previous sibling line.
    # returns null if no previous sibling, the line otherwise
    # the sibling is a title (Th, Tu or To), not a line (Lh nor Lu nor Lo)
    ###
    _findPrevSibling : (line)->
        lineDepthAbs = line.lineDepthAbs
        linePrevSibling = line.linePrev
        if linePrevSibling == null
            # nothing to do if first line
            return null
        else if linePrevSibling.lineDepthAbs < lineDepthAbs
            # If AbsDepth of previous line is lower : we are on the first
            # line of a list of paragraphes, there is no previous sibling
            return null
        else
            while linePrevSibling.lineDepthAbs > lineDepthAbs
                linePrevSibling = linePrevSibling.linePrev
            while linePrevSibling.lineType[0] == 'L'
                linePrevSibling = linePrevSibling.linePrev
            return linePrevSibling


    ### ------------------------------------------------------------------------
    #   delete the user multi line selection
    #
    #   prerequisite : at least 2 lines must be selected
    # 
    #   parameters :
    #        :
    # 
    ###
    _deleteMultiLinesSelections : (startLine, endLine) ->
        
        # 0- variables
        if startLine != undefined
            range = rangy.createRange()
            @_putStartOnEnd(range, startLine.line$[0].lastElementChild.previousElementSibling)
            @_putEndOnEnd(range, endLine.line$[0].lastElementChild.previousElementSibling)
        else
            @_findLines()
            range = this.currentSel.range
            startContainer = range.startContainer
            startOffset = range.startOffset
            startLine = this.currentSel.startLine
            endLine = this.currentSel.endLine
        endLineDepthAbs = endLine.lineDepthAbs
        startLineDepthAbs = startLine.lineDepthAbs
        deltaDepth = endLineDepthAbs - startLineDepthAbs

        # 1- copy the end of endLine in a fragment
        range4fragment = rangy.createRangyRange()
        range4fragment.setStart(range.endContainer, range.endOffset)
        range4fragment.setEndAfter(endLine.line$[0].lastChild)
        endOfLineFragment = range4fragment.cloneContents()
        
        # 2- adapt the type of endLine and of its children to startLine 
        # the only useful case is when endLine must be changed from Th to Tu or To
        if endLine.lineType[1] == 'h' and startLine.lineType[1] != 'h'
            if endLine.lineType[0] == 'L'
                endLine.lineType = 'T' + endLine.lineType[1]
                endLine.line$.prop("class","#{endLine.lineType}-#{endLine.lineDepthAbs}")
            @markerList(endLine)
            
        # 3- delete lines
        range.deleteContents()
        
        # 4- append fragment and delete endLine
        if startLine.line$[0].lastChild.nodeName == 'BR'
            startLine.line$[0].removeChild( startLine.line$[0].lastChild)
        startFrag = endOfLineFragment.childNodes[0]
        myEndLine = startLine.line$[0].lastElementChild
        if (startFrag.tagName == myEndLine.tagName == 'SPAN') and ((! $(startFrag).attr("class")? and ! $(myEndLine).attr("class")?) or ($(startFrag).attr("class") == $(myEndLine).attr("class")))
            
            startOffset = $(myEndLine).text().length
            newText = $(myEndLine).text() + $(startFrag).text()
            $(myEndLine).text( newText )
            startContainer = myEndLine.firstChild
            
            l=1
            while l < endOfLineFragment.childNodes.length
                $(endOfLineFragment.childNodes[l]).appendTo startLine.line$
                l++
        else
            startLine.line$.append( endOfLineFragment )
            
        startLine.lineNext = endLine.lineNext
        if endLine.lineNext != null
            endLine.lineNext.linePrev=startLine
        endLine.line$.remove()
        delete this._lines[endLine.lineID]
        
        # 5- adapt the depth of the children and following siblings of end line
        #    in case the depth delta between start and end line is
        #    greater than 0, then the structure is not correct : we reduce
        #    the depth of all the children and siblings of endLine.
        line = startLine.lineNext
        if line != null
            deltaDepth1stLine = line.lineDepthAbs - startLineDepthAbs
            if deltaDepth1stLine >= 1 
                while line!= null and line.lineDepthAbs >= endLineDepthAbs
                    newDepth = line.lineDepthAbs - deltaDepth
                    line.lineDepthAbs = newDepth
                    line.line$.prop("class","#{line.lineType}-#{newDepth}")
                    line = line.lineNext
        
        # 6- adapt the type of the first line after the children and siblings of
        #    end line. Its previous sibling or parent might have been deleted, 
        #    we then must find its new one in order to adapt its type.
        if line != null
            # if the line is a line (Lx), then make it "independant"
            # by turning it in a Tx
            if line.lineType[0] == 'L'
                line.lineType = 'T' + line.lineType[1]
                line.line$.prop("class","#{line.lineType}-#{line.lineDepthAbs}")
            # find the previous sibling, adjust type to its type.
            firstLineAfterSiblingsOfDeleted = line
            depthSibling = line.lineDepthAbs
            line = line.linePrev
            while line != null and line.lineDepthAbs > depthSibling
                line = line.linePrev
            prevSiblingType = line.lineType
            if firstLineAfterSiblingsOfDeleted.lineType!=prevSiblingType
                if prevSiblingType[1]=='h'
                    @_line2titleList(firstLineAfterSiblingsOfDeleted)
                else
                    @markerList(firstLineAfterSiblingsOfDeleted)

        # 7- position caret
        if startLine == undefined
            range4caret = rangy.createRange()
            range4caret.collapseToPoint(startContainer, startOffset)
            this.currentSel.sel.setSingleRange(range4caret)
            this.currentSel = null
        # else
        #   do nothing
        
                
    ### ------------------------------------------------------------------------
    # Insert a line after a source line
    # p = 
    #     sourceLineID       : ID of the line after which the line will be added
    #     fragment           : [optionnal] - an html fragment that will be added
    #     targetLineType     : type of the line to add
    #     targetLineDepthAbs : absolute depth of the line to add
    #     targetLineDepthRel : relative depth of the line to add
    ###
    _insertLineAfter : (p) ->
        @_highestId += 1
        lineID          = 'CNID_' + @_highestId
        newLine$        = $("<div id='#{lineID}' class='#{p.targetLineType}-#{p.targetLineDepthAbs}'></div>")
        if p.fragment? 
            newLine$.append( p.fragment )
            newLine$.append('<br>')
        else
            newLine$.append( $('<span></span><br>') )
        sourceLine = @_lines[p.sourceLineID]
        newLine$   = newLine$.insertAfter(sourceLine.line$)
        newLine    =  
            line$        : newLine$
            lineID       : lineID
            lineType     : p.targetLineType
            lineDepthAbs : p.targetLineDepthAbs
            lineDepthRel : p.targetLineDepthRel
            lineNext     : sourceLine.lineNext
            linePrev     : sourceLine
        @_lines[lineID] = newLine
        if sourceLine.lineNext != null
            sourceLine.lineNext.linePrev = newLine
        sourceLine.lineNext = newLine
        return newLine



    ### ------------------------------------------------------------------------
    # Insert a line before a source line
    # p = 
    #     sourceLineID       : ID of the line before which a line will be added
    #     fragment           : [optionnal] - an html fragment that will be added
    #     targetLineType     : type of the line to add
    #     targetLineDepthAbs : absolute depth of the line to add
    #     targetLineDepthRel : relative depth of the line to add
    ###
    _insertLineBefore : (p) ->
        @_highestId += 1
        lineID = 'CNID_' + @_highestId
        newLine$ = $("<div id='#{lineID}' class='#{p.targetLineType}-#{p.targetLineDepthAbs}'></div>")
        if p.fragment? 
            newLine$.append( p.fragment )
            newLine$.append( $('<br>') )
        else
            newLine$.append( $('<span></span><br>') )
        sourceLine = @_lines[p.sourceLineID]
        newLine$ = newLine$.insertBefore(sourceLine.line$)
        newLine = 
            line$        : newLine$
            lineID       : lineID
            lineType     : p.targetLineType
            lineDepthAbs : p.targetLineDepthAbs
            lineDepthRel : p.targetLineDepthRel
            lineNext     : sourceLine
            linePrev     : sourceLine.linePrev
        @_lines[lineID] = newLine
        if sourceLine.linePrev != null
            sourceLine.linePrev.lineNext = newLine
        sourceLine.linePrev=newLine
        return newLine


    ### ------------------------------------------------------------------------
    # Finds :
    #   First and last line of selection. 
    # Remark :
    #   Only the first range of the selections is taken into account.
    # Returns : 
    #   sel : the selection
    #   range : the 1st range of the selections
    #   startLine : the 1st line of the range
    #   endLine : the last line of the range
    ###
    _findLines : () ->
        if this.currentSel == null
            # 1- Variables
            sel                = rangy.getIframeSelection(@editorIframe)
            range              = sel.getRangeAt(0)
            startContainer     = range.startContainer
            endContainer       = range.endContainer
            initialStartOffset = range.startOffset
            initialEndOffset   = range.endOffset
            
            # 2- find endLine 
            # endContainer refers to a div of a line
            if endContainer.id? and endContainer.id.substr(0,5) == 'CNID_'  
                endLine = @_lines[ endContainer.id ]
            # means the range ends inside a div (span, textNode...)
            else   
                endLine = @_lines[ $(endContainer).parents("div")[0].id ]
            
            # 3- find startLine 
            if startContainer.nodeName == 'DIV'
                # startContainer refers to a div of a line
                startLine = @_lines[ startContainer.id ]
            else   # means the range starts inside a div (span, textNode...)
                startLine = @_lines[ $(startContainer).parents("div")[0].id ]
            
            # 4- return
            this.currentSel = 
                sel              : sel
                range            : range
                startLine        : startLine
                endLine          : endLine
                rangeIsStartLine : null
                rangeIsEndLine   : null
        # return [sel,range,endLine,startLine]


    ### ------------------------------------------------------------------------
    # Finds :
    #   first and last line of selection 
    #   wheter the selection starts at the beginning of startLine or not
    #   wheter the selection ends at the end of endLine or not
    # 
    # Remark :
    #   Only the first range of the selections is taken into account.
    #
    # Returns : 
    #   sel : the selection
    #   range : the 1st range of the selections
    #   startLine : the 1st line of the range
    #   endLine : the last line of the range
    #   rangeIsEndLine : true if the range ends at the end of the last line
    #   rangeIsStartLine : true if the range starts at the start of 1st line
    ###
    _findLinesAndIsStartIsEnd : () ->
        if this.currentSel == null
            
            # 1- Variables
            sel                = rangy.getIframeSelection(@editorIframe)
            range              = sel.getRangeAt(0)
            startContainer     = range.startContainer
            endContainer       = range.endContainer
            initialStartOffset = range.startOffset
            initialEndOffset   = range.endOffset
            
            # 2- find endLine and the rangeIsEndLine
            # endContainer refers to a div of a line
            if endContainer.id? and endContainer.id.substr(0,5) == 'CNID_'  
                endLine = @_lines[ endContainer.id ]
                # rangeIsEndLine if endOffset points on the last node of the div or on 
                # the one before the last wich is a <br>
                rangeIsEndLine = ( endContainer.children.length-1==initialEndOffset ) or
                                 (endContainer.children[initialEndOffset].nodeName=="BR")
            # means the range ends inside a div (span, textNode...)
            else   
                endLine = @_lines[ $(endContainer).parents("div")[0].id ]
                parentEndContainer = endContainer
                # rangeIsEndLine if the selection is at the end of the endContainer
                # and of each of its parents (this approach is more robust than just 
                # considering that the line is a flat succession of span : maybe one day 
                # there will be a table for instance...)
                rangeIsEndLine = false
                if parentEndContainer.nodeType == Node.TEXT_NODE
                    rangeIsEndLine = ( initialEndOffset == parentEndContainer.textContent.length )
                else
                    nextSibling = parentEndContainer.nextSibling
                    rangeIsEndLine = (nextSibling == null or nextSibling.nodeName=='BR')
                parentEndContainer = endContainer.parentNode
                while rangeIsEndLine and parentEndContainer.nodeName != "DIV"
                    nextSibling = parentEndContainer.nextSibling
                    rangeIsEndLine = (nextSibling == null or nextSibling.nodeName=='BR')
                    parentEndContainer = parentEndContainer.parentNode
            
            # 3- find startLine and rangeIsStartLine
            if startContainer.nodeName == 'DIV' # startContainer refers to a div of a line
                startLine = @_lines[ startContainer.id ]
                rangeIsStartLine = (initialStartOffset==0)
                if initialStartOffset==1 and startContainer.innerHTML=="<span></span><br>" # startContainer is the br after an empty span
                    rangeIsStartLine = true
            else   # means the range starts inside a div (span, textNode...)
                startLine = @_lines[ $(startContainer).parents("div")[0].id ]
                rangeIsStartLine = (initialStartOffset==0)
                while rangeIsStartLine && parentEndContainer.nodeName != "DIV"
                    rangeIsStartLine = (parentEndContainer.previousSibling==null)
                    parentEndContainer = parentEndContainer.parentNode
            
            # 4- return
            this.currentSel = 
                sel              : sel
                range            : range
                startLine        : startLine
                endLine          : endLine
                rangeIsStartLine : rangeIsStartLine
                rangeIsEndLine   : rangeIsEndLine
        # return [sel,range,endLine,rangeIsEndLine,startLine,rangeIsStartLine]


    ###  -----------------------------------------------------------------------
    # Parse a raw html inserted in the iframe in order to update the controler
    ###
    _readHtml : () ->
        linesDiv$    = @editorBody$.children()  # linesDiv$= $[Div of lines]
        # loop on lines (div) to initialise the editor controler
        lineDepthAbs = 0
        lineDepthRel = 0
        lineID       = 0
        @_lines      = {}
        linePrev     = null
        lineNext     = null
        for htmlLine in linesDiv$
            htmlLine$ = $(htmlLine)
            lineClass = htmlLine$.attr('class') ? ""
            lineClass = lineClass.split('-')
            lineType  = lineClass[0]
            if lineType != ""
                lineDepthAbs_old = lineDepthAbs
                # hypothesis : _readHtml is called only on an html where 
                #              class="Tu-xx" where xx is the absolute depth
                lineDepthAbs     = +lineClass[1] 
                DeltaDepthAbs    = lineDepthAbs - lineDepthAbs_old
                lineDepthRel_old = lineDepthRel
                if lineType == "Th"
                    lineDepthRel = 0
                else 
                    lineDepthRel = lineDepthRel_old + DeltaDepthAbs
                lineID=(parseInt(lineID,10)+1)
                lineID_st = "CNID_"+lineID
                htmlLine$.prop("id",lineID_st)
                lineNew = 
                    line$        : htmlLine$
                    lineID       : lineID_st
                    lineType     : lineType
                    lineDepthAbs : lineDepthAbs
                    lineDepthRel : lineDepthRel
                    lineNext     : null
                    linePrev     : linePrev
                if linePrev != null then linePrev.lineNext = lineNew
                linePrev = lineNew
                @_lines[lineID_st] = lineNew
        @_highestId = lineID


    # Functions to perform the motion of an entire block of lines
    # TODO: bug: on 2 extreme lines
    #            (right after the first line and right before the last line)
    # TODO: improve insertion of the line swapped with the block
    _moveLinesDown : () ->
        #0- Set variables with informations on the selected lines
        @_findLines()
        sel = this.currentSel
        lineStart = sel.startLine
        lineEnd   = sel.endLine
        linePrev  = lineStart.linePrev
        lineNext  = lineEnd.lineNext
        
        if lineNext != null
            
            # 1-save lineNext
            cloneLine =
                line$        : lineNext.line$.clone()
                lineID       : lineNext.lineID
                lineType     : lineNext.lineType
                lineDepthAbs : lineNext.lineDepthAbs
                lineDepthRel : lineNext.lineDepthRel
                linePrev     : lineNext.linePrev
                lineNext     : lineNext.lineNext
                
            # 2-Delete the lowerline content
            @_deleteMultiLinesSelections(lineEnd, lineNext)
            
            # 3-Restore the lower line
            lineNext = cloneLine
            @_lines[lineNext.lineID] = lineNext
            
            # 4-Modify the linking
            lineNext.linePrev = linePrev
            lineStart.linePrev = lineNext
            if lineNext.lineNext != null
                lineNext.lineNext.linePrev = lineEnd
            lineEnd.lineNext = lineNext.lineNext
            lineNext.lineNext = lineStart
            if linePrev != null
                linePrev.lineNext = lineNext
                
            # 5-Modify the DOM
            lineStart.line$.before(lineNext.line$)

            # 6-Re-insert properly lineNext before the start of the moved block
            # TODO: this part needs some corrections
            if lineStart.lineDepthAbs < lineNext.lineDeptAbs
                lineNext.lineDepthRel = lineStart.lineDepthRel
                lineNext.lineDepthAbs = lineStart.lineDepthAbs
                lineNext.line$.attr('class', "#{lineNext.lineType}-#{lineNext.lineDepthAbs}")   


    _moveLinesUp : () ->
        #0- Set variables with informations on the selected lines
        @_findLines()
        sel = this.currentSel
        lineStart = sel.startLine
        lineEnd   = sel.endLine
        linePrev  = lineStart.linePrev
        lineNext  = lineEnd.lineNext
        
        if linePrev != null
            # 1-save linePrev
            cloneLine =
                line$        : linePrev.line$.clone()
                lineID       : linePrev.lineID
                lineType     : linePrev.lineType
                lineDepthAbs : linePrev.lineDepthAbs
                lineDepthRel : linePrev.lineDepthRel
                linePrev     : linePrev.linePrev
                lineNext     : linePrev.lineNext
                
            # 2-Delete the upperline content
            @_deleteMultiLinesSelections(linePrev.linePrev, linePrev)
            
            # 3-Restore the upper  line
            linePrev = cloneLine
            @_lines[linePrev.lineID] = linePrev
            
            # 4-Modify the linking
            linePrev.lineNext = lineNext
            lineEnd.lineNext = linePrev
            if linePrev.linePrev != null
                linePrev.linePrev.lineNext = lineStart
            lineStart.linePrev = linePrev.linePrev
            linePrev.linePrev = lineEnd
            if lineNext != null
                lineNext.linePrev = linePrev
                
            # 5-Modify the DOM
            lineEnd.line$.after(linePrev.line$)
           
            # 6-Re-insert properly linePrev after the end of the moved block
            # TODO: this part probably needs some corrections
            if lineEnd.lineType[0] == 'T'
                linePrev.lineType = lineEnd.lineType
                linePrev.lineDepthRel = lineEnd.lineDepthRel
                linePrev.lineDepthAbs = lineEnd.lineDepthAbs
                linePrev.line$.attr('class', lineEnd.line$.attr('class'))
            if linePrev.lineDepthAbs > lineEnd.lineDepthAbs
                linePrev.lineDepthRel = lineEnd.lineDepthRel
                linePrev.lineDepthAbs = lineEnd.lineDepthAbs
                linePrev.line$.attr('class', "#{linePrev.lineType}-#{linePrev.lineDepthAbs}")


    # Summary initialization
    # TODO: avoid to update the summary too often
    #       it would be best to make the update faster (rather than reading
    #       every line)
    _initSummary : () ->
        summary = @editorBody$.children("#nav")
        if summary.length == 0
            summary = $ document.createElement('div')
            summary.attr('id', 'nav')
            summary.prependTo @editorBody$
        return summary

    ###
    # Summary upkeep
    ###
    _buildSummary : () ->
        summary = @initSummary()
        @editorBody$.children("#nav").children().remove()
        lines = @_lines
        for c of lines
            if (@editorBody$.children("#" + "#{lines[c].lineID}").length > 0 and lines[c].lineType == "Th")
                lines[c].line$.clone().appendTo summary

    ###
    # Add html code to the history
    ###
    _addHistory : () ->
        # 1-fetch current html code
        allDivs = @editorBody$.children("div:not(#nav)")
        content = ''
        allDivs.each () ->
            content += @html()
        
    ###
    # Undo the previous action
    ###
    unDo : () ->
        return

    ###
    # Redo a undo-ed action
    ###
    reDo : () ->
        return

    ###
    # Reads a string that represents html code in our cozy format and turns it
    # into a string in markdown format
    ###
    _cozy2md : (text) ->
        
        # Writes the string into a jQuery object
        htmlCode = $(document.createElement 'div').html text
        
        # The future converted line
        markCode = ''

        # current depth
        currDepth = 1
        
        # converts a fragment of a line
        converter = {
            'A': (obj) ->
                title = if obj.attr('title')? then obj.attr('title') else ""
                href  = if obj.attr('href')? then obj.attr('href') else ""
                return '[' + obj.html() + '](' + href + ' "' + title + '")'
                    
            'IMG': (obj) ->
                title = if obj.attr('title')? then obj.attr('title') else ""
                alt = if obj.attr('alt')? then obj.attr('alt') else ""
                src = if obj.attr('src')? then obj.attr('src') else ""
                return '![' + alt + '](' + src + ' "' + title + '")'
                
            'SPAN':  (obj) ->
                return obj.text()
            }

        
        # markup symboles
        markup = {
            'Th' : (blanks, depth) ->
                # a title is a section rupture
                currDepth = depth
                dieses = ''
                i = 0
                while i < depth
                    dieses += '#'
                    i++
                return "\n" + dieses + ' '
            'Lh' : (blanks, depth) ->
                return "\n"
            'Tu' : (blanks, depth) ->
                return "\n" + blanks + "+   "
            'Lu' : (blanks, depth) ->
                return "\n" + blanks + "    "
            'To' : (blanks, depth) ->
                return "\n" + blanks + "1.   "
            'Lo' : (blanks, depth) ->
                return "\n" + blanks + "    "
            }

        # adds structure depending of the line's class
        classType = (className) ->
            #console.log className
            tab   = className.split "-"
            type  = tab[0]               # type of class (Tu,Lu,Th,Lh,To,Lo)
            depth = parseInt(tab[1], 10) # depth (1,2,3...)
            blanks = ''
            i = 1
            while i < depth - currDepth
                blanks += '    '
                i++
            return markup[type](blanks, depth)
        
        # iterates on direct children
        children = htmlCode.children()
        for i in [0..children.length-1]
            
            # fetches the i-th line of the text
            lineCode = $ children.get i
            
            # indents and structures the line
            if lineCode.attr('class')?
                markCode += classType lineCode.attr 'class'

            
            # completes the text depending of the line's content
            l = lineCode.children().length
            j = 0
            space = ' '
            while j < l
                lineElt = lineCode.children().get j
                if (j+2==l) then space='' # be sure not to insert spaces after BR
                if lineElt.nodeType == 1 && converter[lineElt.nodeName]?
                    markCode += converter[lineElt.nodeName]($ lineElt) + space
                else
                    markCode += $(lineElt).text() + space
                j++
                
            # adds a new line at the end
            markCode += "\n"
        
        return markCode

    # Reads a string of html code given by showdown
    # and turns it into our proper cozy html code.
    _md2cozy : (text) ->
        conv = new Showdown.converter()
        text = conv.makeHtml text
        # Writes the string into a jQuery object
        htmlCode = $(document.createElement 'ul').html text

        # final string
        cozyCode = ''
        
        # current line
        id = 0

        # Returns the corresponding fragment of cozy Code
        cozyTurn = (type, depth, p) ->
            # p is a (jquery) object that looks like this :
            # <p> some text <a>some link</a> again <img>some img</img> poof </p>
            # OR like this:  <li> some text <a>some link</a> ...
            # We are treating a line again, thus id must be increased
            id++
            code = ''
            p.contents().each () ->
                name = @nodeName
                if name == "#text"
                    code += "<span>#{$(@).text()}</span>"
                else if @tagName?
                    $(@).wrap('<div></div>')
                    code += "#{$(@).parent().html()}"
                    $(@).unwrap()
            return "<div id=CNID_#{id} class=#{type}-#{depth}>" + code +
                "<br></div>"
                
        # current depth
        depth = 0
        
        # Read sections sequentially
        readHtml = (obj) ->
            tag = obj[0].tagName
            if tag[0] == "H"       # c'est un titre (h1...h6)
                depth = parseInt(tag[1],10)
                cozyCode += cozyTurn("Th", depth, obj)
            else if tag == "P"     # ligne de titre
                cozyCode += cozyTurn("Lh", depth, obj)
            else
                recRead(obj, "u")
                
        # Reads recursively through the lists
        recRead = (obj, status) ->
            tag = obj[0].tagName
            if tag == "UL"
                depth++
                obj.children().each () ->
                    recRead($(@), "u")
                depth--
            else if tag == "OL"
                depth++
                obj.children().each () ->
                    recRead($(@), "o")
                depth--
            else if tag == "LI" && obj.contents().get(0)?
                # cas du <li>Un seul titre sans lignes en-dessous</li>
                if obj.contents().get(0).nodeName == "#text"
                    obj = obj.clone().wrap('<p></p>').parent()
                for i in [0..obj.children().length-1]
                    child = $ obj.children().get i
                    if i == 0
                        cozyCode += cozyTurn("T#{status}", depth, child)
                    else
                        recRead(child, status)
            else if tag == "P"
                cozyCode += cozyTurn("L#{status}", depth, obj)

        htmlCode.children().each () ->
            readHtml $ @
        
        return cozyCode
