<?php
//require_once("vendor/autoload.php");
require_once('SlideShow.class.php');

$ss = new SlideShow('loc', './images', false); //'url', 'http://www.granbyrotary.org/images')
$names = $ss->getImageNames();
//$names = explode(',', $imageNames);

echo <<<EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Photo Slide Show Demo</title>
  <!-- jQuery -->
  <script src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
  <script>
// Initialize the SlideShow object. See SlideShow.js for
// information on initialization process.

jQuery(document).ready(function($) {
  var names = [$names];

  function next(i) {
    console.log(i);
//    $("#slideshow").html("<img src='"+names[i]+"'>");
    $("#slideshow").html("<img src='SlideShow.class.php?mode=proxy&path="+names[i]+"'>");
    if(++i >= names.length) {
      i = 0;
    }
    setTimeout(function() {
      next(i);
    }, 5000);
  }

  next(0);
});
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
<div id="slideshow" style="border: 4px solid black"></div>
</body>
</html>
EOF;
