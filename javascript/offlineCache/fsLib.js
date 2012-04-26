(function() {

  define(['module'], function(module) {
    var fsLib;
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder;
    fsLib = (function() {
      var _pr;

      _pr = {
        localStorageEnable: !!localStorage,
        fileSize: 1024 * 1024,
        fs: null,
        fsRoot: (function() {
          return localStorage.fsRoot;
        })(),
        fsDeferred: $.Deferred()
      };

      function fsLib() {
        var me, onInitFs,
          _this = this;
        me = this;
        onInitFs = function(fs) {
          /*
                    fs.root.getDirectory(_pr.dirName.images, {create: true}, (dirEntry)->
                      console.log('dirEntry ready')
                    )
          */          _pr.fs = fs;
          if (!_pr.fsRoot) localStorage.fsRoot = fs.root.toURL();
          return _pr.fsDeferred.resolve(fs);
        };
        window.requestFileSystem(window.TEMPORARY, _pr.fileSize, onInitFs, this.errorHandler);
      }

      fsLib.prototype.errorHandler = function(e) {
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
      };

      fsLib.prototype.set = function(key, value) {
        var _this = this;
        return _pr.fsDeferred.done(function(fs) {
          localStorage[key] = true;
          return fs.root.getFile("" + key, {
            create: true
          }, function(fs) {
            return fs.createWriter((function(writer) {
              writer.onwrite = function(e) {
                return console.log("Write completed ===>", fs.toURL());
              };
              writer.onerror = function(e) {
                return console.log("Write failed: " + e);
              };
              return writer.write(value);
            }), this.errorHandler);
          });
        });
      };

      fsLib.prototype.get = function(key) {
        var rootURL;
        rootURL = _pr.fsRoot;
        if (rootURL && (localStorage[key] != null)) {
          return "" + rootURL + "/" + key;
        } else {
          return null;
        }
      };

      fsLib.prototype["delete"] = function(key) {
        console.log('delete', key);
        return delete localStorage[key];
      };

      fsLib.prototype.deleteAll = function() {
        console.log('deleteAll');
        return localStorage.clear();
      };

      return fsLib;

    })();
    return new fsLib;
  });

}).call(this);
