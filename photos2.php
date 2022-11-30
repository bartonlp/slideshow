<?php
// Demo using jQuery and my PHP SlideShow class.

require_once('SlideShow.class.php'); // This may need to be changed depending on your environment.

if($_POST['page'] == "start") {
  $ss = new SlideShow('url', 'https://bartonlp.org/photos', false); // Use 'url' and the location on my server where the photos are.

  $names = $ss->getImageNames(); // This is a plain string list seperated by commas.

  $names = explode(',', $names); // Make into an array
  
  $images = [];
  
  foreach($names as $name) {
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
      url: "photos2.php",
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
