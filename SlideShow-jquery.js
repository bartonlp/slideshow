// Javascript file. Uses jQuery
/*
Copyright (c) 2015 Barton Phillips All rights reserved.
Original copyright (c) 2008 Barton Phillips

The MIT License (MIT)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// The SlideShow Class.
// The constructor takes an array with the following items possible:
// path: the path to the pictures
// disp: the id of the display div
// errDisp: the id of an error display div
// interval: number of mseconds for each image
// control: an array with: 'backward', 'forward', 'stop', 'start',
// 'reset'.
// These are the element id's of the elements (usually an 'input'
// element). All are optional.
// When the id's are present the constructor will add observers for
// onclick.
// mode: weather this is a local directory or remote. If remote then
//  path is a absolute URL (http://...). mode defaults to 'loc',
//  the other value is 'url'.
//  If mode is 'url' then the img src is set to the value of path plus
//  the imageNames[0..n] array established by the constructor which has the
//  names of each image file (gif, jpg, png)
//  If mode is 'loc' then the files are on the local file system but not
//  necessarily withing the Document Root of the web server. In that
//  case the img src is a php proxy file that provides the image. The
//  proxy is done by 'SlideShow.class.php'.
//
// There are a number of getter/setter functions to access the class:
// set/getInterval(),
// getMaxIndex(),
// set/getIndex(),
// set/getWidth(),
// set/getHeight(),
// setEnlargeWidth(),
// getMaxEnlargeWidth(),
// getImageName(),
// set/getPath(),
//
// The following methods are attached to various events:
// init(),
// resize(),
// startSlideshow(),
// stopSlideshow(),
// resetSlideshow(),
// enlarge(),
// backwardSlideshow(),
// forwardSlideshow(),
// nextImage(),
// The following are really inteded for interanal use:
// _image(),
// errImage(),
// dispImage(),
// succInit(),
// succImg(),
// fail().
// The PHP functions are done by the SlideShow.class.php file which has the PHP
// class SlideShow.
// The demonstration file photos.html is also provided.
//
// NOTE: this javascript file relies on the prototype.js framework.
// This framework is available at www.prototype.org. The framework is
// avaiable for download and there is extensive documentation there.
//
// NOTE: Trick! To use events from withing this (or any Class) you must
// use a closure. For example:
// The class xx.
// xx.prototype.y = function() {
//   var me = this; // make a local variable that has 'this'
//   this.timer = setTimeout( function() { me.target(); }, 1000);
//   ..... other stuff
// now when the timeout happens 'me' in the closure is 'this' and it
// works.
//
// This code was created by:
// Barton Phillips.
// Home Page: www.bartonphillips.com,
// Home:      www.bartonphillips.dyndns.org,
// Email:     bartonphillips@gmail.com
// ---------------------------------------------------------------------

var SlideShow;
if(!SlideShow)
  SlideShow = {};

SlideShow = function(ctrl) {
  this.ajaxPath = './';
  this.mode = 'loc';
  this.interval = 5000; // 5 seconds per picture
  this.index = null; // picture index.
  this.width = '200';
  this.height = '';
  this.enlargeWidth = window.innerWidth - 100;
  this.enlargeWSet = window.innerWidth - 100;
  this.enlarged = false;
  this.stopped = true;  // initally stopped
  this.imageNames = new Array;
  this.image = new Image;

  // Check for ssdebug in the url' search property.
  // To turn on debugging the url should be "photos.html?ssdebug"
  
  var search = document.location.search;

  if(search && search.match(/ssdebug/)) {
    this.DEBUG = true;
  }

  // ctrl is an array or null
  // see above for array elements.

  var me = this;  // the 'this' value for the closure in the event observers.

  // set event observers for 'load' and 'resize'  

  $(window).bind('load', function() {me.init();});
  $(window).bind('resize', function() {me.resize();});

  // If called with NO arguments just return. Not much will work until
  // individual properties are initialized via the setters.
  
  if(!arguments.length){
    console.log("NO ARGS");
    return;
  }

  // pick up the values from the array and set the class
  // variables

  this.disp = ctrl['disp'];
  this.errDisp = ctrl['errDisp'];
         
  if(ctrl['ajaxPath']) this.ajaxPath = ctrl['ajaxPath'];
  if(ctrl['interval']) this.interval = ctrl['interval'];
  if(ctrl['index']) this.index = ctrl['index'];
  if(ctrl['width']) this.width = ctrl['width'];
  if(ctrl['height']) this.height = ctrl['height'];
  if(ctrl['enlarge']) {
    this.enlargeWidth = this.enlargeWSet = ctrl['enlarge'];
  }
  if(ctrl['control']) {
    this.backward = ctrl['control']['backward'];
    this.forward = ctrl['control']['forward'];
    this.stop = ctrl['control']['stop'];
    this.start = ctrl['control']['start'];
    this.reset = ctrl['control']['reset'];
  }

  this.setPath(ctrl['path'], (ctrl['mode'] || 'loc'));
}

// Getter/Setter functions.
// Most every property has a getXxxx() and setXxxx() function. I
// discrive only the setXxxx()

// Set the setTimeout() delay interval in milliseconds

SlideShow.prototype.setInterval = function(interval) {
  this.interval = interval;
}

SlideShow.prototype.getInterval = function() {
  return this.interval;
}

// Get the max index which is imageNames.length -1

SlideShow.prototype.getMaxIndex = function() {
  return this.imageNames.length -1;
}

// Set the imageNames index value. Be careful as I do not range check
// here so you should know the max index value! Use getMaxIndex before
// setting this value.
// NOTE: all internal index manipulation should be done via this method
// as it also fires the SlideShow:index event which can be used to do
// things when the image is changed.

SlideShow.prototype.setIndex = function(index) {
  // set the index value and fire an index event on disp
  this.index = index;
  this.disp.trigger("SlideShow:index", [ index ]);
}

SlideShow.prototype.getIndex = function() {
  return this.index;
}

// Set the width of the 'disp' box

SlideShow.prototype.setWidth = function(width) {
  this.width = width;
}

SlideShow.prototype.getWidth =  function() {
  return this.width;
}

// Set the height of the 'disp' box

SlideShow.prototype.setHeight =  function(height) {
  this.height = height;
}

SlideShow.prototype.getHeight =  function() {
  return this.height;
}

// Set the width that is the Max width that the image will expand to.

SlideShow.prototype.setEnlargeWidth =  function(width) {
  this.enlargeWidth = this.enlargeWSet = width;
}

// Get the enlargeWSet which is the max value not the current value of
// enlargeWidth which is controlled by the size of the window box.

SlideShow.prototype.getMaxEnlargeWidth =  function() {
  return this.enlargeWSet;
}

// Get the current image name

SlideShow.prototype.getImageName =  function() {
  return this.imageNames[this.index];
}

// Set the path and mode. The path is a path not a filename!
// This method not only sets the properties it also gets the images and
// sets the imageNames array.
// NOTE: if you have been running the images the 'index' may need to be
// reset. Check the imageMaxIndex() and then setIndex if necessary

SlideShow.prototype.setPath =  function(path, mode) {
  this.mode = mode;
  this.path = path;
                 
  if(path) {
                                               
    var request;

    if(mode == 'loc') {
      // local file system
      // use the proxy to do the file system stuff

      request = this.ajaxPath + "SlideShow.class.php?mode=loc&path="+path;
    } else {
      // remote file system

      var m = /^http:\/\//;

      if(!path.match(m)) {
        path = 'http://' + path;
      }
      this.path = path;

      request = this.ajaxPath + "SlideShow.class.php?mode=url&path="+path;
    }

    var me = this;

    $.ajax({
      url: request,
      success: function(trans) { me.succInit(trans); },
      error:  function(trans) { me.fail(trans); }
    });
  }
}

// Get the path and mode. This returns an hash array.

SlideShow.prototype.getPath =  function() {
  // Return an array with the path and mode
  
  return {path: this.path, mode: this.mode};
}

// After the page is loaded init() is called via the 'onload' event.
// I see no reason why this couldn't be called directly if you find
// some reason to do so as all init() does is set up event observers
// and change the string names of id's into elements. The $() function
// of prototype.js knows not to do that twice. The disp.update() will
// just create a blank img in 'disp'.

SlideShow.prototype.init = function() {
  var me = this;  // trick for closure in event observers

  if(this.disp) {
    this.disp = $(this.disp);
    this.disp.click(function(ev) { me.enlarge() });
    this.disp.html("<img id='ssimage' />");
    this.ssimage = $('#ssimage');
  }

  if(this.errDisp) {
    this.errDisp = $(this.errDisp);
  }

  if(this.width) {
    this.disp.width(this.width + 'px');
  }
  if(this.height) {
    this.disp.height(this.height + 'px');
  }

  if(this.start) {
    this.start = $(this.start);
    this.start.click(function() { me.startSlideshow(); });
  }

  if(this.stop) {
    this.stop = $(this.stop);
    this.stop.click(function() { me.stopSlideshow(); });
  }

  if(this.reset) {
    this.reset = $(this.reset);
    this.reset.click(function() { me.resetSlideshow(); });
  }

  if(this.forward) {
    this.forward = $(this.forward);
    this.forward.click(function() { me.forwardSlideshow(); });
  }

  if(this.backward) {
    this.backward = $(this.backward);
    this.backward.click(function() { me.backwardSlideshow(); });
  }
}

// When window changes size we change the enlarge value so the enlarged
// image is always withing the window box.

SlideShow.prototype.resize = function() {
  var w = window.innerWidth;

  // I have chosen 100 px as the edge of the enlarge box, feel free to
  // change that.
  
  if(this.enlargeWSet > (w - 100)) {
    this.enlargeWidth = w - 100;
  } else {
    this.enlargeWidth = this.enlargeWSet;
  }

  if(this.enlarged) {
    var ss = $('#ssimage');
    ss.width(this.enlargeWidth + 'px');
    var h = ss.height();

    this.disp.width(this.enlargeWidth + 'px');
    this.disp.height(h + 'px');
  }
}

// Start the Slideshow. This function is linked to the onclick of the
// 'start' id.  This could be called programmatically if you like.

SlideShow.prototype.startSlideshow = function() {
  // start the slide show.
  // set timer

  if(this.index === null) {
    this.setIndex(0); // NOTE: all index manipulation is done via the method!
  }

  // Clear errors if we use errDisp

  if(this.errDisp) {
    this.errDisp.hide();
  }

  // once we start hide the start button.

  this.start.hide(); //style.visibility = 'hidden';

  if(this.index > this.imageNames.length -1) {
    this.setIndex(0);
  }

  var img = this.imageNames[this.index];

  this.stopped = false; // start slide show

  this._image(img);
}

// Stop the Slideshow. This is linked to the 'stop' id's onclick.
// This can be called programmatically (and is).

SlideShow.prototype.stopSlideshow = function() {
  var msg = 'Continue'; // message of the 'start' button

  // is the error timeout timer running?
  // if yes then stop it and set start button message to Start.
  
  if(this.errTimeout) {
    clearInterval(this.errTimeout);
    this.errTimeout = 0;
    msg = 'Start';
  }

  // If running stop the timer
  
  if(!this.stopped) {
    clearInterval(this.timer);
    this.timer = 0;
    this.stopped = true;
  }

  // set the start button message and make it visible
  
  this.start.value = msg;
  this.start.show(); //style.visibility = 'visible';
}

// Rest the Slideshow. This function is linked to the 'restart' id's
// onclick method. The method stops the slide show makes the start
// button visible with Start as the message and sets index to zero.
// The method does not display the first image, press start to restart
// the show.

SlideShow.prototype.resetSlideshow = function() {
  this.stopSlideshow();
  this.start.show(); //style.visibility = 'visible';
  this.start.value = 'Start';
  this.setIndex(0);
  // If you want to display the first image uncomment the following
  // line.
  //this._image(this.imageNames[0]);
}

// Enlarge the current image. This method is linked to 'enlarge' id's
// onclick method.
// This toggles the image from little to big and visa versa.

SlideShow.prototype.enlarge = function() {
  // If the image is not enlarged then enlarge it. If it is enlarged
  // then make it small again.
  
  if(!this.enlarged) {
    this.enlarged = true;
    this.stopSlideshow();
    this.resize();
  } else {
    this.enlarged = false;
    this.dispImage();
  }
}

// Move the slideshow backward one image. This method is linked to the
// 'backward' id's onclick method. The show will wrap around when index
// reachs zero.

SlideShow.prototype.backwardSlideshow = function() {
  this.stopSlideshow();

  if(this.index > 0) {
    this.setIndex(this.index -1);
  } else {
    this.setIndex(this.imageNames.length -1);
  }
  this._image(this.imageNames[this.index]);
}

// Move the slideshow forward one image. This method is linked to the
// 'forward' id's onclick method. The show will wrap arround when index
// reaches the end of the imageNames.

SlideShow.prototype.forwardSlideshow = function() {
  this.stopSlideshow();
  if(this.index < this.imageNames.length -1) {
    this.setIndex(this.index +1);
  } else {
    this.setIndex(0);
  }
  this._image(this.imageNames[this.index]);
}

// Fetch and display the next image. This is a callback from
// setTimeout().

SlideShow.prototype.nextImage = function() {
  this.setIndex(this.index +1);

  if(this.index > this.imageNames.length -1) {
    this.setIndex(0);
  }

  this._image(this.imageNames[this.index]);
}

// _image is a helper functions. It is called from several places. It
// decides how to get the image depending on weather the mode is 'loc'
// or 'url' and weather the browser is Gecko.

SlideShow.prototype._image = function(img) {
  var me = this;

  if(this.mode == 'url') {
    // cache the image and set the onload event. 

    this.src = img;
    var me = this;
    this.errTimeout = setTimeout(function() { me.errImage(); }, 10000);
    this.image.onload = function() { me.dispImage(); };
    this.image.src = img;
    return;
  } else {
    // for local images use Ajax if this is a Gecko
    // browser.
    // if this is broken windows IE then use the
    // SlideShow.class.php as the img src and do the cache as
    // above.

    console.log("navigator", navigator);
    
    if(true) {
      // The Ajax request returns an image in the form
      // "data:image/gif;base64," plus base64 encode image
      // data. This works with Gecko but I am told not
      // with IE (I don't use Windows so I don't really
      // know. I did this primairly to try out Ajax and
      // wanted to see if I could use in instead of the
      // other option.

      this.ajaxRequest = $.ajax({
        url: this.ajaxPath + 'SlideShow.class.php?mode=get&path=' + img,
        success: function(trans) { me.succImg(trans); },
        error: function(trans) { me.fail(trans);}
      });
                                
      return;
    } else {
      // This method should work with any browser.
      // Use the proxy
      // SlideShow.class.php?path=full_filename&mode=proxy
      var src = this.ajaxPath + "SlideShow.class.php?mode=proxy&path=" + img;
      this.src = src;
      this.errTimeout = setTimeout(function() { me.errImage(); }, 10000);
      this.image.onload = function() { me.dispImage(); };
      this.image.src = src;
      return;
    }
  }
}

// Error function. This method is a callback for the errTimeout timer
// set in _image() for images that are loaded from URL's or via
// 'proxy'. I have tried to use the image onerror property but it
// didn't work so I resorted to a timer. If anyone can get onerror to
// work let me know.

SlideShow.prototype.errImage = function() {
  this.image.onload = '';
  this.stopSlideshow();

  // If there is an 'errDisp' box we will use it. Otherwise we just use
  // an alert().
  
  if(this.errDisp) {
    this.errDisp.css('display', 'block');
    this.errDisp.html("Image Timed Out: URL="+this.src);
  } else {
    alert("Image Timed Out: URL="+this.src);
  }
}

// After the image is loaded display it. 
// If a url or proxy then this is called as a callback to onload.
// If we use Ajax then this is called via onload from succImg() Ajax
// callback.

SlideShow.prototype.dispImage = function() {
  // if url or proxy then onload my never happen so we have set a
  // timer.
  // However if we get here we want to make sure the timer is not
  // running.
  
  if(this.errTimeout) {
    clearInterval(this.errTimeout);
    this.errTimeout =  0;
  }
  
  this.enlarged = false;

  // put the image name into the '<img src='
  // the image has been cached into an Image object.
  
  this.ssimage[0].src = this.src;

  // adjust the width and height
  
  if(this.width) {
    this.disp.width(this.width + 'px');
    this.ssimage.width(this.width + "px");
  } else {
    this.disp.width(ssimage.width + 'px');
  }

  if(this.height) {
    this.disp.height(this.height + 'px');
    this.ssimage.height(this.height + "px");
  } else {
    // At one point I was having problems with the caching and using
    // ssimage height and width. Sometime they were not set. I think
    // this is all correct now but if you start having problems you can
    // add 'ssdebug' to the search part of the URL to turn on
    // debugging.
    
    if(this.ssimage.height() != 0) {
      this.disp.height(this.ssimage.height() + 'px');
      if(this.DEBUG)
        console.log("ssimage:"+this.ssimage.width()+"x"+this.ssimage.height());
    } else {
      // If the error does happend stop the show and display an alert()
      
      console.log("Ops height==0: "+ this.getImageName());
      console.log("ssimage:"+this.ssimage.width()+"x"+this.ssimage.height);
      alert("Internal Error. image height is zero. Please notify bartonphillips@gmail.com\n" +
            "The slide show is stopped. To restart click 'reset' or 'stop' then 'start'");

      this.stopped = true;
    }
  }

  // If we are not stopped then set timeout for the NEXT image.

  if(!this.stopped) {
    var me = this;
    this.timer = setTimeout(function() { me.nextImage(); }, this.interval);
  }
}

// Ajax callback.
// Success from Ajax.
// Make the comma delimited image names into an array.

SlideShow.prototype.succInit = function(trans) {
  if(trans.match(/SSException/)) {
    this.fail(trans);
  } else {
    this.imageNames = trans.split(",");
  }
}

// Ajax callback.
// Get the 'data' base64 image and set src. Set the onload property of
// the Image object. NOTE: I tried this with out the onload as I
// thought that the data was all loaded at this point and I shouldn't
// need to wait. As it turned out I guess it still takes a little time
// for the browser to figure out things like hight and width etc. So if
// one does not wait the height and width are sometime not yet
// available on the 'img' properties. If I'm wrong please let me know.

SlideShow.prototype.succImg = function(trans) {
  if(trans.match(/SSException/)) {
    this.fail(trans);
  } else {
    var me = this;
    this.image.onload = function() { me.dispImage(); };
    this.image.src = trans;
    this.src = trans;
  }
}

// Ajax callback and also used as the end of other failure actions.
// Use the 'errDisp' box if we have one otherwise use an alert.

SlideShow.prototype.fail = function(trans) {
  if(this.errDisp) {
    this.errDisp.css('display', 'block');
    this.errDisp.html(trans);
  } else {
    alert(trans);
  }
}

// END OF CLASS DEFINITION
