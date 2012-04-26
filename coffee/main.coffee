require([
  'offlineCache/imageData'
  'text!../templates/offlineCache.hbs'
  'offlineCache/handlebar.offlineCache'
  'offlineCache/jquery.offlineCache'
], ( imageData, offlineCacheTpl)->

  #this is simpleTemplate
  ###
  html = []
  _.each(imageData, (val)->
    src = $.offlineCache.getURL(val, filetype:'image')
    console.log src
    html.push("<img src='#{src}'>")
  )

  $('body').append(html.join(''))
  ###
  #https://github.com/wycats/handlebars.js/
  template = Handlebars.compile(offlineCacheTpl)
  html = template(images:imageData)
  $('body').append(html)




  url = 'data/ajax.json'
  ajaxJsonURL = $.offlineCache.getURL('data/ajax.json')
  #ajaxJsonURL = $.offlineCache.getURL('data/ajax.json', disableCache:true)
  $.get(ajaxJsonURL, (res)->
    #save content manually
    if url is ajaxJsonURL
      $.offlineCache.create(url,
        content:res
        filetype: 'text'
        #disableCache: true
      )

    console.log 'ajax call', res
  )


)
