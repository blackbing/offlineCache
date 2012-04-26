(function() {

  define(['offlineCache/fsLib', 'vender/faultylabs.md5/md5'], function(fsLib) {
    var dataURItoBlob, offlineCache;
    dataURItoBlob = function(dataURI) {
      var ab, bb, byteString, i, ia, mimeString;
      byteString = atob(dataURI.split(",")[1]);
      mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
      ab = new ArrayBuffer(byteString.length);
      ia = new Uint8Array(ab);
      i = 0;
      while (i < byteString.length) {
        ia[i] = byteString.charCodeAt(i);
        i++;
      }
      bb = new window.BlobBuilder();
      bb.append(ab);
      return bb.getBlob(mimeString);
    };
    offlineCache = (function() {
      var canvas, _delayTime, _process, _processImage, _processQueue, _processText;

      canvas = null;

      _delayTime = 200;

      _processQueue = [];

      _process = function() {
        var currentProcess;
        if (_processQueue.length === 0) return;
        currentProcess = _processQueue[0];
        switch (currentProcess.filetype) {
          case 'image':
            return _processImage(currentProcess.src);
          default:
            return _processText(currentProcess);
        }
      };

      _processText = function(opts) {
        var bb, content, srcKey;
        content = opts != null ? opts.content : void 0;
        if (content) {
          console.log('creating...', opts.src);
          srcKey = faultylabs.MD5(opts.src);
          bb = new window.BlobBuilder();
          bb.append(content);
          fsLib.set(srcKey, bb.getBlob('text/plain'));
        }
        _processQueue.splice(0, 1);
        return _process.apply(this);
      };

      _processImage = function(src) {
        var me;
        me = this;
        return $('<img>').load(function() {
          var blob, ctx, dataURL, img, srcKey,
            _this = this;
          img = this;
          console.log('creating...', img.src);
          canvas.width = img.width;
          canvas.height = img.height;
          ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          dataURL = canvas.toDataURL('image/png');
          src = $(img).data('src');
          srcKey = faultylabs.MD5(src);
          blob = dataURItoBlob(dataURL);
          fsLib.set(srcKey, blob);
          _processQueue.splice(0, 1);
          return setTimeout(function() {
            return _process.apply(me);
          }, _delayTime);
        }).error(function() {
          var img;
          img = this;
          console.log('load error', img.src);
          src = $(img).data('src');
          me["delete"](src);
          _processQueue.splice(0, 1);
          return _process.apply(me);
        }).data('src', src).attr('src', src);
      };

      function offlineCache() {
        canvas = document.createElement('canvas');
        console.log('constructor');
      }

      offlineCache.prototype.create = function(src, opts) {
        if (!fsLib.enabled) return;
        opts = $.extend(opts, {
          src: src
        });
        _processQueue.push(opts);
        if (_processQueue.length === 1) return _process();
      };

      offlineCache.prototype.getURL = function(src, opts) {
        var srcKey, url;
        if (opts == null) {
          opts = {
            filetype: 'txt'
          };
        }
        if (!fsLib.enabled) return src;
        srcKey = faultylabs.MD5(src);
        url = fsLib.get(srcKey);
        if (url) {
          return url;
        } else {
          this.create(src, opts);
          return src;
        }
      };

      return offlineCache;

    })();
    /*
        Handlebars.registerHelper('offlineCache', (src)->
            cacheImg = offlineCache.getImageFromCache(src)
            #FIXME: testing
            #cacheImg = null
            if(cacheImg)
              cacheImg
            else
              offlineCache.create(src)
              src
        )
    */
    return new offlineCache;
  });

}).call(this);
