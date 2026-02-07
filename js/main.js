$(function ($) {
    $(window).on("scroll load", function() {
        $(".fadein").each(function () {
            var targetElement = $(this).offset().top;
            var scroll = $(window).scrollTop();
            var windowHeight = $(window).height();
            if (scroll > targetElement - windowHeight + 400) {
                $(this).css("opacity", "1");
                $(this).css("transform", "translateY(0)");
            }
        });
    });
    $(".container ul li a[href^='#']").click(function () {
        var adjust = 0;
        var speed = 700;
        var href = $(this).attr("href");
        var target = $(href == "#" || href == "" ? "html" : href);
        var position = target.offset().top;
        $("html, body").animate({ scrollTop: position }, speed, "swing");
        return false;
    });
});