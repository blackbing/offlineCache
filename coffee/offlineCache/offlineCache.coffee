#https://github.com/SlexAxton/require-handlebars-plugin
#TODO: expires setting
define([
  'offlineCache/fsLib'
  'vender/faultylabs.md5/md5'
  ], (fsLib)->

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

    class offlineCache
      canvas = document.createElement('canvas')
      _delayTime = 200
      _processQueue = []
      _process = ()->
        if _processQueue.length is 0
          return

        currentProcess = _processQueue[0]

        switch currentProcess.filetype
          when 'image'
            _processImage(currentProcess.src)
          else
            _processText(currentProcess)

      _processText = (opts)->
        content = opts?.content
        if content
          console.log('creating...', opts.src)
          srcKey = faultylabs.MD5(opts.src)
          bb = new window.BlobBuilder()
          bb.append(content)

          fsLib.set(srcKey, bb.getBlob('text/plain'))

        _processQueue.splice(0, 1)
        #process next
        _process.apply(@)


      _processImage = (src)->
        me = @
        $('<img>').load(->
          img = @
          console.log('creating...', img.src)
          canvas.width = img.width
          canvas.height = img.height
          ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0)

          dataURL = canvas.toDataURL('image/png')
          #
          src = $(img).data('src')

          srcKey = faultylabs.MD5(src)
          blob = dataURItoBlob(dataURL)
          fsLib.set(srcKey, blob)
          #clear
          _processQueue.splice(0, 1)
          #process next
          _.delay( =>
            _process.apply(me)
          , _delayTime)
        )
        .error(->
          img = @
          console.log 'load error', img.src
          src = $(img).data('src')
          me.delete(src)
          _processQueue.splice(0, 1)
          #process next
          _process.apply(me)
        )
        .data('src', src)
        .attr('src', src)


      constructor: ->
        console.log('constructor')


      create: (src, opts)->

        opts = $.extend(opts, src:src)
        _processQueue.push(opts)
        if _processQueue.length is 1
          _process()

      getURL: (src, opts=filetype:'txt')->
        srcKey = faultylabs.MD5(src)
        url = fsLib.get(srcKey)
        if(url)
          url
        else
          @create(src, opts)
          src

    ###
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
    ###

    #exports
    new offlineCache
)
