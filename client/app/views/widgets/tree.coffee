slugify = require("helpers").slugify

# Widget to easily manipulate data tree (navigation for cozy apps)
class exports.Tree

    # Initialize jsTree tree with options : sorting, create/rename/delete,
    # unique children and json data for loading.
    constructor: (navEl, data, callbacks) ->
        @setToolbar navEl

        tree = @_convertData data
        @treeEl = $("#tree")
        @widget = @treeEl.jstree
            plugins: [ "themes", "json_data", "ui", "crrm", "unique", "sort" ]
            json_data: tree
            ui:
                select_limit: 1
                initially_select: [ "tree-node-all" ]
            themes:
                theme: "default"
                dots: false
                icons: false
            core:
                animation: 0
                initially_open: ["tree-node-all" ]
            unique:
                error_callback: (node, p, func) ->
                    alert "A note has already that name: '#{node}'"

        @setListeners callbacks

    setToolbar: (navEl) ->
        navEl.prepend require('../templates/tree_buttons')

    # Bind listeners given in parameters with comment events (creation,
    # update, deletion, selection).
    setListeners: (callbacks) ->
        $("#tree-create").click =>
            @treeEl.jstree("create")
        $("#tree-rename").click =>
            @treeEl.jstree("rename")
        $("#tree-remove").click =>
            @treeEl.jstree("remove")

        @widget.bind "create.jstree", (e, data) =>
            path = @_getPath data
            path.pop()
            callbacks.onCreate path.join("/"), data.rslt.name

        @widget.bind "rename.jstree", (e, data) =>
            path = @_getStringPath data, data.rslt.old_name
            callbacks.onRename path, data.rslt.new_name

        @widget.bind "remove.jstree", (e, data) =>
            path = @_getStringPath data
            callbacks.onRemove path

        @widget.bind "select_node.jstree", (e, data) =>
            path = @_getStringPath data
            callbacks.onSelect path, data.rslt.obj.data("id")


    # Returns path to node for a given node.
    # data.inst = tree instance
    _getPath: (data, nodeName) ->
        nodeName = data.inst.get_text data.rslt.obj if nodeName == undefined
        nodes = [slugify nodeName]
        parent = data.rslt.parent
        parent = data.inst._get_parent data.rslt.obj if parent == undefined

        name = "all"
        while name and parent != undefined and parent.children != undefined
            name = parent.children("a:eq(0)").text()
            nodes.unshift slugify(name)
            parent = parent.parent().parent()
        nodes

    _getStringPath: (data, nodeName) ->
        @_getPath(data, nodeName).join("/")
       
    # Convert tree coming from server to jstree format.
    _convertData: (data) =>
        tree =
            data: []

        @_convertNode tree, data, ""
        tree.data = "loading..." if tree.data.length == 0
        tree

    # Convert a node coming from node server to jstree format. Then convertNode
    # is called recursively on node children.
    _convertNode: (parentNode, nodeToConvert, path) ->
        for property of nodeToConvert when property isnt "name" and property isnt "id"
            nodePath = "-#{path}#{property.replace(/_/g, "-")}"
            newNode =
                data: nodeToConvert[property].name
                metadata:
                    id: nodeToConvert[property].id
                attr:
                    id: "tree-node#{nodePath}"
                children: []

            if parentNode.children == undefined
                parentNode.data.push newNode
            else
                parentNode.children.push newNode

            @_convertNode newNode, nodeToConvert[property], nodePath

