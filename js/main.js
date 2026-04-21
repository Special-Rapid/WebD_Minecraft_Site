if (window.location.pathname.endsWith("build.html")) {
    window.location.replace("404.html");
}
$(function ($) {
    const texts = ["Explore", "Create", "Survive", "Battle"];
    let index = 0;
    const rotatingElement = document.querySelector(".rotating-item");
    if (rotatingElement) {
        rotatingElement.textContent = texts[index];
        rotatingElement.addEventListener("animationiteration", () => {
            index = (index + 1) % texts.length;
            rotatingElement.textContent = texts[index];
        });
    }

    $(window).on("scroll load", function () {
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
        var speed = 800;
        var href = $(this).attr("href");
        var target = $(href == "#" || href == "" ? "html" : href);
        var position = target.offset().top - adjust;
        $("html, body").animate({ scrollTop: position }, speed, "swing");
        return false;
    });

    const tooltipTriggers = document.querySelectorAll('[data-tooltip], [data-tooltip-img], [data-tooltip-video]');
    console.log('Found tooltips:', tooltipTriggers.length);

    tooltipTriggers.forEach(function (trigger) {
        const tooltipText = trigger.getAttribute('data-tooltip');
        const tooltipImg = trigger.getAttribute('data-tooltip-img');
        const tooltipVideo = trigger.getAttribute('data-tooltip-video');

        console.log('Processing tooltip - text:', tooltipText, 'img:', tooltipImg, 'video:', tooltipVideo);

        trigger.style.position = 'relative';
        trigger.style.display = 'inline-block';

        let tooltipBox = document.createElement('div');
        tooltipBox.className = 'tooltip-box';

        if (tooltipVideo) {
            let video = document.createElement('video');
            video.src = tooltipVideo;
            video.className = 'tooltip-video';
            video.muted = true;
            video.preload = 'metadata';
            tooltipBox.appendChild(video);

            // 再生制御
            trigger.addEventListener('mouseenter', function() {
                video.play().catch(e => console.log('Video play failed:', e));
            });
            trigger.addEventListener('mouseleave', function() {
                video.pause();
                video.currentTime = 0;
            });
        }

        if (tooltipImg) {
            let img = document.createElement('img');
            img.src = tooltipImg;
            img.className = 'tooltip-image';
            tooltipBox.appendChild(img);
        }

        if (tooltipText) {
            let textDiv = document.createElement('div');
            textDiv.textContent = tooltipText;
            textDiv.className = 'tooltip-text';
            tooltipBox.appendChild(textDiv);
        }

        trigger.appendChild(tooltipBox);
        console.log('Tooltip box appended');
    });
});
