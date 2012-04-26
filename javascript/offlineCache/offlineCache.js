(function() {

  define(['offlineCache/fsLib', 'vender/faultylabs.md5/md5'], function(fsLib) {
    var canvas, dataURItoBlob, offlineCache;
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
    canvas = document.createElement('canvas');
    offlineCache = {
      _delayTime: 200,
      _processQueue: [],
      _process: function() {
        var currentProcess;
        if (this._processQueue.length === 0) return;
        currentProcess = this._processQueue[0];
        switch (currentProcess.filetype) {
          case 'image':
            return this._processImage(currentProcess.src);
          default:
            return this._processText(currentProcess);
        }
      },
      _processText: function(opts) {
        var bb, content, srcKey;
        content = opts != null ? opts.content : void 0;
        if (content) {
          console.log('creating...', opts.src);
          srcKey = faultylabs.MD5(opts.src);
          bb = new window.BlobBuilder();
          bb.append(content);
          fsLib.set(srcKey, bb.getBlob('text/plain'));
        }
        this._processQueue.splice(0, 1);
        return this._process.apply(this);
      },
      _processImage: function(src) {
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
          me._processQueue.splice(0, 1);
          return _.delay(function() {
            return me._process.apply(me);
          }, me._delayTime);
        }).error(function() {
          var img;
          img = this;
          console.log('load error', img.src);
          src = $(img).data('src');
          me["delete"](src);
          me._processQueue.splice(0, 1);
          return me._process.apply(me);
        }).data('src', src).attr('src', src);
      },
      create: function(src, opts) {
        opts = $.extend(opts, {
          src: src
        });
        this._processQueue.push(opts);
        if (this._processQueue.length === 1) return this._process();
      },
      getURL: function(src, opts) {
        var srcKey, url;
        if (opts == null) {
          opts = {
            filetype: 'txt'
          };
        }
        srcKey = faultylabs.MD5(src);
        url = fsLib.get(srcKey);
        if (url) {
          return url;
        } else {
          offlineCache.create(src, opts);
          return src;
        }
      }
    };
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
    return offlineCache;
  });

}).call(this);
