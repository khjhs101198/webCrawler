$(".search").on("submit", function(){

  event.preventDefault();
  $("#btn").attr("disabled", true);
  $(".loading_bar p").text("Downloading").css("color","white");
  $(".loading_bar img").show();
  $(".loading_bar").show();

  $.ajax({
    url: "/",
    data: $(this).serialize(),
    type: "POST"
  }).done(function(result){
    $("#btn").removeAttr("disabled");
    $(".loading_bar img").hide();
    $(".loading_bar p").text("Complete!").css("color", "yellow");
    console.log(result);
  }).fail(function(err){
    console.log(err);
  });
});

$(".loading_bar").hide();
