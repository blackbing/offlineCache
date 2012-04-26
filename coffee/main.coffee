require([
  'offlineCache/offlineCache'
  'offlineCache/imageData'
], (offlineCache, imageData)->

  console.log 'main'
  console.log offlineCache



  #this is simpleTemplate
  html = []
  _.each(imageData, (val)->
    src = offlineCache.getURL(val)
    console.log src
    html.push("<img src='#{src}'>")
  )

  $('body').append(html.join(''))


)
