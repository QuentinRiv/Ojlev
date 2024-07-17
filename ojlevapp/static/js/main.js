

$(window).on("load", function() {

    // preloader
    let isconnected = $("#name_connected").length > 0;
    if (!isconnected) {
        $(".preloader").delay(600).fadeOut("slow");
    }
    else {
        $(".preloader").fadeOut(10);
    }
    
    // home section slideshow
    let slideIndex = $(".slide.active").index();
    const slideLen = $(".slide").length;

    function slideShow(){
        $(".slide").removeClass("active").eq(slideIndex).addClass("active");
        $(".diapo_img").removeClass("active").eq(slideIndex).addClass("active");
        if(slideIndex == slideLen-1) {
            slideIndex = 0;
        }
        else {
            slideIndex++;
        }
        setTimeout(slideShow, 5000);
    }

    slideShow();
});

$(document).ready( function() {
  // fixed header
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $(".header").addClass("fixed");
    } else {
      $(".header").removeClass("fixed");
    }
  });

  // Scroll
  $(".header a").click(function (e) {
    var scroll_index = $(this).attr("data-scroll-nav");
    var elem = $("body").find(`section[data-scroll-nav='${scroll_index}']`);
    console.log($(elem));
    $("html").animate(
      {
        scrollTop: $(elem).offset().top - 50,
      },
      800 //speed
    );
  });

  // witness filter
  witnessFilter($(".filter-btn.active").attr("data-target"));
  $(".filter-btn").click(function () {
    if ($(this).hasClass("active")) {
      return;
    }
    witnessFilter($(this).attr("data-target"));
  });
  function witnessFilter(target) {
    //target = groom ou bride
    $(".filter-btn").removeClass("active");
    $(".filter-btn[data-target='" + target + "']").addClass("active");
    $(".witness-item").hide();
    $(".witness-item[data-target='" + target + "']").fadeIn();

    $(".filter-img").removeClass("active");
    $(".filter-img[data-target='" + target + "']").addClass("active");
  }

  const wHeight = $(window).height();
  $(".gallery-popup .gp-img").css("max-height", wHeight + "px");

  let itemIndex = 0;
  const totalGalleryItems = $(".gallery-item").length;

  $(".gallery-item").click(function () {
    itemIndex = $(this).index();
    $(".gallery-popup").addClass("open");
    $(".gallery-popup .gp-img").hide();
    gpSlideShow();
  });

  $(".gp-controls .next").click(function () {
    if (itemIndex === totalGalleryItems - 1) {
      itemIndex = 0;
    } else {
      itemIndex++;
    }
    $(".gallery-popup .gp-img").fadeOut(function () {
      gpSlideShow();
    });
  });

  $(".gp-controls .prev").click(function () {
    if (itemIndex === 0) {
      itemIndex = totalGalleryItems - 1;
    } else {
      itemIndex--;
    }
    $(".gallery-popup .gp-img").fadeOut(function () {
      gpSlideShow();
    });
  });

  function gpSlideShow() {
    const imgSrc = $(".gallery-item")
      .eq(itemIndex)
      .find("img")
      .attr("data-large");
    $(".gallery-popup .gp-img").fadeIn().attr("src", imgSrc);
    $(".gp-counter").text(itemIndex + 1 + "/" + totalGalleryItems);
  }

  // close gallery popup
  $(".gp-close").click(function () {
    $(".gallery-popup").removeClass("open");
  });

  // hide gallery popup when clicked outside
  $(".gallery-popup").click(function (event) {
    if ($(event.target).hasClass("open")) {
      $(".gallery-popup").removeClass("open");
    }
  });

  // witness filter
  galleryFilter($(".gallery_tag.active").attr("data-filter"));
  $(".gallery_tag").click(function () {
    if ($(this).hasClass("active")) {
      return;
    }
    galleryFilter($(this).attr("data-filter"));
  });
  function galleryFilter(target) {
    //target = groom ou bride
    $(".gallery_tag").removeClass("active");
    $(".gallery_tag[data-filter='" + target + "']").addClass("active");
  }

  /* === Mixitup filter portfolio === */
  let mixerPortfolio = mixitup(".images", {
    selectors: {
      target: ".gallery-item"
    },
    animation: {
        duration: 300
    }
  });

})