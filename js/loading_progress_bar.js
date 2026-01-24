// ProgressBar.jsを使ってローディングバーを作成
var bar = new ProgressBar.Line(loadingBar, {
  // ローディングバーの線の太さ
    strokeWidth: 0.2,

  // イージング（アニメーションの動き）
    easing: "easeInOut",

  // アニメーションにかかる時間（ミリ秒）
    duration: 2000,

  // ローディングバーの色
    color: "#555",

  // ローディングバーの背景線の色
    trailColor: "#bbb",

  // ローディングバーの背景線の太さ
    trailWidth: 0.2,

  // SVGのviewBoxの設定
    svgStyle: { width: "100%", height: "100%" },

  // テキストのスタイル設定
    text: {
    style: {
        position: "absolute",
        left: "50%",
        top: "50%",
        padding: "0",
        margin: "-30px 0 0 0",
        transform: "translate(-50%, -50%)",
        "font-size": "1rem",
        color: "#fff",
    },
    autoStyleContainer: false,
    },

  // ステップごとの処理（進捗が変わるたびに呼ばれる）
    step: function (state, bar) {
    // ローディングバーに進捗状況（%）を表示
    bar.setText(Math.round(bar.value() * 100) + " %");
    },
});

// ローディングバーをアニメーションさせる
bar.animate(1.0, function () {
  // アニメーションが終了した後の処理
    $("#loadingBar-container").delay(500).fadeOut(800);
});
