define 'User', ->
    property 'email', String, index: true
    property 'password', String
    property 'activated', Boolean, default: false

Note = describe 'Note', () ->
    property 'title', String
    property 'content', String
    property 'createdAt', Date
