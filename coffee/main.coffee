require([
  'offlineCache/offlineCache'
  'offlineCache/imageData'
], (offlineCache, imageData)->

  console.log 'main'
  console.log offlineCache



  #this is simpleTemplate
  html = []
  _.each(imageData, (val)->
    src = offlineCache.getURL(val, filetype:'image')
    console.log src
    html.push("<img src='#{src}'>")
  )

  $('body').append(html.join(''))



  url = 'data/ajax.json'
  ajaxJsonURL = offlineCache.getURL('data/ajax.json')
  $.get(ajaxJsonURL, (res)->
    #save content manually
    if url is ajaxJsonURL
      offlineCache.create(url,
        content:res
        filetype: 'text'
      )

    console.log 'ajax call', res
  )


)
