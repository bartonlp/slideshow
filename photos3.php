<?php
require_once('SlideShow.class.php');

if(json_decode(file_get_contents("php://input"))) {
  $ss = new SlideShow('url', 'https://bartonlp.org/photos', false);

  $names = explode(",", $ss->getImageNames());
  
  $images = [];
  
  foreach($names as $name) {
    error_log("name: $name");
    $img = file_get_contents($name);
    if(empty($img)) error_log("NO IMAGE");
    
    $d = base64_encode($img);
    error_log("d: $d");
    
    $image = "<img src='data:image/jpeg;base64,$d'>";
    error_log("image: $image");
    $images[] = $image;
  }
  error_log("images: " . print_r($images, true));
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

    fetch("./test3.php", {
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

