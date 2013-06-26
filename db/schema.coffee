# path should be a [String], but didn't work with mongo
# For the moment the array is jsonified before storage...
# @TODO remove serialization

Note = define 'Note', ->
    property 'title'                , String , index: true
    property 'content'              , String
    property 'creationDate'         , Date   , default: Date
    property 'lastModificationDate'    , Date   , default: Date
    property 'lastModificationValueOf' , Number, default: -> (new Date()).getTime()
    property 'tags'                 , [String]
    property 'parent_id'            , String
    property 'path'                 , Object #should be [String], but retrocompatibility
    property 'humanPath'            , [String]
    property '_attachments'         , Object
    property 'version'              , String

Tree = define 'Tree', ->
    property 'type'                 , String  , default: "Note"
    property 'struct'               , String
    property 'lastModificationDate' , Date    , default: Date

# User defines user that can interact with the Cozy instance.
User = define 'User', ->
    property 'email'     , String , index: true
    property 'password'  , String
    property 'owner'     , Boolean, default: false
    property 'activated' , Boolean, default: false

