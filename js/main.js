if (window.location.pathname.endsWith("pvp.html") || window.location.pathname.endsWith("survival.html") || window.location.pathname.endsWith("build.html")) {
    window.location.replace("404.html");
}
// const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
// console.log("Dark mode: " + dark);
// if (dark) {
// document.documentElement.classList.add("dark");
// } else {
// document.documentElement.classList.remove("dark");
// }
$(function ($) {
    const loading = document.getElementById("loadingBar-container");
    const hasVisited = sessionStorage.getItem("hasVisited");
    if (hasVisited) {
        // すでにこのタブで訪問済み → ローディング出さない
        loading.style.display = "none";
    } else {
        // 初回訪問 → ローディング表示
        loading.style.display = "block";
        // ここでアニメーション後に消す
        setTimeout(() => {
            loading.style.display = "none";
        }, 2000);
        // 訪問済みフラグを保存
        sessionStorage.setItem("hasVisited", "true");
    }

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
});