slugify = require("helpers").slugify


### Widget to easily manipulate data tree (navigation for cozy apps)
Properties :
    currentPath      = ex : /all/coutries/great_britain  ("great_britain" is the uglified name of the note)
    currentData      = data : jstree data obj sent by the select
    currentNote_uuid : uuid of the currently selected note
    widget 
    searchField      = $("#tree-search-field")
    searchButton     = $("#tree-search")
    noteFull
    jstreeEl         = $("#tree")
###

class exports.Tree

    #array for the autocompletion
    suggestionList = []
    
    cozyFilter = (array, searchString) ->
        filteredFirst = []
        filtered = []
        regSentence = ""
        for char in searchString
            regSentence += ".*(#{char})"
        expFirst = new RegExp("^#{searchString}","i")
        expBold = new RegExp("([#{searchString}])","gi")
        exp = new RegExp(regSentence,"i")
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
 
    #for .sort() method (array)
    sortFunction = (a, b) ->
        if a.name > b.name
            1
        else if a.name is b.name
            0
        else if a.name < b.name
            -1
    
    updateSuggestionList: (action, nodeName, oldName) ->
        if action is "create"
            #add nodeName to the autocomplete list
            object = {type: "folder", name: nodeName}
            suggestionList.push object
            suggestionList.sort(sortFunction)   
        else if action is "rename"
            console.log "ICI MODAFAKA"
            # searching the targeted node to change his name  TODOBJA : autocomplétion : à revoir
            i = 0
            while suggestionList[i].name isnt oldName
                i++
            suggestionList[i].name = nodeName
            suggestionList.sort(sortFunction)
        else if action is "remove"
            #searching the element to remove
            i = 0
            while suggestionList[i].name isnt nodeName
                i++
            #delete the element of index i in the array of suggestions
            suggestionList.splice(i,i)
            
    ###*
    # Initialize jsTree tree with options : sorting, create/rename/delete,
    # unique children and json data for loading.
    ###
    constructor: (navEl, data, homeViewCbk) ->
        
        # Create toolbar inside DOM.
        navEl.prepend require('../templates/tree_buttons')

        #Autocomplete
        @searchField = $("#tree-search-field")
        @searchButton = $("#tree-search")
        @noteFull = $("#note-full")

        #attach an icon to a type of the elements in the autocomplete list
        selectIcon = (suggestion, array) ->
            if suggestion is "\"#{$("#tree-search-field").val()}\""
                "<i class='icon-search'></i>"
            else
                i = 0
                suggestion2 = suggestion.replace(/<.*?>/g,"")
                while suggestion2 isnt array[i].name
                    i++
                #when you add a new type, please add the corresponding icon here
                switch array[i].type
                    when "folder" then "<i class='icon-folder-open'></i>"
                    else ""

        $("#tree-search-field")
            .textext(
                    #add ajax for database search
                    plugins : 'tags prompt focus autocomplete'
                    prompt : 'Search...'
                    #ajax :
                    #    url : '/manual/examples/data.json'
                    #    dataType : 'json'
                    #    cacheResults : true
                    autocomplete : 
                        dropdownMaxHeight : '200px',

                        render : (suggestion) ->
                            selectIcon(suggestion, suggestionList) + suggestion
                            
                    ext : 
                        itemManager: 
                            nameField: (array) ->
                                retArray = []
                                for i in array
                                    retArray.push i.name
                                retArray
                            itemToString: (item) ->
                                if /".*"/.test(item)
                                    item = item.replace(/"(.*)"/, (str, p1) -> p1)
                                else
                                    item = item.replace(/<.*?>/g,"")
                        tags:
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
                        list = textext.itemManager().nameField(suggestionList)
                        list = cozyFilter(list, query)
                        list = ["\"#{$("#tree-search-field").val()}\""].concat(list) 
                        $(this).trigger "setSuggestions",
                        result: list
                )

        # Creation of the jstree
        treeData = @_convertData data
        @jstreeEl = $("#tree")
        @widget = @jstreeEl.jstree(
            plugins: [
                "themes", "json_data", "ui", "crrm",
                "unique", "sort", "cookies", "types",
                "hotkeys", "dnd", "search"
            ]
            json_data: treeData
            types:
                "default":
                    valid_children: "default"
                "root":
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
                show_only_matches: true
        )
    
        @setListeners( homeViewCbk )

 

    # Bind listeners given in parameters with comment events (creation,
    # update, deletion, selection). Called by the constructor once.
    setListeners: (homeViewCbk) ->
        Tree = this

        # tree-buttons : they appear in nodes of the tree when mouseisover
        jstreeEl=@jstreeEl
        tree_buttons = $("#tree-buttons")
        $("#tree-create").on "click", (e) ->
            jstreeEl.jstree("create", this.parentElement.parentElement , 0 , "New note")
            e.stopPropagation()
            e.preventDefault()
        $("#tree-rename").on "click", (e) ->
            jstreeEl.jstree("rename", this.parentElement.parentElement)
            e.preventDefault()
            e.stopPropagation()
        $("#note-full-title").live("keypress", (e) -> #TODO BJA : à déplacer ds note_view !!!
            if e.keyCode is 13
                $("#note-full-title").trigger "blur"  # rq BJA : étonnement pas besoin de preventDefault, bizare
            )
        

        $("#tree-remove").on "click", (e) ->
            console.log "event : tree-remove.click"
            nodeToDelete = this.parentElement.parentElement.parentElement
            Tree.updateSuggestionList("remove", this.parentElement.parentElement.text.replace(/\s/, ""), null)
            noteToDelete_id=nodeToDelete.id
            if noteToDelete_id != 'tree-node-all'
                jstreeEl.jstree("remove" , nodeToDelete)
                homeViewCbk.onRemove noteToDelete_id
            
            # DO NOT CHANGE  :-)
            e.preventDefault()
            e.stopPropagation()
        #$("#tree-search-field").keyup @_onSearchChanged


        # add listeners for the tree-buttons appear & disappear when mouse is over/out
        tree_buttons_target = $("#nav")
        @widget.on "hover_node.jstree", (event, data) ->
            # event & data - check the core doc of jstree for a detailed description
            tree_buttons.appendTo( data.args[0] )
            tree_buttons.css("display","block")
        @widget.on "dehover_node.jstree", (event, data) ->
            # event & data - check the core doc of jstree for a detailed description
            tree_buttons.css("display","none")
            tree_buttons.appendTo( tree_buttons_target )

        $("#suppr-button").click =>
            $(".text-tags").empty()
            $("#tree-search-field").css("padding-left", "5px")
            $("#tree-search-field").css("padding-top", "3px")
            $(".text-prompt").css("padding-left", "5px")
            $(".text-prompt").css("padding-top", "3px")
            $(".text-wrap").css("height", "22px")
            $(".text-core").css("height", "22px")

        
        # Tree
        @widget.on "create.jstree", (e, data) =>
            console.log "event : create.jstree"
            nodeName = data.inst.get_text data.rslt.obj
            @updateSuggestionList("create", nodeName, null)
            
            parent = data.rslt.parent
            path = @_getPath parent, nodeName
            homeViewCbk.onCreate path.join("/"), data.rslt.name, data


        @widget.on "rename.jstree", (e, data) =>
            console.log "event : rename.jstree"
            newNodeName = data.rslt.new_name
            oldNodeName = data.rslt.old_name
            @updateSuggestionList("rename", newNodeName, oldNodeName)
            if newNodeName == "all"
                $.jstree.rollback data.rlbk
            else if oldNodeName != newNodeName
                homeViewCbk.onRename data.rslt.obj[0].id, newNodeName

        @widget.on "select_node.jstree", (e, data) =>
            console.log "event : select_node.jstree"
            note_uuid = data.rslt.obj[0].id
            if note_uuid == "tree-node-all"
                path = "/all"
            else
                nodeName = data.inst.get_text data.rslt.obj
                parent = data.inst._get_parent data.rslt.parent
                path = "/"+ data.rslt.obj[0].id + @_getSlugPath parent, nodeName
            @currentPath = path
            @currentData = data
            @currentNote_uuid = note_uuid
            homeViewCbk.onSelect path, data.rslt.obj.data("id")
                    

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
            homeViewCbk.onLoaded()

    # Select node corresponding to given path
    # if note_uuid exists in the jstree it is selected
    # otherwise if there is no seleted node, we select the root
    selectNode: (note_uuid) ->
        console.log "Tree.selectNode( #{note_uuid} )"
        node = $("##{note_uuid}")
        if node[0] 
            tree = $("#tree").jstree("deselect_all", null)
            tree = $("#tree").jstree("select_node", node)
        else if !this.widget.jstree("get_selected")[0]
            tree = $("#tree").jstree("select_node", "#tree-node-all")



    # Returns path to a node for a given node.
    # data.inst is the jstree instance
    _getPath: (parent, nodeName) ->
        nodes = [slugify nodeName] if nodeName?

        name = "all"
        while name and parent != undefined and parent.children != undefined
            name = parent.children("a:eq(0)").text()
            nodes.unshift slugify(name)
            parent = parent.parent().parent()
        nodes

    # Return path for a node at string format.
    _getSlugPath: (parent, nodeName) =>
        @_getPath(parent, nodeName).join("/")
       
    # Convert tree coming from server to jstree format.
    # It builds the root of the tree then recursively add node to it.
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

    # Convert a node coming from node server to jstree format. Then convertNode
    # is called recursively on node children.
    # * parentNode is the node on which converted node will be set.
    # * noteToConvert is the node that is going to be converted
    # * idpath is the current path used to build the node DOM id. 
    _convertNode: (parentNode, nodeToConvert, idpath) ->
        for property of nodeToConvert when \
                property isnt "name" and property isnt "id"
            nodeIdPath = "#{idpath}-#{property.replace(/_/g, "-")}"
            @updateSuggestionList("create", nodeToConvert[property].name, null)
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


    searchTimer: null

    # When quick search changes, the jstree quick search function is run with
    # input val as argument.
    _onSearchChanged: (event) =>
        searchString = $(".text-tag .text-label")[0].innerHTML
        #searchString = $("#tree-search-field").val()
        clearTimeout @searchTimer
        if searchString is ""
            $("#tree").jstree("search", searchString)
        else
            @searchTimer = setTimeout(->
            $("#tree").jstree("search", searchString)
            , 1000) 
