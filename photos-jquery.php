<?php
// This Demo uses jQuery and the PHP SlideShow class.
  
require_once('SlideShow.class.php');

// Select the mode: loc or url
// $mode = "loc";
$mode = "url";
// Select where your images come from.
// If 'loc' then use a relative or absolute path to somewhere on this computer.
//$url = "./images"; // Points to the directory here.
// If 'url' then use an full URL to a server where the images are.
$url = "https://bartonlp.org/photos"; // Change this if you want. The images are on this server.

$ss = new SlideShow($mode, $url, false);

$names = $ss->getImageNames();
//error_log("names: " . $names);

echo <<<EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Photo Slide Show Demo</title>
  <!-- jQuery -->
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
  <script>
jQuery(document).ready(function($) {
  let names = "$names".split(','); // Make the PHP values $names into an array.
  let mode = "$mode";
  let width = 400;

  let images = [];
  
  function next(i) {
    console.log(i, names[i]);

    let ss = $("#slideshow");
    ss.html("<img>").hide();
    
    let img = $("img", ss);

    if(mode == 'loc') {
      img.attr("src", "SlideShow.class.php?mode=proxy&path="+names[i]);
    } else {
      img.attr("src", names[i]);
    }

    img.on('load', function() {
      let h = this.height, // Get the real width
      w = this.width,      // and height
      sized = h / w * width; // width is the actual size we want, and h is the actual height based
                             // on the formula

      $(this).width(width);
      ss.css({border: '4px solid black', width: '400px', height: sized +'px'}).show();
      //ss.show();
    });
      
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

<body>
<div id="slideshow" style="border: 4px solid black"></div>
</body>
</html>
EOF;
