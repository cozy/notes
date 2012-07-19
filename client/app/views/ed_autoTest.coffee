class exports.AutoTest extends Backbone.View

    ### ------------------------------------------------------------------------
    # Checks whether the lines are well structured or not
    # Some suggestions of what could be checked out:
    #    <> each elt of lines corresponds to a DIV ------------------ (OK)
    #    <> each DIV has a matching elt in lines -------------------- (OK)
    #    <> type and depth are coherent ----------------------------- (OK)
    #    <> linePrev and LineNext are linked to the correct DIV ----- (OK)
    #    <> hierarchy of lines and indentation are okay ------------- (OK)
    #    <> a DIV contains a sequence of SPAN ended by a BR --------- (OK)
    #    <> two successive SPAN can't have the same class ----------- (OK)
    #    <> empty SPAN are really empty (<span></span>) ------------- (huh?)
    #    <> a note must  have at least one line --------------------- (todo)
    ###
    checkLines : (CNEditor) ->
        
        console.log 'Detecting incoherences...'
        # We represent the lines architecture with a tree to depth-first
        # explore it. The virtual root is at depth 0 and its sons are the titles
        # located at depth 1.
        #     Internal nodes = titles (Th, Tu, To)
        #     Leaves         = lines  (Lh, Lu, Lo)
        # An internal node T-n can only have T-(n+1) or L-n children
        # A To (resp Tu, Th) can only have Lo (resp Lu, Lh) lines
        # A To/Tu can't be the father of a Th
        
        #     Utility functions
        # 
        # Defines what type of children a node can have
        # only useful for the structure's verification
        possibleSon = {
            "Th": (name) ->
                return name=="Lh" || name=="Th" || name=="To" || name=="Tu"
            "Tu": (name) ->
                return name=="Lu" || name=="To" || name=="Tu"
            "To": (name) ->
                return name=="Lo" || name=="To" || name=="Tu"
            "Lh": (name) ->
                return false
            "Lu": (name) ->
                return false
            "Lo": (name) ->
                return false
            "root": (name) ->
                return true
            }
        # Returns whether the DIV is a line or a title
        nodeType = (name) ->
            if name=="Lh" || name=="Lu" || name=="Lo"
                return "L"
            else if name=="Th" || name=="Tu" || name=="To"
                return "T"
            else
                return "ERR"
        # Returns the ID of a line
        id = (line) ->
            if line == null
                return -1
            else
                return parseInt(line.lineID.split("_")[1], 10)
        
        # We are going to represent the DIVs with a tree, hence we need to 
        # create a virtual root (right before the first line).
        rootLine =
            lineType: "root"
            lineID: "CNID_0"
            lineNext: CNEditor._lines["CNID_1"] # should be _firstLine instead
            linePrev: null
            lineDepthAbs: 0

        # A node object is a ptr to a line and an array of sons
        node = (line, sons)->
            line: line
            sons: sons
        root = new node(rootLine, [])
        
        # Array of nodes: the n-th element is the last depth-n ancestor met
        myAncestor = [root]
        
        # Elements of the lines list
        prevLine = null
        currentLine = rootLine
        nextLine = rootLine.lineNext
        
        # Reads all the way through lines and tests their structure's legacy
        # While doing this, it also builds a tree from the DIVs list by
        # appending the property ".sons" to every line that is a non-empty title
        # It will be easier to check the remaining properties with a tree indeed
        while nextLine != null
            
            type  = nodeType(nextLine.lineType)
            depth = nextLine.lineDepthAbs
            
            # First we check the line's legacy
                
            element = CNEditor.editorBody$.children("#"+nextLine.lineID)
                        
            if element == null
                console.log "ERROR: invalid line #{nextLine.lineID}\n (#{nextLine.lineType}-#{nextLine.lineDepthAbs} has no matching DIV)"
                return
            
            # a DIV contains a sequence of SPAN ended by a BR -----------(OK)
            children = element.children()
            
            # a DIV has at least a span/a/img then a br
            if children == null or children.length < 2
                console.log "ERROR: invalid line #{nextLine.lineID}\n (#{nextLine.lineType}-#{nextLine.lineDepthAbs} content is too short)"
                return
            lastClass = undefined
            i = 0
            while i < children.length-1
                child = children.get i
                # two successive SPAN can't have the same class ---------(OK)
                if child.nodeName == 'SPAN'
                    if $(child).attr('class')?
                        if lastClass == $(child).attr('class')
                            console.log "ERROR: invalid line #{nextLine.lineID}\n (#{nextLine.lineType}-#{nextLine.lineDepthAbs} two consecutive SPAN with same class #{lastClass})"
                            return
                        else
                            lastClass = $(child).attr('class')
                else if child.nodeName == 'A' or child.nodeName == 'IMG'
                    lastClass = undefined
                else
                    console.log "ERROR: invalid line #{nextLine.lineID}\n (#{nextLine.lineType}-#{nextLine.lineDepthAbs} invalid label #{child.nodeName})"
                    return
                i++
                    
            child = children.get(children.length-1)
            if child.nodeName != 'BR'
                console.log "ERROR: invalid line #{nextLine.lineID}\n (#{nextLine.lineType}-#{nextLine.lineDepthAbs} must end with BR)"
                return

            # Then we add it to the tree
            newNode = new node(nextLine, [])
            if type == "T"       # internal node
                # updates the ancestors
                if depth > myAncestor.length
                    console.log "ERROR: invalid line #{nextLine.lineID}\n (#{nextLine.lineType}-#{nextLine.lineDepthAbs} indentation issue)"
                    return
                else if depth == myAncestor.length
                    myAncestor.push(newNode)
                else
                    myAncestor[depth] = newNode
                # adds title to the tree
                
                if myAncestor[depth-1] == null
                    console.log "ERROR: invalid line #{nextLine.lineID}"
                    return
                else
                    myAncestor[depth-1].sons.push(newNode)
                
            else if type == "L"  # leaf
                # adds line to the tree
                if depth >= myAncestor.length
                    console.log "ERROR: invalid line #{nextLine.lineID}\n (#{nextLine.lineType}-#{nextLine.lineDepthAbs} indentation issue)"
                    return
                else
                    myAncestor[depth+1] = null
                    
                if myAncestor[depth] == null
                    console.log "ERROR: invalid line #{nextLine.lineID}"
                    return
                else
                    myAncestor[depth].sons.push(newNode)
            # goes to the next node
            prevLine = currentLine
            currentLine = nextLine
            nextLine = currentLine.lineNext
        
        # Is there a line object corresponding to each DIV ? ----------- (OK)
        objDiv = CNEditor.editorBody$.children("div")
        objDiv.each () ->
            if $(@).attr('id')?
                myId = $(@).attr('id')
                if /CNID_[0-9]+/.test myId
                    if ! CNEditor._lines[myId]?
                        console.log "ERROR: missing line " + myId
                        return
        
        
        # Our tree is finished; now we can recursively check it
        recVerif = (node) ->
            if node.sons.length > 0
                for i in [0..node.sons.length-1]
                    child = node.sons[i]
                    
                    # Hierarchy verification
                    if ! possibleSon[node.line.lineType](child.line.lineType)
                        console.log "ERROR: invalid line #{child.line.lineID}\n (hierarchic issue of a #{child.line.lineType}-#{child.line.lineDepthAbs})"
                        return false
                        
                    # Depth verification
                    if nodeType(child.line.lineType) == "T"
                        if node.line.lineDepthAbs+1 != child.line.lineDepthAbs
                            console.log "ERROR: invalid line #{child.line.lineID}\n (indentation issue of a #{child.line.lineType}-#{child.line.lineDepthAbs})"
                            return false
                        if ! recVerif(child)
                            return false
                    else if nodeType(child.line.lineType) == "L"
                        if node.line.lineDepthAbs != child.line.lineDepthAbs
                            console.log "ERROR: invalid line #{child.line.lineID}\n (indentation issue of a #{child.line.lineType}-#{child.line.lineDepthAbs})"
                            return false
                            
            return true

        success = recVerif(root)
        if success
            console.log "everything seems ok !"

        return success
