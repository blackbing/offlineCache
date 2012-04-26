#https://github.com/SlexAxton/require-handlebars-plugin
#TODO: expires setting
define([
  'vender/faultylabs.md5/md5'
  ], ()->

    #mapping browser support api
    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem
    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder

    #http://stackoverflow.com/questions/7760700/html5-binary-file-writing-w-base64
    dataURItoBlob = (dataURI) ->
      byteString = atob(dataURI.split(",")[1])
      mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0]
      ab = new ArrayBuffer(byteString.length)
      ia = new Uint8Array(ab)
      i = 0

      while i < byteString.length
        ia[i] = byteString.charCodeAt(i)
        i++
      bb = new window.BlobBuilder()
      bb.append ab
      bb.getBlob mimeString

    imageLocalcache =
      localStorageEnable : !!localStorage
      _dirName:
        images:'images'
      _delayTime: 200
      _processing:false
      _processQueue: []
      _fs: null
      _fsRoot: do(->
        localStorage.fsRoot
      )
      _fsDeferred: $.Deferred()
      _canvas : document.createElement('canvas')

      errorHandler: (e)->
        msg = ""
        switch e.code
          when FileError.QUOTA_EXCEEDED_ERR
            msg = "QUOTA_EXCEEDED_ERR"
          when FileError.NOT_FOUND_ERR
            msg = "NOT_FOUND_ERR"
          when FileError.SECURITY_ERR
            msg = "SECURITY_ERR"
          when FileError.INVALID_MODIFICATION_ERR
            msg = "INVALID_MODIFICATION_ERR"
          when FileError.INVALID_STATE_ERR
            msg = "INVALID_STATE_ERR"
          else
            msg = "Unknown Error"
        console.log "Error: " + msg

      initFS: ->
        me = @
        console.log 'initFS'
        onInitFs = (fs)=>
          fs.root.getDirectory(me._dirName.images, {create: true}, (dirEntry)->
            console.log('dirEntry ready')
          )
          #save fs(fileSystem) object
          @_fs = fs
          if not me._fsRoot
            localStorage.fsRoot = fs.root.toURL()
          @_fsDeferred.resolve(fs)

        window.requestFileSystem(
          window.TEMPORARY,
          1024*1024,
          onInitFs,
          @errorHandler
        )

      save: (key, value)->
        #value.replace('data:image/png;base64,','')
        @_fsDeferred.done((fs)=>
          localStorage[key] = true
          fs.root.getFile "#{@_dirName.images}/#{key}.png",
            create: true
          , (fs) ->
            fs.createWriter ((writer) ->
              writer.onwrite = (e) ->
                console.log "Write completed."

              writer.onerror = (e) ->
                console.log "Write failed: " + e


              writer.write dataURItoBlob(value)
            ), @errorHandler

        )

      getStorageData: (key)->
        rootURL = @_fsRoot
        if rootURL and localStorage[key]?
          "#{rootURL}#{@_dirName.images}/#{key}.png"
        else
          null

      _process: ->
        me = @

        if @_processing
          return
        else if @_processQueue.length is 0
          return

        currentSrc = @_processQueue[0]

        $('<img>').load(->
          me._processing = true
          img = @
          console.log('creating...', img.src)
          canvas = me._canvas
          canvas.width = img.width
          canvas.height = img.height
          ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)

          dataURL = canvas.toDataURL('image/png')
          #
          src = $(img).data('src')

          srcKey = faultylabs.MD5(src)
          me.save(srcKey, dataURL)
          #clear
          me._processQueue.splice(0, 1)
          me._processing = false
          #process next
          _.delay( =>
            me._process.apply(me)
          , me._delayTime)
        )
        .error(->
          img = @
          console.log 'load error', img.src
          src = $(img).data('src')
          me.delete(src)
          me._processQueue.splice(0, 1)
          me._processing = false
          #process next
          me._process.apply(me)
        )
        .data('src', currentSrc)
        .attr('src', currentSrc)

      create: (src)->
        if not @localStorageEnable
          return
        @_processQueue.push(src)
        if @_processQueue.length is 1
          @_process()


      getImageFromCache: (src)->
        if not @localStorageEnable
          return src
        srcKey = faultylabs.MD5(src)
        #data:image or null
        return @getStorageData(srcKey)

      delete: (src)->
        console.log 'delete', src
        srcKey = faultylabs.MD5(src)
        delete localStorage[srcKey]
        #TODO: try to delete file

      deleteAll: ->
        console.log 'deleteAll'
        localStorage.clear()
        #TODO

      getURL: (src)->
        cacheImg = imageLocalcache.getImageFromCache(src)
        console.log 'getURL', cacheImg
        if(cacheImg)
          cacheImg
        else
          imageLocalcache.create(src)
          src


    imageLocalcache.initFS()

    ###
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
    ###

    #exports
    imageLocalcache
)
