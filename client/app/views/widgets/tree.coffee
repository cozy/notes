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

    setListeners: (callbacks) ->
        $("#tree-create").click =>
            @treeEl.jstree("create")
        $("#tree-rename").click =>
            @treeEl.jstree("rename")
        $("#tree-remove").click =>
            @treeEl.jstree("remove")

        @widget.bind "create.jstree", (e, data) =>
            path = @_getPath data
            callbacks.onCreate path

        @widget.bind "rename.jstree", (e, data) =>
            path = @_getPath data, data.rslt.old_name
            callbacks.onRename path, data.rslt.new_name

        @widget.bind "remove.jstree", (e, data) =>
            path = @_getPath data
            callbacks.onRemove path



    # data.inst = tree instance
    _getPath: (data, nodeName) ->
        if nodeName == undefined
            nodeName = data.inst.get_text data.rslt.obj
        nodes = [slugify nodeName]
        parent = data.rslt.parent
        if parent == undefined # rename does not load parent
            parent = data.inst._get_parent data.rslt.obj

        name = "start"
        while name and parent != undefined and parent.children != undefined
            name = parent.children("a:eq(0)").text()
            nodes.unshift slugify(name)
            parent = parent.parent().parent()

        "#{nodes.join("/")}"
       

    _convertData: (data) =>
        tree =
            data: []

        @_convertNode tree, data
        tree.data = "loading..." if tree.data.length == 0
        tree

    _convertNode: (parentNode, nodeToConvert) ->
        for property of nodeToConvert
            newNode =
                data: property
                attr:
                    id: "tree-node-#{property}"
                children: []

            if parentNode.children == undefined
                parentNode.data.push newNode
            else
                parentNode.children.push newNode
            @_convertNode newNode, nodeToConvert[property]

