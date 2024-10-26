var images = ["image1.jpg", "image2.jpg", "image3.jpg"];
var currentIndex = 0;

document.getElementById("prevButton").addEventListener("click", function() {
    currentIndex = (currentIndex > 0) ? currentIndex - 1 : images.length - 1;
    document.getElementById("galleryImage").src = images[currentIndex];
});

document.getElementById("nextButton").addEventListener("click", function() {
    currentIndex = (currentIndex < images.length - 1) ? currentIndex + 1 : 0;
    document.getElementById("galleryImage").src = images[currentIndex];
});