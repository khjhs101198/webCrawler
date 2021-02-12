$("button").on("click", function(){
  $.ajax({
    url: "/download",
    type: "GET"
  }).done(function(result){
    console.log(result);
  }).fail(function(err){
    console.log(err);
  });
});
