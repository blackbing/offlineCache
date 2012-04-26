(function() {

  define(['vender/faultylabs.md5/md5'], function() {
    var dataURItoBlob, imageLocalcache;
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
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
    imageLocalcache = {
      localStorageEnable: !!localStorage,
      _dirName: {
        images: 'images'
      },
      _delayTime: 200,
      _processing: false,
      _processQueue: [],
      _fs: null,
      _fsRoot: (function() {
        return localStorage.fsRoot;
      })(),
      _fsDeferred: $.Deferred(),
      _canvas: document.createElement('canvas'),
      errorHandler: function(e) {
        var msg;
        msg = "";
        switch (e.code) {
          case FileError.QUOTA_EXCEEDED_ERR:
            msg = "QUOTA_EXCEEDED_ERR";
            break;
          case FileError.NOT_FOUND_ERR:
            msg = "NOT_FOUND_ERR";
            break;
          case FileError.SECURITY_ERR:
            msg = "SECURITY_ERR";
            break;
          case FileError.INVALID_MODIFICATION_ERR:
            msg = "INVALID_MODIFICATION_ERR";
            break;
          case FileError.INVALID_STATE_ERR:
            msg = "INVALID_STATE_ERR";
            break;
          default:
            msg = "Unknown Error";
        }
        return console.log("Error: " + msg);
      },
      initFS: function() {
        var me, onInitFs,
          _this = this;
        me = this;
        console.log('initFS');
        onInitFs = function(fs) {
          fs.root.getDirectory(me._dirName.images, {
            create: true
          }, function(dirEntry) {
            return console.log('dirEntry ready');
          });
          _this._fs = fs;
          if (!me._fsRoot) localStorage.fsRoot = fs.root.toURL();
          return _this._fsDeferred.resolve(fs);
        };
        return window.requestFileSystem(window.TEMPORARY, 1024 * 1024, onInitFs, this.errorHandler);
      },
      save: function(key, value) {
        var _this = this;
        return this._fsDeferred.done(function(fs) {
          localStorage[key] = true;
          return fs.root.getFile("" + _this._dirName.images + "/" + key + ".png", {
            create: true
          }, function(fs) {
            return fs.createWriter((function(writer) {
              writer.onwrite = function(e) {
                return console.log("Write completed.");
              };
              writer.onerror = function(e) {
                return console.log("Write failed: " + e);
              };
              return writer.write(dataURItoBlob(value));
            }), this.errorHandler);
          });
        });
      },
      getStorageData: function(key) {
        var rootURL;
        rootURL = this._fsRoot;
        if (rootURL && (localStorage[key] != null)) {
          return "" + rootURL + this._dirName.images + "/" + key + ".png";
        } else {
          return null;
        }
      },
      _process: function() {
        var currentSrc, me;
        me = this;
        if (this._processing) {
          return;
        } else if (this._processQueue.length === 0) {
          return;
        }
        currentSrc = this._processQueue[0];
        return $('<img>').load(function() {
          var canvas, ctx, dataURL, img, src, srcKey,
            _this = this;
          me._processing = true;
          img = this;
          console.log('creating...', img.src);
          canvas = me._canvas;
          canvas.width = img.width;
          canvas.height = img.height;
          ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          dataURL = canvas.toDataURL('image/png');
          src = $(img).data('src');
          srcKey = faultylabs.MD5(src);
          me.save(srcKey, dataURL);
          me._processQueue.splice(0, 1);
          me._processing = false;
          return _.delay(function() {
            return me._process.apply(me);
          }, me._delayTime);
        }).error(function() {
          var img, src;
          img = this;
          console.log('load error', img.src);
          src = $(img).data('src');
          me["delete"](src);
          me._processQueue.splice(0, 1);
          me._processing = false;
          return me._process.apply(me);
        }).data('src', currentSrc).attr('src', currentSrc);
      },
      create: function(src) {
        if (!this.localStorageEnable) return;
        this._processQueue.push(src);
        if (this._processQueue.length === 1) return this._process();
      },
      getImageFromCache: function(src) {
        var srcKey;
        if (!this.localStorageEnable) return src;
        srcKey = faultylabs.MD5(src);
        return this.getStorageData(srcKey);
      },
      "delete": function(src) {
        var srcKey;
        console.log('delete', src);
        srcKey = faultylabs.MD5(src);
        return delete localStorage[srcKey];
      },
      deleteAll: function() {
        console.log('deleteAll');
        return localStorage.clear();
      },
      getURL: function(src) {
        var cacheImg;
        cacheImg = imageLocalcache.getImageFromCache(src);
        console.log('getURL', cacheImg);
        if (cacheImg) {
          return cacheImg;
        } else {
          imageLocalcache.create(src);
          return src;
        }
      }
    };
    imageLocalcache.initFS();
    /*
        Handlebars.registerHelper('imageLocalcache', (src)->
            cacheImg = imageLocalcache.getImageFromCache(src)
            #FIXME: testing
            #cacheImg = null
            if(cacheImg)
              cacheImg
            else
              imageLocalcache.create(src)
              src
        )
    */
    return imageLocalcache;
  });

}).call(this);
