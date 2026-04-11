function applyLink(anchor, config) {
    if (!anchor || !config || !config.href || !config.text) {
        if (anchor) anchor.style.display = "none";
        return;
    }

    anchor.style.display = "";
    anchor.href = config.href;
    anchor.textContent = config.text;

    if (config.target) {
        anchor.target = config.target;
    } else {
        anchor.removeAttribute("target");
    }

    if (config.rel) {
        anchor.rel = config.rel;
    } else {
        anchor.removeAttribute("rel");
    }
}

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
                kicker.textContent = config.kicker;
            } else {
                kicker.style.display = "none";
            }
        }

        if (title && config.title) title.textContent = config.title;
        if (body && config.body) body.textContent = config.body;

        if (sub) {
            if (config.sub) {
                sub.style.display = "";
                sub.textContent = config.sub;
            } else {
                sub.style.display = "none";
            }
        }

        applyLink(primary, config.primary);
        applyLink(secondary, config.secondary);
    } catch (error) {
        console.error("Invalid data-cta-config:", error);
    }
}

async function includeCta(target, path) {
    try {
        const response = await fetch(path, { cache: "no-cache" });
        if (!response.ok) {
            throw new Error(`Failed to load ${path}: ${response.status}`);
        }

        const html = await response.text();
        target.innerHTML = html;
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
