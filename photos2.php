<?php
require_once('SlideShow.class.php');

if($_POST['page'] == "start") {
  $ss = new SlideShow('url', 'https://bartonlp.org/photos', false);

  $names = $ss->getImageNames();
  error_log("names: " . print_r($names, true));
  $names = explode(',', $names);
  
  $images = [];
  
  foreach($names as $name) {
    error_log("name: $name");
//    $img = file_get_contents($name);
//    if(empty($img)) error_log("NO IMAGE");
//    $d = base64_encode($img);
//    $image = "<img src='data:image/jpeg;base64,$d'>";
//    $images[] = $image;
    $images[] = "<img src=$name>";
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
    $("#show").html("<img src='https://bartonphillips.net/images/loading.gif'>");
    $.ajax({
      url: "test2.php",
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

