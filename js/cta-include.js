function renderCtaContent(ctaTarget) {
    let raw = ctaTarget.dataset.ctaConfig;

    const kicker = ctaTarget.querySelector(".cta-kicker");
    const title = ctaTarget.querySelector(".cta-title");
    const body = ctaTarget.querySelector(".cta-body");
    const sub = ctaTarget.querySelector(".cta-sub");
    const primary = ctaTarget.querySelector(".cta-primary");
    const secondary = ctaTarget.querySelector(".cta-secondary");

    if (!raw && ctaTarget.dataset.ctaTitle) {
        raw = JSON.stringify({
            kicker: ctaTarget.dataset.ctaKicker,
            title: ctaTarget.dataset.ctaTitle,
            body: ctaTarget.dataset.ctaBody,
            sub: ctaTarget.dataset.ctaSub,
            primary: {
                text: ctaTarget.dataset.ctaPrimaryText,
                href: ctaTarget.dataset.ctaPrimaryHref,
                target: ctaTarget.dataset.ctaPrimaryTarget,
                rel: ctaTarget.dataset.ctaPrimaryRel,
            },
            secondary: {
                text: ctaTarget.dataset.ctaSecondaryText,
                href: ctaTarget.dataset.ctaSecondaryHref,
                target: ctaTarget.dataset.ctaSecondaryTarget,
                rel: ctaTarget.dataset.ctaSecondaryRel,
            },
        });
    }

    if (!raw) return;

    try {
        const config = JSON.parse(raw);

        if (kicker) {
            if (config.kicker) {
                kicker.style.display = "";
                setSafeText(kicker, config.kicker);
            } else {
                kicker.style.display = "none";
            }
        }

        if (title && config.title) setSafeText(title, config.title);
        if (body && config.body) setSafeText(body, config.body);

        if (sub) {
            if (config.sub) {
                sub.style.display = "";
                setSafeText(sub, config.sub);
            } else {
                sub.style.display = "none";
            }
        }

        applySafeLink(primary, config.primary);
        applySafeLink(secondary, config.secondary);
    } catch (error) {
        console.error("Invalid data-cta-config:", error);
    }
}

async function includeCta(target, path) {
    const loadText = typeof window.__siteInitialLoadFetchText === "function"
        ? window.__siteInitialLoadFetchText
        : async function fallbackLoadText(url, options) {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`Failed to load ${url}: ${response.status}`);
            }

            return response.text();
        };

    try {
        const html = await loadText(path, { cache: "no-cache" }, target.dataset.loadingTaskId);

        // DOMParserを使用してHTMLを安全にパース
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        // scriptタグを削除（セキュリティ対策）
        const scripts = doc.querySelectorAll("script");
        scripts.forEach((script) => script.remove());

        // パースされたドキュメントのボディの内容をターゲットに移す
        target.innerHTML = "";
        while (doc.body.firstChild) {
            target.appendChild(doc.body.firstChild);
        }

        renderCtaContent(target);
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const includeTargets = [...document.querySelectorAll("[data-cta-include]")];

    const ctaTarget = document.getElementById("cta");
    if (ctaTarget && !ctaTarget.dataset.ctaInclude) {
        ctaTarget.dataset.ctaInclude = "components/cta.html";
        includeTargets.push(ctaTarget);
    }

    await Promise.all(
        includeTargets.map((target) => includeCta(target, target.dataset.ctaInclude))
    );
});
