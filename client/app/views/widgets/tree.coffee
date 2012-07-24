slugify = require("helpers").slugify

# Widget to easily manipulate data tree (navigation for cozy apps)
class exports.Tree


    # Initialize jsTree tree with options : sorting, create/rename/delete,
    # unique children and json data for loading.
    constructor: (navEl, data, callbacks) ->
        @setToolbar navEl


        #Autocomplete
        @searchField = $("#tree-search-field")
        @searchButton = $("#tree-search")
        @noteFull = $("#note-full")
        @searchField.autocomplete(
                source: []
                autoFocus: true
            )

        # Creation of the tree with jstree
        tree = @_convertData data
        console.log data
        console.log tree
        @treeEl = $("#tree")
        @widget = @treeEl.jstree(
            plugins: [
                "themes", "json_data", "ui", "crrm",
                "unique", "sort", "cookies", "types",
                "hotkeys", "dnd", "search"
            ]
            json_data: tree
            types:
                "default":
                    valid_children: "default"
                "root":
                    valid_children: null
                    delete_node: false
                    rename_node: false
                    move_node: false
                    start_drag: false
            ui:
                select_limit: 1
                initially_select: [ "tree-node-all" ]
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
    
        @setListeners( callbacks )

    # Create toolbar inside DOM.
    setToolbar: (navEl) ->
        navEl.prepend require('../templates/tree_buttons')
            
    organizeArray: (array)->
        i = array.length-1
        tmp = ""
        while i isnt 0 and array[i] < array[i-1]
            tmp = array[i]
            array[i] = array[i-1]
            array[i-1] = tmp
            i--
 
    # Bind listeners given in parameters with comment events (creation,
    # update, deletion, selection).
    setListeners: (callbacks) ->

        # Toolbar
        $("#tree-create").click =>
            @treeEl.jstree("create")
        $("#tree-rename").click =>
            @treeEl.jstree("rename")
        #$("#note-full-title").blur =>
        #    newName = $("#note-full-title").val()
        #    path = mouahah
        #    callbacks.onRenameNoReselect(path, newName)
        #    @treeEl.jstree("rename")
        $("#tree-remove").click =>
            @treeEl.jstree("remove")
        $("#searchInfo").hide()
        @searchField.keyup @_onSearchChanged
        # TODO : this event occures many many times when in the tree : not the best way
        # to add the tree-buttons
        $("#tree").mouseover @_addButton

        # Tree
        @widget.bind "create.jstree", (e, data) =>
            nodeName = data.inst.get_text data.rslt.obj
            completeSource =  @searchField.autocomplete( "option", "source")
            completeSource.push nodeName
            @organizeArray completeSource
            @searchField.autocomplete( "option", "source", completeSource)
            parent = data.rslt.parent
            path = @_getPath parent, nodeName
            path.pop()
            idPath = "tree-node#{@_getPath(parent, nodeName).join("-")}"
            data.rslt.obj.attr "id", idPath
            callbacks.onCreate path.join("/"), data.rslt.name, data

        @widget.bind "rename.jstree", (e, data) =>
            nodeName = data.inst.get_text data.rslt.obj
            parent = data.inst._get_parent data.rslt.parent
            path = @_getStringPath parent, data.rslt.old_name
            if path == "all"
                $.jstree.rollback data.rlbk
            else if data.rslt.old_name != data.rslt.new_name
                completeSource =  @searchField.autocomplete( "option", "source")
                i = 0
                while completeSource[i] isnt data.rslt.old_name
                    i++
                while i isnt completeSource.length-1
                    completeSource[i] = completeSource[i+1]
                    completeSource[i+1] = completeSource[i]
                    i++
                completeSource[i] = data.rslt.new_name
                @organizeArray completeSource
                @searchField.autocomplete( "option", "source", completeSource)
                idPath = "tree-node#{@_getPath(parent, nodeName).join("-")}"
                data.rslt.obj.attr "id", idPath
                @rebuildIds data, data.rslt.obj, idPath
                callbacks.onRename path, data.rslt.new_name, data          

        @widget.bind "remove.jstree", (e, data) =>
            nodeName = data.inst.get_text data.rslt.obj
            completeSource =  @searchField.autocomplete( "option", "source")
            i = 0
            while completeSource[i] isnt nodeName
                i++
            while i isnt completeSource.length-1
                completeSource[i] = completeSource[i+1]
                completeSource[i+1] = completeSource[i]
                i++           
            completeSource.pop()
            @searchField.autocomplete( "option", "source", completeSource)
            parent = data.rslt.parent
            path = @_getStringPath parent, nodeName
            if path == "all"
                $.jstree.rollback data.rlbk
            else
                callbacks.onRemove path

        @widget.bind "select_node.jstree", (e, data) =>
            nodeName = data.inst.get_text data.rslt.obj
            parent = data.inst._get_parent data.rslt.parent
            path = @_getStringPath parent, nodeName
            callbacks.onSelect path, data.rslt.obj.data("id")
                    
        @widget.bind "move_node.jstree", (e, data) =>
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
                callbacks.onDrop newPath.join("/"), oldPath.join("/"), data

        @widget.bind "loaded.jstree", (e, data) =>
            callbacks.onLoaded()

        
        @widget.bind "search.jstree", (e, data, searchString) =>
        #    for note in data.rslt.nodes
        #        nodeName = data.inst.get_text note
        #        parent = data.inst._get_parent note
        #        path = @_getStringPath parent, nodeName
        #        currentNote = data.inst._get_node note
        #        #PROBLEME ICI une seule note s'affiche (la dernière)
        #        callbacks.onSelect path, currentNote.data("id")
                

    # Rebuild ids of obj children. 
    rebuildIds: (data, obj, idPath) ->
        for child in data.inst._get_children obj
            newIdPath = idPath + "-" + slugify($(child).children("a:eq(0)").text())
            $(child).attr "id", newIdPath
            @rebuildIds data, child, newIdPath


    # Select node corresponding to given path
    selectNode: (path) ->
        nodePath = path.replace(/\//g, "-")
        node = $("#tree-node-#{nodePath}")
        
        tree = $("#tree").jstree("deselect_all", null)
        tree = $("#tree").jstree("select_node", node)


    # Returns path to a node for a given node.
    # data.inst is the js tree instance
    _getPath: (parent, nodeName) ->
        nodes = [slugify nodeName] if nodeName?

        name = "all"
        while name and parent != undefined and parent.children != undefined
            name = parent.children("a:eq(0)").text()
            nodes.unshift slugify(name)
            parent = parent.parent().parent()
        nodes

    # Return path for a node at string format.
    _getStringPath: (parent, nodeName) =>
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
            completeSource =  @searchField.autocomplete( "option", "source")
            completeSource.push nodeToConvert[property].name
            @organizeArray completeSource
            @searchField.autocomplete( "option", "source", completeSource)
            #@addButton "#tree a"
            newNode =
                data: nodeToConvert[property].name
                metadata:
                    id: nodeToConvert[property].id
                attr:
                    id: "tree-node#{nodeIdPath}"
                    rel: "default"
                children: []
            if parentNode.children == undefined
                parentNode.data.push newNode
            else
                parentNode.children.push newNode
            @_convertNode newNode, nodeToConvert[property], nodeIdPath

    # When search button is clicked, quick search input is displayed or hidden
    # (reverse state). If quick search is displayed, the focus goes on it.
    #_onSearchClicked: (event) =>
    #    if @searchField.is(":hidden")
    #        @searchField.show()
    #        @searchField.focus()
    #        @searchButton.addClass("button-active")
    #    else
    #        @searchField.hide()
    #        @searchButton.removeClass("button-active")

    searchTimer: null

    # When quick search changes, the jstree quick search function is run with
    # input val as argument.
    _onSearchChanged: (event) =>
        searchString = @searchField.val()
        info = "Recherche: \"#{searchString}\""
        clearTimeout @searchTimer
        if searchString is ""
            $("#searchInfo").hide()
            $("#tree").jstree("search", searchString)
            console.log @noteOldTop
            $("#note-full").css("top", "10px")
        else
            @searchTimer = setTimeout(->
                $("#tree").jstree("search", searchString)
                $("#searchInfo").html info
                if $("#searchInfo").is(":hidden")
                    $("#searchInfo").show()
                #    #24 represents the size of the margin from the searchInfo
                    if @noteNewTop is undefined
                        @noteOldTop = parseInt($("#note-full").css("top"))
                        @noteNewTop = parseInt($("#note-full").css("top")) + parseInt($("#searchInfo").css("height")) + 24
                    console.log @noteNewTop
                    console.log @noteOldTop
                    $("#note-full").css("top", @noteNewTop)
            , 1000) 

    _addButton: (event) ->
        # TODO : these listeners should be set when the node is created in the tree.
        # console.log '#tree.mouseover'
        $("#tree a").mouseover (e) ->
            # console.log '#tree a .mouseover'
            # root = $("#tree-node-all")
            #if e.target isnt root

            # leftPosition1 = root.offset().left + root.width() - 60
            # $("#tree-buttons").css
            #     position: "absolute"
            #     left: leftPosition1
            #     top: e.target.offsetTop

            $("#tree-buttons").appendTo( this )
            $("#tree-buttons").show()
        $("#tree").mouseleave ->
            # TODO : this event occurs several times when the mouse
            # leaves the tree (?? shouldn't this hapen only once ??)
            # besides it hapens when the mouse goes over the tree-buttons
            # => not the best way to remove the tree-buttons ...
            # console.log 'tree.mouseleave'
            $("#tree-buttons").hide()
