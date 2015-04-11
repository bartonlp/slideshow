<!DOCTYPE html>
<html lang="en">
<head>
  <title>Photo Slide Show Demo</title>
  <!-- jQuery -->
  <script src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
  <!--<script src="prototype1.7.2.js"></script>-->
  
  <!-- Load the SlideShow object from SlideShow.js -->
  <script src="SlideShow.js"></script>

  <!-- Initialize the SlideShow object.
       Also a function to show how to use the set/get functions after
       initialization.
  -->

  <script>
      // Initialize the SlideShow object. See SlideShow.js for
      // information on initialization process.

      var ss = new SlideShow({
        disp: '#slideshow', // thing to display in
        errDisp: '#errors', // thing for errors
        width: '100%',
        mode: 'loc',
        enlarge: '1000',
        path: './images', //'http://www.granbyrotary.org/images',
        interval: 5000,
        control: {
                start: '#startit'
              }
      });

      console.log(ss);

      // This is an example of the SlideShow:index event.
      // Every time the index changes the event is fired on the
      // slidesshow display div. This can be used to display the
      // index or anything else that is interesting each time the
      // image changes.
/*      
      function setObserveIndex() {
        document.observe("SlideShow:index", newImage);
      }

      // Callback from event above.
      
      function newImage(event) {
        var index = event.memo.index;
        var indexP = $('index');
        indexP.update("index: " +index + " filename: " + ss.getImageName());
        return false;
      }

      // This is called via onclick of the input id='int_button'
      // The interval is set in the input id='interval' text box.
      
      function setInterval() {
        var i = $('interval');
        ss.setInterval(i.value);
        return false;
      }

      // Set a new path

      function setNewPath() {
        var path = $('path');
        var mode = $('mode');

        // If there was an error clear it out

        $('errors').style.display = 'none';
        
        //alert('path=' + path.value + ' mode=' + mode.value);

        ss.setPath(path.value, mode.value);
        path.value = ss.getPath()['path'];
        ss.setIndex(0); // set the index incase we have been running and index is not zero
      }
*/      
  </script>

  <style>
#slideshow {
        position: relative;
}
#slideshow img {
        max-height: 700px;
}
#footer {
        border: 1px solid back;
        background-color: green;
        color: white;
        margin: 10px;
        width: auto;
}
#errors {
        border: 1px solid red;
        margin-left: 0;
        width: 500px;
        margin-right: auto;
        margin-top: 40px;
        margin-bottom: 40px;
        height: auto;
        text-aligh: center;
        display: none;
        overflow: auto;
}
  </style> 
</head>

<!-- The on load here activates the setObserverIndex() in the head.
The SlideShow.php script sets another load for the init() method via the
DOM event module. Both events are fired on load. -->

<body>
<input type=button id=startit value='Start'><br>

<!-- This is for the slide show. The img tag is placed inside of this
div -->

<div id="slideshow" style="border: 4px solid black"></div>

<!-- Put this id in the initialization 'errDisp' and errors will
happend here -->

<div id='errors'></div>
</body>
</html>
