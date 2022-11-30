/*
Copyright (c) 2022 Barton Phillips All rights reserved.

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
// Uses the newer 'class' syntax.
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
//  path is a absolute URL (https://...). mode defaults to 'loc',
//  the other value is 'url'.
//  If mode is 'url' then the img src is set to the value of path plus
//  the imageNames[0..n] array established by the constructor which has the
//  names of each image file (gif, jpg, png)
//  If mode is 'loc' then the files are on the local file system but not
//  necessarily within the Document Root of the web server. In that
//  case the img src is a php proxy file that provides the image. The
//  proxy is done by 'SlideShow.class.php'.
//
// There are a number of getter/setter functions to access the class:
// set/get Interval,
// get MaxIndex,
// set/get Index,
// set/get Width,
// set/get Height,
// set EnlargeWidth,
// get MaxEnlargeWidth,
// get ImageName,
// setPath, getPath(),
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
// The following are really inteded for internal use:
// _image(),
// errImage(),
// dispImage(),
// succInit(),
// succImg(),
// fail().
// The PHP functions are done by the SlideShow.class.php file which has the PHP
// class SlideShow.
// The demonstration file photos-jquery.html is also provided.
//
// NOTE: Trick! To use events from within this (or any Class) you must
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
// Home Page: https://www.bartonphillips.com,
// Home:      https://www.bartonphillips.org,
// Email:     bartonphillips@gmail.com
// ---------------------------------------------------------------------

let me; // alias for 'this' to be used for closures.

// When the SlideShow class is instantiated everything has already been
// loaded.

class SlideShow {
  ajaxPath = './';
  mode = 'loc';
  interval = 5000; // 5 seconds per picture
  index = null; // picture index.
  width = '200';
  height = '';
  enlargeWidth = window.innerWidth - 100;
  enlargeWSet = window.innerWidth - 100;
  enlarged = false;
  stopped = true;  // initally stopped
  imageNames = [];
  image = new Image;
  disp;
  errDisp;
  
  constructor(ctrl) {
    me = this; // initialize me.
     
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

    // Check for ssdebug in the url' search property.
    // To turn on debugging the url should be "photos.html?ssdebug"

    const search = document.location.search;

    if(search && search.match(/ssdebug/)) {
      this.DEBUG = true;
    }

    this.disp = document.querySelector(ctrl['disp']);
    this.errDisp = document.querySelector(ctrl['errDisp']);

    if(ctrl['ajaxPath']) this.ajaxPath = ctrl['ajaxPath'];
    this.disp.addEventListener('click', () => { me.enlarge() });
    this.disp.innerHTML="<img id='ssimage' />";
    this.ssimage = document.querySelector('#ssimage');

    if(this.width) {
      this.disp.style.width = this.width+'px';
    }
    if(this.height) {
      this.disp.style.height = this.height+'px';
    }

    if(this.start) {
      this.start = document.querySelector(this.start);
      this.start.addEventListener('click', () => { me.startSlideshow() });
    }

    if(this.stop) {
      this.stop = document.querySelector(this.stop);
      this.stop.addEventListener('click', () => { me.stopSlideshow(); });
    }

    if(this.reset) {
      this.reset = document.querySelector(this.reset);
      this.reset.addEventListener('click', () => { me.resetSlideshow() });
    }

    if(this.forward) {
      this.forward = document.querySelector(this.forward);
      this.forward.addEventListener('click', () => { me.forwardSlideshow() });
    }

    if(this.backward) {
      this.backward = document.querySelector(this.backward);
      this.backward.addEventListener('click', () => { me.backwardSlideshow() });
    }
    
    window.addEventListener('resize', () => {
      me.resize()
    });
  }

  // Set the interval

  set Interval(interval) {
    this.interval = interval;
  }

  get Interval() {
    return this.interval;
  }

  // Get the max index which is imageNames.length -1

  get MaxIndex() {
    return this.imageNames.length -1;
  }

  // Set the imageNames index value. Be careful as I do not range check
  // here so you should know the max index value! Use getMaxIndex before
  // setting this value.
  // NOTE: all internal index manipulation should be done via this method
  // as it also fires the SlideShow:index event which can be used to do
  // things when the image is changed.

  set Index(index) {
    // set the index value and fire an index event on disp
    this.index = index;
    this.disp.dispatchEvent(new Event("SlideShow:index", [ index ]));
  }

  get Index() {
    return this.index;
  }

  // Set the width of the 'disp' box

  set Width(width) {
    this.width = width;
  }

  get Width() {
    return this.width;
  }

  // Set the height of the 'disp' box

  set Height(height) {
    this.height = height;
  }

  get Height() {
    return this.height;
  }

  // Set the width that is the Max width that the image will expand to.

  set EnlargeWidth(width) {
    this.enlargeWidth = this.enlargeWSet = width;
  }

  // Get the enlargeWSet which is the max value not the current value of
  // enlargeWidth which is controlled by the size of the window box.

  get MaxEnlargeWidth() {
    return this.enlargeWSet;
  }

  // Get the current image name

  get ImageName() {
    return this.imageNames[this.index];
  }

  // Set the path and mode. The path is a path not a filename!
  // This method not only sets the properties it also gets the images and
  // sets the imageNames array.
  // NOTE: if you have been running the images the 'index' may need to be
  // reset. Check the imageMaxIndex() and then Index if necessary

  setPath(path, mode) {
    this.mode = mode;
    this.path = path;

    if(path) {
      let request;

      if(mode == 'loc') {
        // local file system
        // use the proxy to do the file system stuff

        request = this.ajaxPath + "SlideShow.class.php?mode=loc&path="+path;
      } else {
        // remote file system

        const m = /^https:\/\//;

                if(!path.match(m)) {
          path = 'https://' + path;
        }
        this.path = path;

        request = this.ajaxPath + "SlideShow.class.php?mode=url&path="+path;
      }

      console.log("request: " +request);

      // trans is the returned data from the GET. It is the
      // 'echo implode(',', $ar) in SlideShow.class.

      fetch(request)
      .then(trans => {
        return trans.text();
      })
      .then(trans => {
        console.log("trans: ", trans);
        me.succInit(trans);
      })
      .catch(trans => {
        console.log("trans: ", trans);
        me.fail(trans)
      });
    }
  }

  // Get the path and mode. This returns an hash array.

  getPath() {
    // Return an array with the path and mode
    return {path: this.path, mode: this.mode};
  }

  // When window changes size we change the enlarge value so the enlarged
  // image is always within the window box.

  resize() {
    const w = window.innerWidth;

    // I have chosen 100 px as the edge of the enlarge box, feel free to
    // change that.

    if(this.enlargeWSet > (w - 100)) {
      this.enlargeWidth = w - 100;
    } else {
      this.enlargeWidth = this.enlargeWSet;
    }

    if(this.enlarged) {
      this.ssimage.style.width = this.enlargeWidth + 'px';
      this.disp.style.width = this.enlargeWidth + 'px';
      this.disp.style.height = this.ssimage.height + 'px';
    }
  }

  // Start the Slideshow. This function is linked to the onclick of the
  // 'start' id.  This could be called programmatically if you like.

  startSlideshow() {
    // start the slide show.
    // set timer

    if(this.index === null) {
      this.Index = 0; // NOTE: all index manipulation is done via the method!
    }

    // Clear errors if we use errDisp

    if(this.errDisp) {
      this.errDisp.style.display = "none";
    }

    // once we start hide the start button.

    this.start.style.display = "none";

    if(this.index > this.imageNames.length -1) {
      this.index = 0;
    }

    let img = this.imageNames[this.index];

    this.stopped = false; // start slide show

    this.#_image(img);
  }

  // Stop the Slideshow. This is linked to the 'stop' id's onclick.
  // This can be called programmatically (and is).

  stopSlideshow() {
    let msg = 'Continue'; // message of the 'start' button

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
    this.start.style.display = 'inline-block';
  }

  // Rest the Slideshow. This function is linked to the 'restart' id's
  // onclick method. The method stops the slide show makes the start
  // button visible with Start as the message and sets index to zero.
  // The method does not display the first image, press start to restart
  // the show.

  resetSlideshow() {
    this.stopSlideshow();
    this.start.style.display = "inline-block"; //style.visibility = 'visible';
    this.start.value = 'Start';
    this.index = 0;
    // If you want to display the first image uncomment the following
    // line.
    //this.#_image(this.imageNames[0]);
  }

  // Enlarge the current image. This method is linked to 'enlarge' id's
  // onclick method.
  // This toggles the image from little to big and visa versa.

  enlarge() {
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

  backwardSlideshow() {
    this.stopSlideshow();

    if(this.index > 0) {
      this.index = this.index -1;
    } else {
      this.index = this.imageNames.length -1;
    }
    this.#_image(this.imageNames[this.index]);
  }

  // Move the slideshow forward one image. This method is linked to the
  // 'forward' id's onclick method. The show will wrap arround when index
  // reaches the end of the imageNames.

  forwardSlideshow() {
    this.stopSlideshow();
    if(this.index < this.imageNames.length -1) {
      this.index = this.index +1;
    } else {
      this.index = 0;
    }
    this.#_image(this.imageNames[this.index]);
  }

  // Fetch and display the next image. This is a callback from
  // setTimeout().

  nextImage() {
    this.index = this.index +1;

    if(this.index > this.imageNames.length -1) {
      this.index = 0;
    }

    this.#_image(this.imageNames[this.index]);
  }

  // Private method.
  // #_image is a helper functions. It is called from several places. It
  // decides how to get the image depending on weather the mode is 'loc'
  // or 'url' and weather the browser is Gecko.

  #_image(img) {
    if(this.mode == 'url') {
      // cache the image and set the onload event. 

      this.src = img;
      this.errTimeout = setTimeout(function() { me.errImage(); }, 10000);
      this.image.onload = () => {
        me.dispImage();
      };
      this.image.src = img;
      return;
    } else {
      // for local images use Ajax if this is a Gecko
      // browser.
      // if this is broken windows IE then use the
      // SlideShow.class.php as the img src and do the cache as
      // above.

      console.log("navigator.product", navigator.product);

      if(navigator.product == 'Gecko') {
      //if(false) {
        // The Ajax request returns an image in the form
        // "data:image/gif;base64," plus base64 encode image
        // data. This works with Gecko but I am told not
        // with IE (I don't use Windows so I don't really
        // know. I did this primairly to try out Ajax and
        // wanted to see if I could use it instead of the
        // other option.

        console.log("This is Gecko");
        console.log("img: ", img);

        fetch(this.ajaxPath + 'SlideShow.class.php?mode=get&path=' + img)
        .then(trans => {
          return trans.text();
        })
        .then(trans => {
          console.log("trans: ", trans);
          me.succImg(trans);
        })
        .catch(trans => { me.fail(trans); });

        return;
      } else {
        // This method should work with any browser.
        // Use the proxy
        // SlideShow.class.php?path=full_filename&mode=proxy

        let src = this.ajaxPath + "SlideShow.class.php?mode=proxy&path=" + img;
        this.src = src;
        this.errTimeout = setTimeout(() => {
          me.errImage(); }
        , 10000);
          
        this.image.onload = () => {
          me.dispImage()
        };
        this.image.src = src;
        return;
      }
    }
  }

  // Error function. This method is a callback for the errTimeout timer
  // set in #_image() for images that are loaded from URL's or via
  // 'proxy'. I have tried to use the image onerror property but it
  // didn't work so I resorted to a timer. If anyone can get onerror to
  // work let me know.

  errImage() {
    this.image.onload = '';
    this.stopSlideshow();

    // If there is an 'errDisp' box we will use it. Otherwise we just use
    // an alert().

    if(this.errDisp) {
      this.errDisp.style.display = 'block';
      this.errDisp.innerHTML = "Image Timed Out: URL="+this.src;
    } else {
      alert("Image Timed Out: URL="+this.src);
    }
  }

  // After the image is loaded display it. 
  // If a url or proxy then this is called as a callback to onload.
  // If we use Ajax then this is called via onload from succImg() Ajax
  // callback.

  dispImage() {
    // if url or proxy then onload may never happen so we have set a
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

    this.ssimage.src = this.src;

    // adjust the width and height

    if(this.width) {
      this.disp.style.width = this.width + "px";
      this.ssimage.style.width = this.width + "px";
    } else {
      this.disp.style.width = this.ssimage.width;
    }

    if(this.height) {
      this.disp.style.height = this.height + "px";
      this.ssimage.style.height = this.height + "px";
    } else {
      // At one point I was having problems with the caching and using
      // ssimage height and width. Sometime they were not set. I think
      // this is all correct now but if you start having problems you can
      // add 'ssdebug' to the search part of the URL to turn on
      // debugging.

      if(!this.ssimage.style.height) {
        this.disp.style.height = this.ssimage.height + 'px';
      }
    }

    // If we are not stopped then set timeout for the NEXT image.

    if(!this.stopped) {
      //let me = this;
      this.timer = setTimeout(function() { me.nextImage(); }, this.interval);
    }
  }

  // Ajax callback.
  // Success from Ajax.
  // Make the comma delimited image names into an array.

  succInit(trans) {
    if(trans.match(/SSException/)) {
      this.fail(trans);
    } else {
      this.imageNames = trans.split(",");
      console.log("succInit imageNames: ", this.imageNames);
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

  succImg(trans) {
    if(trans.match(/SSException/)) {
      this.fail(trans);
    } else {
      this.image.onload = () => {
        me.dispImage();
      };
      this.image.src = trans;
      this.src = trans;
      console.log("succImg: ", trans);
    }
  }

  // Ajax callback and also used as the end of other failure actions.
  // Use the 'errDisp' box if we have one otherwise use an alert.

  fail(trans) {
    if(this.errDisp) {
      this.errDisp.style.display = 'block';
      this.errDisp.innerHTML = trans;
    } else {
      alert(trans);
    }
  }
}
