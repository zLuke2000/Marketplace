var loadFile = function(event) {
    var image = document.getElementById('output');
    image.src = URL.createObjectURL(event.target.files[0]);
    let ratio = image.style.width / image.style.height; 
    image.style.height = "200px";
    image.style.width = ratio * height;
  };