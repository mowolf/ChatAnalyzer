document.getElementById("screenshot1").onclick = doScreenshot;

function doScreenshot() {

// hide Stuff

document.getElementById("feedback").style.display = "none";
document.getElementById("one99").style.display = "none";
document.getElementById("four99").style.display = "none";
document.getElementById("nine99").style.display = "none";

document.getElementById("mostUsedButtons").innerHTML = "";

//payment
document.getElementById("one99").style.display = "block";

setTimeout(function(){
    //do what you need here
    // do screenshot
      $(document).ready(function() {
      var target = document.getElementById("results");

      html2canvas(target).then(function(canvas) {
        canvas.toBlob(function(blob) {


          saveAs(blob, "WhatsAppChatAnalyzer.png");
        });
      });
      });

}, 14000);

  // html2canvas(target, {
  //
  //     onrendered: function(canvas) {
  //       //document.body.appendChild(canvas)
  //
  //       canvas.toBlob(function(blob) {
  //
  //         console.log("ts")
  //         saveAs(blob, "WhatsAppChatAnalyzer.png");
  //       });
  //
  //     // data is the Base64-encoded image
  //     }
  // });


// show Stuff
document.getElementById("feedback").style.display = "block";



}
