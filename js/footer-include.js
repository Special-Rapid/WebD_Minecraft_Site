function renderFooterLinks(footerTarget) {
    let raw = footerTarget.dataset.footerLinks;
    const linksContainer = footerTarget.querySelector(".footer-links");

    if (!linksContainer) return;

    linksContainer.innerHTML = "";

    // Backward compatibility for older attributes on existing pages.
    if (!raw && footerTarget.dataset.footerLinkText && footerTarget.dataset.footerLinkHref) {
        raw = JSON.stringify([
            {
                text: footerTarget.dataset.footerLinkText,
                href: footerTarget.dataset.footerLinkHref,
            },
        ]);
    }

    if (!raw) {
        linksContainer.style.display = "none";
        return;
    }

    try {
        const links = JSON.parse(raw);

        if (!Array.isArray(links) || links.length === 0) {
            linksContainer.style.display = "none";
            return;
        }

        const validLinks = links.filter((item) => {
            return item && item.href && item.text && isSafeUrl(item.href);
        });

        if (validLinks.length === 0) {
            linksContainer.style.display = "none";
            return;
        }

        linksContainer.style.display = "";

        validLinks.forEach((item, index) => {
            const a = document.createElement("a");
            applySafeLink(a, item);
            if (a.style.display !== "none") {
                linksContainer.appendChild(a);

                if (index < validLinks.length - 1) {
                    linksContainer.appendChild(document.createTextNode(" | "));
                }
            }
        });
    } catch (error) {
        console.error("Invalid data-footer-links:", error);
        linksContainer.style.display = "none";
    }
}

async function includeFooter(target, path) {
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

        renderFooterLinks(target);
        document.dispatchEvent(new CustomEvent("sitepreferencescontentready", { detail: { target } }));
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const includeTargets = [
        ...document.querySelectorAll("[data-footer-include]"),
    ];

    const footerTarget = document.getElementById("footer");
    if (footerTarget && !footerTarget.dataset.footerInclude) {
        footerTarget.dataset.footerInclude = "components/footer.html";
        includeTargets.push(footerTarget);
    }

    await Promise.all(
        includeTargets.map((target) => includeFooter(target, target.dataset.footerInclude))
    );
});
