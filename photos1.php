<?php
// Demo using jQuery and an array of images. The images are located on my server.
// This demo does not use the PHP SlideShow class at all.

if($_POST) {
  // Load the $names array. These Jpegs exist on my server in the 'photos' directory.
  
  $names = ['CIMG0006.JPG','CIMG0007.JPG','CIMG0008.JPG','CIMG0009.JPG','CIMG0010.JPG'];
  $images = [];
  
  foreach($names as $name) {
    $img = file_get_contents("https://bartonlp.org/photos/$name"); // Get the image from my server
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
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
<script>
  let images = [];
  
  $("button").on("click", function() {
    $(this).hide();
    // The 'loading.gif' is on one of my servers.
    $("#show").html("<img src='https://bartonphillips.net/images/loading.gif'>"); 
    
    $.ajax({
      url: "photos1.php",
      type: 'post',
      data: {page: "start" },
      success: function(trans) {
        trans = JSON.parse(trans);
        console.log("trans: ", trans);
        images = trans;

        let n = 0;

        function show() {
          if(n > images.length -1) {
            n = 0;
          }

          setTimeout(() => {
            $("#show").html(images[n]);
            $("#show img").width(400);
            ++n;
            show();
          }
          , 1000);
        }

        show();
      },
      error: function(trans) {
        console.log(trans);
      }
    });
  });
</script>
</body>
</html>      
EOF;
