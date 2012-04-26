(function() {

  define(['offlineCache/offlineCache'], function(offlineCache) {
    return Handlebars.registerHelper('offlineCache', function(src) {
      src = offlineCache.getURL(src, {
        filetype: 'image'
      });
      return src;
    });
  });

}).call(this);
