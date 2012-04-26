(function() {

  require(['offlineCache/offlineCache', 'offlineCache/imageData'], function(offlineCache, imageData) {
    var html;
    console.log('main');
    console.log(offlineCache);
    html = [];
    _.each(imageData, function(val) {
      var src;
      src = offlineCache.getURL(val);
      console.log(src);
      return html.push("<img src='" + src + "'>");
    });
    return $('body').append(html.join(''));
  });

}).call(this);
