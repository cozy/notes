Note = define 'Note', ->
    property 'title', String, index: true
    property 'content', String
    property 'creationDate', Date, default: Date
    property 'lastModificationDate', Date, default: Date
    property 'tags', [String]
    property 'tagParent', String
    property 'path', [String]
    property 'humanPath', [String]

Tree = define 'Tree', ->
    property 'type', String, default: "Note"
    property 'struct', String
    property 'lastModificationDate', Date, default: Date

# User defines user that can interact with the Cozy instance.
User = define 'User', ->
    property 'email', String, index: true
    property 'password', String
    property 'owner', Boolean, default: false
    property 'activated', Boolean, default: false
