exports.config =
  # Edit the next line to change default build path.
  config:
      paths:
          public: 'public'


  files:
    javascripts:
      # Defines what file will be generated with `brunch generate`.
      defaultExtension: 'coffee'
      # Describes how files will be compiled & joined together.
      # Available formats:
      # * 'outputFilePath'
      # * map of ('outputFilePath': /regExp that matches input path/)
      # * map of ('outputFilePath': function that takes input path)
      joinTo:
        'javascripts/app.js': /^app/
        'javascripts/vendor.js': /^vendor/
      # Defines compilation order.
      # `vendor` files will be compiled before other ones
      # even if they are not present here.
      order:
        before: [
          'vendor/scripts/console-helper.js'
          'vendor/scripts/jquery-1.7.1.js'
          'vendor/scripts/jquery-ui-1.8.21.custom.min.js'
          'vendor/scripts/underscore-1.4.4.js'
          'vendor/scripts/backbone-1.0.0.js'
          'vendor/scripts/jquery.jstree.js'
          'vendor/scripts/jquery.layout-1.3.0.rc30.6.js'
          'vendor/scripts/ckeditor.js'
          'vendor/scripts/rangy-core.js'
          'vendor/scripts/rangy-selectionsaverestore-uncompressed.js'
          'vendor/scripts/validator.js'
        ]

    stylesheets:
      defaultExtension: 'styl'
      joinTo: 'stylesheets/app.css'
      order:
        before: [
            'vendor/styles/normalize.css'
            'vendor/styles/bootstrap.css'
            'vendor/styles/layout-default.css'
        ]
        after: [
            'vendor/styles/helpers.css'
        ]

    templates:
      defaultExtension: 'jade'
      joinTo: 'javascripts/app.js'


  # Change this if you're using something other than backbone (e.g. 'ember').
  # Content of files, generated with `brunch generate` depends on the setting.
  # framework: 'backbone'

  # Enable or disable minifying of result js / css files.
  minify: no

