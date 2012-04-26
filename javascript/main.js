(function() {

  require(['offlineCache/offlineCache', 'offlineCache/imageData'], function(offlineCache, imageData) {
    var ajaxJsonURL, html, url;
    $.extend($, {
      offlineCache: offlineCache
    });
    console.log('main');
    console.log(offlineCache);
    html = [];
    _.each(imageData, function(val) {
      var src;
      src = offlineCache.getURL(val, {
        filetype: 'image'
      });
      console.log(src);
      return html.push("<img src='" + src + "'>");
    });
    $('body').append(html.join(''));
    url = 'data/ajax.json';
    ajaxJsonURL = offlineCache.getURL('data/ajax.json');
    return $.get(ajaxJsonURL, function(res) {
      if (url === ajaxJsonURL) {
        offlineCache.create(url, {
          content: res,
          filetype: 'text'
        });
      }
      return console.log('ajax call', res);
    });
  });

}).call(this);
