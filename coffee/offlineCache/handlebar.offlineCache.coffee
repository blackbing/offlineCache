define [
  'offlineCache/offlineCache'
], (offlineCache)->

  Handlebars.registerHelper('offlineCache', (src)->
    src = offlineCache.getURL(src, filetype:'image')
    src
  )
