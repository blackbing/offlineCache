(function() {

  define(['offlineCache/offlineCache'], function(offlineCache) {
    return Handlebars.registerHelper('offlineCache', function(src) {
      return src = offlineCache.getURL(src);
    });
  });

}).call(this);
