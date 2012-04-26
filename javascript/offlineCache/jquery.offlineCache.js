(function() {

  define(['offlineCache/offlineCache'], function(offlineCache) {
    return $.extend($, {
      offlineCache: offlineCache
    });
  });

}).call(this);
