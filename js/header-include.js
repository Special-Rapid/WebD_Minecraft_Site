function buildHeaderNav(nav, links) {
    nav.innerHTML = "";

    if (!Array.isArray(links) || links.length === 0) {
        nav.hidden = true;
        return;
    }

    const fragment = document.createDocumentFragment();

    links.forEach((item) => {
        if (!item || typeof item !== "object") {
            return;
        }

        const li = document.createElement("li");
        const a = document.createElement("a");

        if (!applySafeLink(a, item)) {
            return;
        }

        if (item.className) {
            a.className = String(item.className);
        }

        if (item.ariaLabel) {
            a.setAttribute("aria-label", String(item.ariaLabel));
        }

        li.appendChild(a);
        fragment.appendChild(li);
    });

    if (!fragment.childNodes.length) {
        nav.hidden = true;
        return;
    }

    nav.hidden = false;
    nav.appendChild(fragment);
}

function renderHeaderContent(headerTarget) {
    const raw = headerTarget.dataset.headerConfig;

    if (!raw) {
        return;
    }

    const header = headerTarget.querySelector("header");
    const brand = headerTarget.querySelector("[data-header-brand]");
    const nav = headerTarget.querySelector("[data-header-nav]");

    if (!header || !brand || !nav) {
        return;
    }

    try {
        const config = JSON.parse(raw);

        if (config.headerClass) {
            header.className = String(config.headerClass);
        } else {
            header.removeAttribute("class");
        }

        if (config.brandClass) {
            brand.className = String(config.brandClass);
        } else {
            brand.removeAttribute("class");
        }

        if (config.brandAriaLabel) {
            brand.setAttribute("aria-label", String(config.brandAriaLabel));
        } else {
            brand.removeAttribute("aria-label");
        }

        if (config.homeHref && isSafeUrl(config.homeHref)) {
            brand.href = String(config.homeHref);
        } else {
            brand.href = "index.html";
        }

        if (config.navClass) {
            nav.className = String(config.navClass);
        } else {
            nav.removeAttribute("class");
        }

        buildHeaderNav(nav, config.links);
    } catch (error) {
        console.error("Invalid data-header-config:", error);
    }
}

async function includeHeader(target, path) {
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
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        const scripts = doc.querySelectorAll("script");
        scripts.forEach((script) => script.remove());

        target.innerHTML = "";
        while (doc.body.firstChild) {
            target.appendChild(doc.body.firstChild);
        }

        renderHeaderContent(target);
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const includeTargets = [
        ...document.querySelectorAll("[data-header-include]"),
    ];

    const headerTarget = document.getElementById("site-header");
    if (headerTarget && !headerTarget.dataset.headerInclude) {
        headerTarget.dataset.headerInclude = "components/header.html";
        includeTargets.push(headerTarget);
    }

    await Promise.all(
        includeTargets.map((target) => includeHeader(target, target.dataset.headerInclude))
    );
});
