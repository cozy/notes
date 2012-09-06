slugify = require("helpers").slugify


### Widget to easily manipulate data tree (navigation for cozy apps)
Properties :
    currentPath      = ex : /all/coutries/great_britain  ("great_britain" is the uglified name of the note)
    currentData      = data : jstree data obj sent by the select
    currentNote_uuid : uuid of the currently selected note
    widget           = @jstreeEl.jstree
    searchField      = $("#tree-search-field")
    searchButton     = $("#tree-search")
    noteFull
    jstreeEl         = $("#tree")
###

class exports.Tree
    
    ###*
    #suggestionList is a global array containing all the suggestions for the
    #autocompletion plugin
    #this array contains objects with the nature of the suggestion
    #(folder, tag, search string...) and the string corresponding to the suggestion
    ###
    suggestionList = []

        
    ###*
    #used by the .sort() method to be efficient with our structure
    ###
    _sortFunction = (a, b) ->
        if a.name > b.name
            1
        else if a.name is b.name
            0
        else if a.name < b.name
            -1

    ###*
    #this method update the array suggestionList when the user add, rename or remove
    #a node
    #input: action : neither create, rename or remove,
    #nodeName : in case of create and remove : the name of the new note or the note to remove
    # in case of rename : the new name of the note
    #oldName : only for rename : the name that will be replaced in the note
    #output : suggestionList updated
    ###
    _updateSuggestionList: (action, nodeName, oldName) ->
        if action is "create"
            #add nodeName to the autocomplete list
            object = {type: "folder", name: nodeName}
            suggestionList.push object
            suggestionList.sort(_sortFunction)   
        else if action is "rename"
            i = 0
            while suggestionList[i].name isnt oldName
                i++
            suggestionList[i].name = nodeName
            suggestionList.sort(_sortFunction)
        else if action is "remove"
            #searching the element to remove
            i = 0
            while suggestionList[i].name isnt nodeName
                i++
            #delete the element of index i in the array of suggestions
            suggestionList.splice(i,1)


    ###*
    #Initialize jsTree tree with options : sorting, create/rename/delete,
    #unique children and json data for loading.
    ###
    constructor: (navEl, data, homeViewCbk) ->
       
        jstreeEl  = $("#tree") 
        @jstreeEl = jstreeEl
        # Create toolbar inside DOM.
        navEl.prepend require('../templates/tree_buttons')

        # DOM elements of the Tree widget
        @searchField = $("#tree-search-field")
        searchField  = @searchField
        
        supprButton  = $("#suppr-button")
        @supprButton = supprButton
        
        ###*
        #Autocompletion
        #
        #this function allow to select what appears in the suggestion list while
        #the user type something in the search input
        #input : array of suggestions, current string in the search input
        #outputs : an array containing strings corresponding to suggestions 
        #depending on the searchstring
        ###
        _filterAutocomplete = (array, searchString) ->
            #the output is separated in two parts : the strings which begin with the
            #search string then the strings which contain the search string
            filteredFirst = []
            filtered = []
            #set regular expression with the characters of the search strings
            regSentence = ""
            for char in searchString
                regSentence += ".*(#{char})"
            #matches the suggestions which begin with searchString
            expFirst = new RegExp("^#{searchString}","i")
            #matches the suggestions which contain searchString
            expBold = new RegExp("([#{searchString}])","gi")
            exp = new RegExp(regSentence,"i")
            #completing and ordering the output array plus adding bold characters
            #which match the searchString
            for name in array
                if expFirst.test(name)
                    nameBold = name.replace(expBold, (match, p1) ->
                        "<span class='bold-name'>#{p1}</span>"
                    )
                    filteredFirst.push nameBold
                if exp.test(name)
                    nameBold = name.replace(expBold, (match, p1) ->
                        "<span class='bold-name'>#{p1}</span>"
                    )
                    if !(nameBold in filteredFirst)
                        filtered.push nameBold
            filteredFirst.concat(filtered)


        ###*
        #used by textext to change the render of the suggestion list
        #attach an icon to a certain type in the autocomplete list
        #input : suggestion : a string which is the suggestion, 
        #array : the array is suggestionList containing all the suggestions
        # possible and their nature
        ###
        _selectIcon = (suggestion, array) ->
            if suggestion is "\"#{searchField.val()}\""
                "<i class='icon-search icon-suggestion'></i>"
            else
                i = 0
                suggestion2 = suggestion.replace(/<.*?>/g,"")
                while suggestion2 isnt array[i].name
                    i++
                    
                #when you add a new type, please add the corresponding icon here
                switch array[i].type
                    when "folder" then "<i class='icon-folder-open icon-suggestion'></i>"
                    else ""

        ###*
        #treat the content of the input and launch the jstree search function
        ###
        searchFunction = (searchString) ->
            for string in $(".text-tag .text-label")
                searchString += "_#{string.innerHTML}"
            jstreeEl.jstree("search", searchString)



        ###*
        #Textext plugin is used to implement the autocomplete plugin
        #Please visit http://textextjs.com/ for more information about this plugin
        ###
        searchField
            .textext(
                    ###*
                    #tags: add tags to the input
                    #prompt: print Search... in the input
                    #focus: change CSS when the input has the focus
                    #autocomplete: add a suggestion list to the input
                    ###
                    plugins : 'tags prompt focus autocomplete'
                    
                    prompt : 'Search...'
                    
                    autocomplete : 
                        dropdownMaxHeight : '200px',
                        #change the render in the suggestion list (add the icons)
                        render : (suggestion) ->
                            _selectIcon(suggestion, suggestionList) + suggestion
                        
                    ###*
                    # ext allows to rewrite a textext functionality
                    ###                                                
                    ext : 
                        core:
                            ###*
                            # event that trigger when the content of the input is changing
                            ###
                            onGetFormData: (e, data, keyCode) ->
                                textInput = this.input().val()
                                data[0] = { 'input' : textInput, 'form' : textInput }
                                ###*
                                # if a tag is deleted the search function is call
                                # and if there is no tag anymore, the suppression
                                # button is hide
                                ###
                                if textInput is ""
                                    searchFunction("")
                                    if $(".text-tag .text-label")[0] is undefined
                                        supprButton.css("display","none")
                                        
                        autocomplete:
                            ###*
                            # when the user click on a suggestion (text, bold, icon or blank spot)
                            # it add a tag in the input
                            ###
                            onClick : (e) ->
                                self = this
                                target = $(e.target)
                                if(target.is('.text-suggestion') || target.is('.text-label') || target.is('.icon-suggestion') || target.is('.bold-name'))
                                    self.trigger('enterKeyPress')

                                if (self.core().hasPlugin('tags'))
                                    self.val('')
                            
                        itemManager: 
                            ###*
                            #create an array with the "name" field of a suggestion list
                            ###
                            nameField: (array) ->
                                retArray = []
                                for i in array
                                    retArray.push i.name
                                return retArray
                            ###*
                            #changing the content of a tag to avoid the view of 
                            #balises in it
                            ###
                            itemToString: (item) ->
                                if /".*"/.test(item)
                                    item = item.replace(/"(.*)"/, (str, p1) -> p1)
                                else
                                    item = item.replace(/<.*?>/g,"")
                        tags:
                            ###*
                            #change the render of a tag in case the tag is referring
                            #to what the user is typing
                            ###
                            renderTag: (tag) ->
                                self = this
                                node = $(self.opts('html.tag'))

                                node.find('.text-label').text(self.itemManager().itemToString(tag))

                                if /icon-search/.test($(".text-selected")[0].innerHTML)
                                    node.find('.text-button').addClass("tag-special")
                                    node.find('.text-button').removeClass("text-button")
                                    node.data('text-tag', tag)
                                else
                                    node.data('text-tag', tag)
                                return node

                )
            

            #every keyup(<=> getSuggestions) in the textext's input show suggestionList as a
            #autocomplete list adding a proposition of what the user is typing

            .bind(
                    'getSuggestions', (e, data) ->
                        textext = $(e.target).textext()[0]
                        query = ((if data then data.query else "")) or ""
                        #create a list with the name in the suggestion list
                        list = textext.itemManager().nameField(suggestionList)
                        #filter with the input's value
                        list = _filterAutocomplete(list, query)
                        #add what is typing the user in the list
                        list = ["\"#{searchField.val()}\""].concat(list) 
                        #move the tree in order to be visible with the dropdown open
                        treeHeight = list.length*22 + 10
                        jstreeEl.css("margin-top", treeHeight)
                        $(this).trigger "setSuggestions",
                        result: list
                )
            

            #this event trigger when the user add a tag by clicking on it or
            #pressing enter

            .bind(
                    'isTagAllowed', (e, data) ->
                        #move tree to its original place
                        jstreeEl.css("margin-top", 10)
                        #add the suppression button for the input field
                        supprButton.css("display","block")
                        #launching the searching function in jstree
                        searchFunction data.tag
                        
                )


        # Creation of the jstree
        treeData = @_convertData data
        
        # TODO BJA : to be cleaned
        data = JSON.parse(data)
        console.log "ttttttttttttt"
        console.log data
        data = {data:data}

        ###*
        #jstree is a plugin to implement the node tree
        #Please visit http://www.jstree.com/ for more information about the plugin
        ###
        @widget = @jstreeEl.jstree(
            plugins: [
                "themes", "json_data", "ui", "crrm",
                "unique", "sort", "cookies", "types",
                "hotkeys", "dnd", "search"
            ]
            json_data: data
            types:
                default:
                    valid_children: "default"
                root:
                    valid_children: null
                    delete_node: false
                    rename_node: false
                    move_node: false
                    start_drag: false
            cookies:
                save_selected: false
            ui:
                select_limit: 1
                # initially_select: [ "tree-node-all" ]
            hotkeys:
                del: false
            themes:
                theme: "default"
                dots: false
                icons: false
            core:
                animation: 0
                initially_open: [ "tree-node-all" ]
            unique:
                error_callback: (node, p, func) ->
                    alert "A note has already that name: '#{node}'"
            search:
                search_method: "jstree_contains_multi"
                show_only_matches: true
        )
    
        @setListeners( homeViewCbk )

 
    ###*
    # Bind listeners given in parameters with comment events (creation,
    # update, deletion, selection). Called by the constructor once.
    ###
    setListeners: (homeViewCbk) ->
        Tree = this

        # tree-buttons : they appear in nodes of the tree when mouseisover
        jstreeEl=@jstreeEl
        searchField = @searchField
        supprButton = @supprButton
        @progressBar = $(".bar")
        progressBar = @progressBar
        tree_buttons = $("#tree-buttons")
        # tree_buttons_root : the jstree root has only an add button
        tree_buttons_root = $("#tree-buttons-root")
        $("#tree-create").tooltip(
            placement: "bottom"
            title: "Add a note"
            )
        $("#tree-create").on "click", (e) ->
            jstreeEl.jstree("create", this.parentElement.parentElement , 0 , "New note")
            $(this).tooltip('hide')
            e.stopPropagation()
            e.preventDefault()
        $("#tree-create-root").tooltip(
            placement: "bottom"
            title: "Add a note"
            )
        $("#tree-create-root").on "click", (e) ->
            jstreeEl.jstree("create", this.parentElement.parentElement , 0 , "New note")
            $(this).tooltip('hide')
            e.stopPropagation()
            e.preventDefault()
        $("#tree-rename").tooltip(
            placement: "bottom"
            title: "Rename a note"
            )
        $("#tree-rename").on "click", (e) ->
            jstreeEl.jstree("rename", this.parentElement.parentElement)
            $(this).tooltip('hide')
            e.preventDefault()
            e.stopPropagation()
        
        ###*
        # this function remove the sons of a removed node in the suggestion list
        ###
        recursiveRemoveSuggestionList = (nodeToDelete) ->
            if nodeToDelete.children[2] is undefined
                Tree._updateSuggestionList("remove", nodeToDelete.children[1].text.replace(/\s/, ""), null)
            else
                for node in nodeToDelete.children[2].children
                    recursiveRemoveSuggestionList(node)
                Tree._updateSuggestionList("remove", nodeToDelete.children[1].text.replace(/\s/, ""), null)

        $("#tree-remove").tooltip(
            placement: "bottom"
            title: "Remove a note"
            )
        $("#tree-remove").on "click", (e) ->
            console.log "event : tree-remove.click"
            $(this).tooltip('hide')
            nodeToDelete = this.parentElement.parentElement.parentElement
            if nodeToDelete.children[2] isnt undefined
                $('#myModal').modal('show')
                $("#yes-button").on "click", (e) ->
                    console.log "event : tree-remove.click"
                    recursiveRemoveSuggestionList(nodeToDelete)
                    noteToDelete_id=nodeToDelete.id
                    if noteToDelete_id != 'tree-node-all'
                        jstreeEl.jstree("remove" , nodeToDelete)
                        homeViewCbk.onRemove noteToDelete_id                           
            else
                recursiveRemoveSuggestionList(nodeToDelete)
                noteToDelete_id=nodeToDelete.id
                if noteToDelete_id != 'tree-node-all'
                    jstreeEl.jstree("remove" , nodeToDelete)
                    homeViewCbk.onRemove noteToDelete_id
                # DO NOT CHANGE  :-)
                e.preventDefault()
                e.stopPropagation()
        

        searchField.blur ->
            jstreeEl.css("margin-top", 10)

        # add listeners for the tree-buttons appear & disappear when mouse is over/out
        tree_buttons_target = $("#nav")
        
        @widget.on "hover_node.jstree", (event, data) ->
            # event & data - check the core doc of jstree for a detailed description
            if data.rslt.obj[0].id is "tree-node-all"
                tree_buttons_root.appendTo( data.args[0] )
                tree_buttons_root.css("display","block")
            else
                tree_buttons.appendTo( data.args[0] )
                tree_buttons.css("display","block")
            
        @widget.on "dehover_node.jstree", (event, data) ->
            # event & data - check the core doc of jstree for a detailed description
            if data.rslt.obj[0].id is "tree-node-all"
                tree_buttons_root.css("display","none")
                tree_buttons_root.appendTo( tree_buttons_target )  
            else
                tree_buttons.css("display","none")
                tree_buttons.appendTo( tree_buttons_target )  

        #repositionning the input field, tree and suggestion list when the suppression
        # button is used
        textPrompt = $(".text-prompt")
        
        supprButton.click ->
            $(".text-tags").empty()
            searchField.css("padding-left", "5px")
            searchField.css("padding-top", "3px")
            textPrompt.css("padding-left", "5px")
            textPrompt.css("padding-top", "3px")
            $(".text-wrap").css("height", "22px")
            $(".text-core").css("height", "22px")
            $(".text-dropdown").css("top", "22px")
            supprButton.css("display","none")
            jstreeEl.jstree("search", "")
            

        
        # Tree
        @widget.on "create.jstree", (e, data) =>
            console.log "event : create.jstree"
            nodeName = data.inst.get_text data.rslt.obj
            @_updateSuggestionList("create", nodeName, null)
            
            parent = data.rslt.parent
            path = @_getPath parent, nodeName
            homeViewCbk.onCreate path.join("/"), data.rslt.name, data


        @widget.on "rename.jstree", (e, data) =>
            console.log "event : rename.jstree"
            newNodeName = data.rslt.new_name
            oldNodeName = data.rslt.old_name
            @_updateSuggestionList("rename", newNodeName, oldNodeName)
            if newNodeName == "all"
                $.jstree.rollback data.rlbk
            else if oldNodeName != newNodeName
                homeViewCbk.onRename data.rslt.obj[0].id, newNodeName

        @widget.on "select_node.jstree", (e, data) =>
            console.log "event : select_node.jstree"
            progressBar.css("width","60%")
            note_uuid = data.rslt.obj[0].id
            console.log "note_uuid"
            console.log note_uuid
            if note_uuid == "tree-node-all"
                path = "/all"
            else
                nodeName = data.inst.get_text data.rslt.obj
                parent = data.inst._get_parent()
                path = "/"+ data.rslt.obj[0].id + @_getSlugPath parent, nodeName
            @currentPath = path
            @currentData = data
            @currentNote_uuid = note_uuid
            @jstreeEl[0].focus()
            # homeViewCbk.onSelect path, data.rslt.obj.data("id"), data
            homeViewCbk.onSelect path, note_uuid, data
                    

        @widget.on "move_node.jstree", (e, data) =>
            console.log "event : move_node.jstree"
            nodeName = data.inst.get_text data.rslt.o
            parent = data.inst._get_parent data.rslt.o
            newPath = @_getPath parent, nodeName
            newPath.pop()
            oldParent = data.inst.get_text data.rslt.op
            parent = data.inst._get_parent data.rslt.op
            oldPath = @_getPath parent, oldParent
            oldPath.push(slugify nodeName)
            if newPath.length == 0
                $.jstree.rollback data.rlbk
            else
                homeViewCbk.onDrop newPath.join("/"), oldPath.join("/"), \
                                 nodeName, data


        @widget.on "loaded.jstree", (e, data) =>
            console.log "event : loaded.jstree"
            progressBar.css("width","20%")
            homeViewCbk.onLoaded()

    ###*
    #Select node corresponding to given path
    #if note_uuid exists in the jstree it is selected
    #otherwise if there is no seleted node, we select the root
    ###
    selectNode: (note_uuid) ->
        progressBar = @progressBar
        jstreeEl = @jstreeEl
        console.log "Tree.selectNode( #{note_uuid} )"
        progressBar.css("width","50%")
        node = $("##{note_uuid}")
        if node[0] 
            tree = jstreeEl.jstree("deselect_all", null)
            tree = jstreeEl.jstree("select_node", node)
        else if !this.widget.jstree("get_selected")[0]
            tree = jstreeEl.jstree("select_node", "#tree-node-all")


    
    #Returns path to a node for a given node.
    #data.inst is the jstree instance
    
    _getPath: (parent, nodeName) ->
        nodes = [slugify nodeName] if nodeName?

        name = "all"
        while name and parent != undefined and parent.children != undefined
            name = parent.children("a:eq(0)").text()
            nodes.unshift slugify(name)
            parent = parent.parent().parent()
        nodes
    
    
    #Return path for a node at string format.
    
    _getSlugPath: (parent, nodeName) =>
        @_getPath(parent, nodeName).join("/")
       
    
    #Convert tree coming from server to jstree format.
    #It builds the root of the tree then recursively add node to it.
    
    _convertData: (data) =>
        # root node
        tree =
            data:
                data: "all"
                attr:
                    id: "tree-node-all"
                    rel: "root"
                children: []

        @_convertNode tree.data, data.all, "-all"
        tree.data = "loading..." if tree.data.length == 0
        tree

    
    #Convert a node coming from node server to jstree format. Then convertNode
    #is called recursively on node children.
    #* parentNode is the node on which converted node will be set.
    #* noteToConvert is the node that is going to be converted
    #* idpath is the current path used to build the node DOM id. 
    
    _convertNode: (parentNode, nodeToConvert, idpath) ->
        for property of nodeToConvert when \
                property isnt "name" and property isnt "id"
            nodeIdPath = "#{idpath}-#{property.replace(/_/g, "-")}"
            @_updateSuggestionList("create", nodeToConvert[property].name, null)
            newNode =
                data: nodeToConvert[property].name
                metadata:
                    id: nodeToConvert[property].id
                attr:
                    id: nodeToConvert[property].id # TODOBJA : to improve
                    rel: "default"
                children: []
            if parentNode.children == undefined
                parentNode.data.push newNode
            else
                parentNode.children.push newNode
            @_convertNode newNode, nodeToConvert[property], nodeIdPath

