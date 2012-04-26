(function() {

  require(['offlineCache/imageData', 'text!../templates/offlineCache.hbs', 'offlineCache/handlebar.offlineCache-min', 'offlineCache/jquery.offlineCache-min'], function(imageData, offlineCacheTpl) {
    /*
      html = []
      _.each(imageData, (val)->
        src = $.offlineCache.getURL(val, filetype:'image')
        console.log src
        html.push("<img src='#{src}'>")
      )
    
      $('body').append(html.join(''))
    */
    var ajaxJsonURL, html, template, url;
    template = Handlebars.compile(offlineCacheTpl);
    html = template({
      images: imageData
    });
    $('body').append(html);
    url = 'data/ajax.json';
    ajaxJsonURL = $.offlineCache.getURL('data/ajax.json');
    return $.get(ajaxJsonURL, function(res) {
      if (url === ajaxJsonURL) {
        $.offlineCache.create(url, {
          content: res,
          filetype: 'text'
        });
      }
      return console.log('ajax call', res);
    });
  });

}).call(this);
