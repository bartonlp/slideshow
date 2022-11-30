<?php
// This Demo uses pure JavaScript.
  
//require_once("vendor/autoload.php");
require_once('SlideShow.class.php');

//$ss = new SlideShow('loc', './images', false); // args: mode, path, echo. mode can be 'loc',
//'url', 'get' or 'proxy'
$mode = 'url';
$ss = new SlideShow($mode, 'https://bartonlp.org/photos', false); // args: mode, path, echo. mode can be 'loc', 'url', 'get' or 'proxy'
$names = $ss->getImageNames();
error_log("names: " . $names);

echo <<<EOF
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Photo Slide Show Demo</title>

  <style>
/*#slideshow {
        position: relative;
}*/
/*#slideshow img {
        max-height: 700px;
}*/
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

<script>
  var names = [$names];
  let mode = '$mode';
  
  function next(i) {
    console.log(i, names[i]);
    let ss = document.querySelector("#slideshow");

    if(mode == 'loc') {
      ss.innerHTML = "<img src='SlideShow.class.php?mode=proxy&path="+names[i]+"'>";
    } else {
      let img = document.createElement('img');
      let m;
      if(m = document.querySelector("#slideshow img")) {
        m.remove();
      }

      ss.appendChild(img);
      
      img.onload = () => {
        let nath = img.naturalHeight;
        let natw = img.naturalWidth;
        
        console.log("natw: " + natw + ", nath: " + nath);
        img.style.width = '400px';
        img.style.display = 'block';
        ss.style.width = '400px';
        let h = nath / natw * 400;
        console.log("h=" +h);
        ss.style.height = h + "px";
      };
      img.style.display = 'none';  
      img.src = names[i];
    }
    if(++i >= names.length) {
      i = 0;
    }
    setTimeout(function() {
      next(i);
    }, 5000);
  }

  next(0);
</script>

</body>
</html>
EOF;

// h/w = nh/nw
// h = nh/nw * w