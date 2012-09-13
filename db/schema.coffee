Note = define 'Note', ->
    property 'title'                , String , index: true
    property 'content'              , String
    property 'creationDate'         , Date   , default: Date
    property 'lastModificationDate' , Date   , default: Date
    property 'tags'                 , [String]
    property 'parent_id'            , String
    property 'path'                 , String  #  should be [String], but doesn't work. For the moment the array is jsonified before storage...
    property 'humanPath'            , [String]

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


###
    For the test of array storage in mongo - 
    remove only when the corresponding test ... fails
    cf /cozy-note/test/array-storage_test.coffee
###
TestArrayObj = define 'TestArrayObj', ->
    property 'title'      , String
    property 'myArrayProp', [String]
