# Reads a string of html code given by (a slightly modified) showdown
# and turns it into our proper cozy html code.

class exports.CNmarkdownToCozy extends Backbone.View

    translate: (text) ->

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
