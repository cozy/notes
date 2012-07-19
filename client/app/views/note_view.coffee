template = require('./templates/note')
cozyEditor = require('./ed_initPage').initPage

# Row displaying application name and attributes
class exports.NoteWidget extends Backbone.View
    className: "note-full"
    tagName: "div"


    ### Constructor ####

    constructor: (@model) ->
        super()

        @id = @model.slug
        @model.view = @

    remove: ->
        $(@el).remove()


    ### configuration ###
    

    render: ->
    #breadcrumb will contain the path of the selected note in a link format (<a>)
    #the code below generates the breadcrumb corresponding to the current note path
        i = 0
        breadcrumb = ""
        linkToThePath = []
        while i < @model.humanPath.split(",").length
            linkToThePath[i] = @model.humanPath.split(",")[0..i].join("/")
            path = "/#note/#{linkToThePath[i]}".toLowerCase()
            path = path.replace(/\s+/g, "-")
            linkToThePath[i] = "<a href='#{path}'> #{@model.humanPath.split(",")[i]}</a>"
            if i is 0
                breadcrumb += "#{linkToThePath[i]}"
            else
                breadcrumb += " > #{linkToThePath[i]}"
            i++
        @instEditor = cozyEditor("#note-area")
        $("#note-full-breadcrumb").html breadcrumb
        $("#note-full-title").html @model.title
        #le contenu va de la base dans les notes
        $("#note-full-content").val @model.content
        #@instEditor.editorBody$.val @model.content
 
        #params = { allowScriptAccess: "always" }
        #atts = { id: "myytplayer" }
        #swfobject.embedSWF("http://www.youtube.com/v/YAOv-KGh1qw?enablejsapi=1&playerapiid=ytplayer&version=3",
        #               "ytapiplayer", "425", "356", "8", null, null, params, atts)
        #ytplayer = document.getElementById("myytplayer")
        #
        #$("#video").click =>
        #    videoUrl = $("#video-url").val()
        #    ytplayer.cueVideoById(videoUrl, 0, "default")
        #$("a.video-timer").click (event) ->
        #    videoTimer = event.target.text.split(":")
        #    lastElem = videoTimer.length - 1
        #    minute = videoTimer[lastElem - 1]
        #    seconde = videoTimer[lastElem]
        #    if lastElem is 2
        #        hour = videoTimer[0]
        #    else
        #        hour = 0
        #    totalSeconds = parseInt(seconde) + parseInt((60*minute)) + parseInt((3600*hour))
        #    ytplayer.seekTo(totalSeconds)
        #$("#note-full-content-with-video").dblclick =>
        #    content = $("#note-full-content-with-video").html()
        #    $("#note-area").append("<textarea id='note-full-content-with-video'>#{content}</textarea>")

        @el
        
    @setEditor: (changeCallback) ->
        editor = $("textarea#note-full-content")
        editor.keyup (event) =>
            changeCallback()
        #editor = cozyEditor("#note-area").editorBody$
