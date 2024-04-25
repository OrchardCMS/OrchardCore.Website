// page loader script
$(window).on("load", function () {
  $("#loader-wrapper").fadeOut(700);
});
// page loader script end

// owl carousel
$(document).ready(function () {
  $(".owl-carousel").owlCarousel({
    loop: true,
    margin: 20,
    nav: false,
    dots: true,
    autoplay: true,
    autoplayTimeout: 2000,
    responsive: {
      0: {
        items: 1,
      },
    },
  });
});
// owl carousel end
