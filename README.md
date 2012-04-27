##Background                                                                                                
The modern browser imprement cache assets very well. But sometimes we need to get images with proxy or generate assets from server. So I try to cache images in local to avoid request server again and again.
It cached in local file system, so the request won't send again if it found the local cache.

##So, what is it?
* Offline cache image, especially large image from proxy server.
* Offline cache AJAX data, provide user to get ajax data. Speed up the query time and reduce server query
* Development mode. In frontend development, we don't want to spend time in server request. so we can cache it in local in development mode.

##Limitation
* Chrome only. It use HTML5 File API. The most frustrated thing is it only supported for Chrome. 
                         
###Dependency                                                                                                                                                                        
* [jQuery](https://github.com/jquery/jquery)                                                                                                                                                                                                                                                              
* [faultylab.MD5](http://blog.faultylabs.com/?d=md5)
* [RequireJS](http://requirejs.org)

##Contribute

###Compile CoffeeScript

    ./compileScript.sh

###Run Server
It need to run on server, you can simply use:

    ./runSimpleServer.sh

and open

    http://localhost:8888

###Build
Based on [require/r.js](http://requirejs.org/docs/optimization.html)

    ./build.sh