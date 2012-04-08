Note = define 'Note', ->
    property 'title', String, index: true
    property 'content', String
    property 'creationDate', Date, default: Date
    property 'lastModificationDate', Date, default: Date
    property 'content': String
    property 'tags', [String]
    property 'tagParent', String
    property 'path', String

Tree = define 'Tree', ->
    property 'type', String, default: "Note"
    property 'struct', String
    property 'lastModificationDate', Date, default: Date


