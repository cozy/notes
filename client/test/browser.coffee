exports.Browser = require("zombie").Browser


exports.Browser.prototype.isVisible = (selector) ->
    @evaluate "$('#{selector}').is(':visible')"
    
exports.Browser.prototype.click = (selector) ->
        @evaluate "$('#{selector}').click()"

exports.Browser.prototype.hasClass = (selector, className) ->
        @evaluate "$('#{selector}').hasClass('#{className}')"

exports.Browser.prototype.keyUp = (selector) ->
        @evaluate "$('#{selector}').keyup()"

exports.Browser.prototype.html = (selector) ->
        @evaluate "$('#{selector}').html()"

exports.Browser.prototype.enterKeyUp = (selector) ->
        @evaluate "e = jQuery.Event('keyup')"
        @evaluate "e.which = $.ui.keyCode.ENTER"
        @evaluate "$('.jstree-rename-input').trigger(e)"

