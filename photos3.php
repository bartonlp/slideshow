<?php
// Demo using pure JavaScript and my PHP SlideShow class.

require_once('SlideShow.class.php');

// This is a post via 'fetch()'. The input is to 'php://input' not '$_POST'.

if(json_decode(file_get_contents("php://input"))) {
  $ss = new SlideShow('url', 'https://bartonlp.org/photos', false); // Images are on my server.

  $names = explode(",", $ss->getImageNames()); // Get a string of images seperated by commas and turn it into an array.
  
  $images = [];
  
  foreach($names as $name) {
    $img = file_get_contents($name);
    if(empty($img)) error_log("NO IMAGE");
    
    $d = base64_encode($img);
    
    $image = "<img src='data:image/jpeg;base64,$d'>";
    $images[] = $image;
  }
  echo json_encode($images);
  exit();
}

echo <<<EOF
<!DOCTYPE html>
<html>
<body>   
<button type="submit">Show</button>
<div id="show"></div>
<script>
  let images = [];

  let but = document.querySelector("button");
  let show = document.querySelector("#show");
  
  but.addEventListener("click", function() {
    this.style.display = 'none';
    show.innerHTML = "<img src='https://bartonphillips.net/images/loading.gif'>";
    let test = { page: "start" };

    fetch("./photos3.php", {
      body: JSON.stringify(test),
      method: "POST",
      headers: {
        'content-type': 'application/json' // use json to send this
      }
    })
    .then(trans => {
      return trans.json();
    })
    .then(trans => {
      console.log("trans", trans);
      let n = 0;

      function show() {
        if(n > trans.length -1) {
          n = 0;
        }

        setTimeout(() => {
          document.querySelector("#show").innerHTML = trans[n];
          document.querySelector("#show img").style.width = "400px";
          ++n;
          show();
        }, 1000);
      }

      show();
    })
    .catch(trans => {
      console.log(trans);
    });
  });
</script>
</body>
</html>      
EOF;
