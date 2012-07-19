# Reads a string that represents html code in our cozy format and turns it into
# what I call the "normal" markdown format

class exports.CNcozyToMarkdown extends Backbone.View
    
    translate: (text) ->
        
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
