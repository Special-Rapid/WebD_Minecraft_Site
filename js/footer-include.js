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

        linksContainer.style.display = "";

        links.forEach((item, index) => {
            if (!item.href || !item.text) return;

            const a = document.createElement("a");
            a.href = item.href;
            a.textContent = item.text;

            if (item.target) a.target = item.target;
            if (item.rel) a.rel = item.rel;

            linksContainer.appendChild(a);

            if (index < links.length - 1) {
                linksContainer.appendChild(document.createTextNode(" | "));
            }
        });
    } catch (error) {
        console.error("Invalid data-footer-links:", error);
        linksContainer.style.display = "none";
    }
}

async function includeFooter(target, path) {
    try {
        const response = await fetch(path, { cache: "no-cache" });
        if (!response.ok) {
            throw new Error(`Failed to load ${path}: ${response.status}`);
        }

        const html = await response.text();
        target.innerHTML = html;
        renderFooterLinks(target);
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
