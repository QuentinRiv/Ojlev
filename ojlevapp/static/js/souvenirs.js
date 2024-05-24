$(document).ready(function () {
    $(".icon_container").on("click", function () {
        $(".icon_container").removeClass("active");
        $(this).addClass("active");

        $(".menu_title h3").html($(this).attr("id"));
        console.log($(this).attr("id"))
    })
})