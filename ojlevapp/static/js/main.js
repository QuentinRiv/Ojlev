

$(window).on("load", function() {
    
    // home section slideshow
    let slideIndex = $(".slide.active").index();
    const slideLen = $(".slide").length;

    function slideShow(){
        $(".slide").removeClass("active").eq(slideIndex).addClass("active");
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

    // people filter
    peopleFilter($(".filter-btn.active").attr("data-target"));
    $(".filter-btn").click(function() {
        if ($(this).hasClass("active")) {
            return
        }
        peopleFilter($(this).attr("data-target"));
    })
    function peopleFilter(target) { //target = groom ou bride
        $(".filter-btn").removeClass("active");
        $(".filter-btn[data-target='"+target+"']").addClass("active");
        $(".people-item").hide();
        $(".people-item[data-target='"+target+"']").fadeIn();
    }
})