define [
  'offlineCache/offlineCache'
], (offlineCache)->

  Handlebars.registerHelper('offlineCache', (src)->
    src = offlineCache.getURL(src)
  )
