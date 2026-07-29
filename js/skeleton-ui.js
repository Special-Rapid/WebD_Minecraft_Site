(function () {
    const MEDIA_SELECTOR = "img, video";
    const CACHE_BUST_PARAM = "skeletonRetry";
    const mediaReady = window.SiteMediaReady;

    if (!mediaReady) {
        throw new Error("SiteMediaReady is required before skeleton-ui.js");
    }

    function normalizeRatio(ratio) {
        if (!ratio || !ratio.includes("/")) {
            return "";
        }

        return ratio
            .split("/")
            .map((part) => part.trim())
            .filter(Boolean)
            .join(" / ");
    }

    function setState(wrapper, state) {
        wrapper.classList.toggle("is-skeleton-active", state === "loading");
        wrapper.classList.toggle("is-media-loaded", state === "loaded");
        wrapper.classList.toggle("is-media-error", state === "error");
    }

    function setRetryButton(wrapper, isVisible, isBusy) {
        const retryButton = wrapper.querySelector(".skeleton-media__retry");

        if (!retryButton) {
            return;
        }

        retryButton.hidden = !isVisible;
        retryButton.disabled = Boolean(isBusy);
    }

    function getOriginalSource(media) {
        if (!media.dataset.skeletonOriginalSrc) {
            media.dataset.skeletonOriginalSrc = media.currentSrc || media.getAttribute("src") || "";
        }

        return media.dataset.skeletonOriginalSrc;
    }

    function getRetrySource(src) {
        try {
            const url = new URL(src, window.location.href);
            url.searchParams.set(CACHE_BUST_PARAM, String(Date.now()));
            return url.href;
        } catch (error) {
            const separator = src.includes("?") ? "&" : "?";
            return `${src}${separator}${CACHE_BUST_PARAM}=${Date.now()}`;
        }
    }

    function retryMedia(media, wrapper) {
        const originalSrc = getOriginalSource(media);

        if (!originalSrc) {
            return;
        }

        setState(wrapper, "loading");
        setRetryButton(wrapper, false, true);

        if (media instanceof HTMLImageElement) {
            media.src = getRetrySource(originalSrc);
            return;
        }

        if (media instanceof HTMLVideoElement) {
            media.load();
            if (media.autoplay) {
                media.play().catch(() => {});
            }
        }
    }

    function initWrapper(wrapper, options) {
        const shouldForce = Boolean(options && options.force);
        const media = wrapper.querySelector(MEDIA_SELECTOR);
        const ratio = normalizeRatio(wrapper.getAttribute("data-skeleton-ratio"));
        const retryButton = wrapper.querySelector(".skeleton-media__retry");
        const previousMedia = wrapper.__siteSkeletonMedia;

        if (!shouldForce && wrapper.dataset.skeletonUiInitialized === "true" && previousMedia === media) {
            return;
        }

        if (typeof wrapper.__siteSkeletonCleanup === "function") {
            wrapper.__siteSkeletonCleanup();
            wrapper.__siteSkeletonCleanup = null;
        }

        const syncState = () => {
            if (mediaReady.isMediaLoaded(media)) {
                setState(wrapper, "loaded");
                setRetryButton(wrapper, false, false);
                return;
            }

            if (mediaReady.isMediaFailed(media)) {
                setState(wrapper, "error");
                setRetryButton(wrapper, true, false);
                return;
            }

            setState(wrapper, "loading");
            setRetryButton(wrapper, false, false);
        };

        if (ratio) {
            wrapper.style.setProperty("--skeleton-ratio", ratio);
        }

        if (!media) {
            if (wrapper.hasAttribute("data-deferred-media")) {
                setState(wrapper, "loading");
                setRetryButton(wrapper, false, false);
            } else {
                setState(wrapper, "loaded");
            }
            return;
        }

        getOriginalSource(media);

        syncState();

        const mediaEvents = ["load", "loadeddata", "loadedmetadata", "canplay", "canplaythrough", "progress", "durationchange", "playing", "stalled", "suspend", "waiting", "error"];

        mediaEvents.forEach((eventName) => {
            media.addEventListener(eventName, syncState);
        });

        let onRetryClick = null;
        if (retryButton) {
            onRetryClick = () => {
                retryMedia(media, wrapper);
            };
            retryButton.addEventListener("click", onRetryClick);
        }

        wrapper.dataset.skeletonUiInitialized = "true";
        wrapper.__siteSkeletonMedia = media;
        wrapper.__siteSkeletonCleanup = () => {
            mediaEvents.forEach((eventName) => {
                media.removeEventListener(eventName, syncState);
            });
            if (retryButton && onRetryClick) {
                retryButton.removeEventListener("click", onRetryClick);
            }
        };
    }

    function initSkeletonMedia() {
        document.querySelectorAll("[data-skeleton-media]").forEach(initWrapper);
    }

    window.SiteSkeletonUI = {
        init: initSkeletonMedia,
        initWrapper,
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initSkeletonMedia);
    } else {
        initSkeletonMedia();
    }
}());
