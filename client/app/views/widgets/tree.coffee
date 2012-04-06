# Widget to easily manipulate data tree (navigation for cozy apps)
class exports.Tree

    constructor: (treeElement, data, callbacks) ->
        treeElement.prepend require('../templates/tree_buttons')

        tree = @convertData data
        @treeEl = $("#tree")
        @t = @treeEl.jstree
            plugins: [ "themes", "json_data", "ui", "crrm", "dnd" ]
            json_data: tree
            themes:
                theme: "default"
                dots: false
                icons: false
            core:
                animation: 0
        @t.bind "create.jstree", (e, data) =>
            path = @_getPath data
            callbacks.onCreate path

        @t.bind "rename.jstree", (e, data) =>
            path = @_getPath data
            callbacks.onRename path

        @t.bind "remove.jstree", (e, data) =>
            path = @_getPath data
            callbacks.onRemove path

        @setListeners()
#        $(document).click (event) =>
#            if $(event.target).parents('.tree:eq(0)').size() == 0
#              alert $("#tree").jstree("selected_arr")
#              $.each $("#tree").jstree("selected_arr"), (i, val) ->
#                $("#tree").jstree("deselect_branch", [val])

    setListeners: ->
        $("#tree-create").click =>
            @treeEl.jstree("create")
        $("#tree-rename").click =>
            @treeEl.jstree("rename")
        $("#tree-remove").click =>
            @treeEl.jstree("remove")


    _getPath: (data) ->
        nodes = [@slugify data.rslt.name]
        parent = data.inst._get_parent(data.rslt.obj)

        if parent != undefined and parent.children != undefined
            name = parent.children("a:eq(0)").text()
            nodes.unshift @slugify(name)

            i = 0
            while name and parent.parent() != undefined \
                  and parent.parent().parent() != undefined \
                  and i < 10
                parent = parent.parent().parent()
                i++
                if parent != undefined and parent.children != undefined
                    name = parent.children("a:eq(0)").text()
                    nodes.unshift @slugify(name)

        if nodes.length > 1
            nodes.join("/")
        else
            "/#{nodes.join("/")}"

    convertData: (data) =>
        tree =
            data: []

        @convertNode tree, data

        tree.data = "loading..." if tree.data.length == 0
        tree

    convertNode: (parentNode, node) ->
        for property of node
            newNode =
                data: property
                children: []

            if parentNode.children == undefined
                parentNode.data.push newNode
            else
                parentNode.children.push newNode
            @convertNode newNode, node[property]


    slugify: (s) ->
        _slugify_strip_re = /[^\w\s-]/g
        _slugify_hyphenate_re = /[-\s]+/g
        s = s.replace(_slugify_strip_re, '').trim().toLowerCase()
        s = s.replace _slugify_hyphenate_re, '-'
        s
