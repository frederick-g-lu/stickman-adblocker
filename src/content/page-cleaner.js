const DEFAULT_SETTINGS = {
  enabled: true,
  blockCookieWalls: true,
  hideDistractions: true,
  aggressiveMode: false,
  useRemoteLists: true
};

const COOKIE_WALL_SELECTORS = [
  "#cookie-law-info-bar",
  "#cookie-notice",
  "#cookiebanner",
  "#onetrust-banner-sdk",
  ".cookie-banner",
  ".cookie-consent",
  ".cookies",
  "[id*='cookie'][class*='wall']",
  "[class*='cookie'][class*='overlay']",
  "[data-testid*='cookie']"
];

const DISTRACTION_SELECTORS = [
  "video[autoplay][muted]",
  "[class*='floating-video']",
  "[id*='floating-video']",
  "[class*='newsletter-popup']",
  "[id*='newsletter-popup']",
  "[class*='subscribe-popup']",
  "[class*='modal'][class*='newsletter']",
  "[class*='popup'][class*='subscribe']",
  "iframe[src*='doubleclick']",
  "iframe[src*='ads']"
];

const NATIVE_BANNER_SELECTORS = [
  "[class*='native-ad']",
  "[id*='native-ad']",
  "[class*='sponsored']",
  "[id*='sponsored']",
  "[class*='promoted']",
  "[id*='promoted']",
  "[class*='recommended']",
  "[id*='recommended']",
  "[class*='advertorial']",
  "[id*='advertorial']"
];

const BANNER_AD_SELECTORS = [
  ".adsbygoogle",
  "#clickLayer",
  "a#clickLayer",
  "[id*='banner']",
  "[class*='banner']",
  "[id*='ad-slot']",
  "[class*='ad-slot']",
  "[id*='adslot']",
  "[class*='adslot']",
  "[id*='ad-unit']",
  "[class*='ad-unit']",
  "[id*='adunit']",
  "[class*='adunit']",
  "[id*='adzone']",
  "[class*='adzone']",
  "[id*='leaderboard']",
  "[class*='leaderboard']",
  "[id*='billboard']",
  "[class*='billboard']",
  "[id*='sponsor']",
  "[class*='sponsor']",
  "[id*='promo']",
  "[class*='promo']",
  "[id*='top-ad']",
  "[class*='top-ad']",
  "[id*='bottom-ad']",
  "[class*='bottom-ad']",
  "[id*='header-ad']",
  "[class*='header-ad']",
  "[id*='sidebar-ad']",
  "[class*='sidebar-ad']",
  "[id*='sticky-ad']",
  "[class*='sticky-ad']",
  "iframe[id*='ad']",
  "iframe[class*='ad']",
  "iframe[src*='ads']",
  "iframe[src*='adnxs']",
  "iframe[src*='googlesyndication']",
  "iframe[src*='doubleclick']",
  "img[src*='cdn.bncloudfl.com/bn/']",
  "img[src*='ybs2ffs7v.com/chicken.gif']",
  "img[src*='ybs2ffs7v.com/whob.gif']",
  "img[src*='ybs2ffs7v.com'][src*='pid=__clb-']",
  "img[src*='ybs2ffs7v.com'][src*='afid=']",
  "a.bg-dsp-a[href*='demand.pubadx.one/click']",
  "a[href*='demand.pubadx.one/click']",
  "img[src*='source.pubadx.one/'][src*='.gif']",
  "img[src*='source.pubadx.one/5143/']",
  "img[src*='/banners/'][src*='advert']",
  "img[src*='/banners/'][src*='ad_']",
  "img[src*='/banners/'][src*='_ad']",
  "img[src*='/banners/'][src*='ads']"
];

const KNOWN_BANNER_IMAGE_HOSTS = [
  "cdn.bncloudfl.com",
  "ybs2ffs7v.com",
  "source.pubadx.one",
  "demand.pubadx.one"
];

const SITE_SPECIFIC_SELECTORS = {
  "freewebnovel.com": [
    "#headad",
    "#topad",
    "#floatad",
    "#adsbox",
    ".adsbygoogle",
    ".ads",
    ".ad-box",
    ".ad-container",
    ".banner-ad",
    ".top-banner-ad",
    ".right-ads",
    ".floating-ads",
    "iframe[src*='adsterra']",
    "iframe[src*='popads']",
    "iframe[src*='onclick']",
    "iframe[src*='advert']",
    "a[href*='adsterra']",
    "a[href*='popcash']"
  ]
};

const ANTI_ADBLOCK_SELECTORS = [
  "[id*='adblock']",
  "[class*='adblock']",
  "[id*='ad-block']",
  "[class*='ad-block']",
  "[id*='adb']",
  "[class*='adb']",
  "[id*='disable-adblock']",
  "[class*='disable-adblock']",
  "[id*='blocker-warning']",
  "[class*='blocker-warning']",
  "[id*='antiad']",
  "[class*='antiad']",
  "[class*='interstitial']",
  "[id*='interstitial']"
];

const STYLE_IDS = {
  cookie: "stickman-style-cookie",
  distraction: "stickman-style-distraction",
  native: "stickman-style-native",
  banner: "stickman-style-banner",
  siteSpecific: "stickman-style-site-specific",
  remote: "stickman-style-remote",
  effects: "stickman-style-effects"
};
const STICKMAN_ASSET_PATH = "assets/stickman-thicc.png";
const hostname = window.location.hostname.toLowerCase();
const selectorValidityCache = new Map();
const TRUSTED_PRODUCTIVITY_DOMAINS = [
  "claude.ai",
  "google.com",
  "brightspace.com",
  "purdue.edu",
  "gradescope.com",
  "docs.google.com",
  "slides.google.com",
  "sheets.google.com",
  "drive.google.com",
  "classroom.google.com",
  "sites.google.com",
  "calendar.google.com",
  "mail.google.com"
];
const TRUSTED_MEDIA_DOMAINS = ["nytimes.com", "nyt.com"];
const TRUSTED_DOWNLOAD_HOSTS = ["production-gradescope-uploads.s3-us-west-2.amazonaws.com"];
const adRedirectDomains = [
  "adsterra.com",
  "popcash.net",
  "popads.net",
  "onclicka.com",
  "propellerads.com",
  "adcash.com",
  "trafficstars.com",
  "hilltopads.net",
  "mgid.com",
  "revcontent.com",
  "adnxs.com",
  "doubleclick.net",
  "adform.net",
  "7ad.org",
  "cdn.bncloudfl.com",
  "ybs2ffs7v.com",
  "source.pubadx.one",
  "demand.pubadx.one"
];

let cleanupScheduled = false;
let directLinkGuardInstalled = false;
let popunderGuardInstalled = false;
let lastHeavyBannerScanAt = 0;

const EFFECTS = {
  dissolveMs: 260,
  stickmanMs: 620
};

const SITE_LOGO_SELECTORS = [
  "a[rel~='home']",
  ".custom-logo-link",
  ".custom-mobile-logo-link",
  ".site-logo",
  ".site-logo-img",
  ".logo",
  ".site-branding",
  "header a[href='/']",
  "header a[href$='/']",
  "[itemprop='url']"
];

function isTrustedProductivitySite() {
  return TRUSTED_PRODUCTIVITY_DOMAINS.some((domain) => domainMatches(hostname, domain));
}

function isTrustedMediaSite() {
  return TRUSTED_MEDIA_DOMAINS.some((domain) => domainMatches(hostname, domain));
}

function isTrustedDownloadHost() {
  return TRUSTED_DOWNLOAD_HOSTS.some((domain) => domainMatches(hostname, domain));
}

function isLikelySiteLogoBlock(node) {
  if (!(node instanceof HTMLElement)) {
    return false;
  }

  if (node.matches(SITE_LOGO_SELECTORS.join(", "))) {
    return true;
  }

  if (node.closest(SITE_LOGO_SELECTORS.join(", ")) !== null) {
    return true;
  }

  const text = (node.textContent || "").toLowerCase();
  const hasLogoTerms =
    text.includes("logo") ||
    text.includes("site name") ||
    text.includes("home") ||
    text.includes("brand");

  if (!hasLogoTerms) {
    return false;
  }

  const identity = `${node.id} ${node.className}`.toLowerCase();
  return identity.includes("logo") || identity.includes("branding");
}

function restoreSiteLogos() {
  const candidates = document.querySelectorAll(
    "a[rel~='home'], .custom-logo-link, .custom-mobile-logo-link, .site-logo, .site-logo-img, .logo, .site-branding, header a[href='/'], header a[href$='/'], [itemprop='url']"
  );

  for (const node of candidates) {
    if (!(node instanceof HTMLElement)) {
      continue;
    }

    const logoImage = node.querySelector("img[alt*='logo' i], img[class*='logo' i], img[src*='logo' i]") || node;
    if (!isLikelySiteLogoBlock(node) && !isLikelySiteLogoBlock(logoImage)) {
      continue;
    }

    node.classList.remove("stickman-dissolve");
    node.style.removeProperty("display");
    node.style.removeProperty("visibility");
    node.style.removeProperty("pointer-events");
    node.removeAttribute("data-stickman-known-banner-container");
    node.removeAttribute("data-stickman-banner-slot");
    node.removeAttribute("data-stickman-banner-selector");

    node.setAttribute("data-stickman-safe-asset", "true");


    if (logoImage instanceof HTMLElement && logoImage !== node) {
      logoImage.classList.remove("stickman-dissolve");
      logoImage.style.removeProperty("display");
      logoImage.style.removeProperty("visibility");
      logoImage.style.removeProperty("pointer-events");
      logoImage.removeAttribute("data-stickman-known-banner");
      logoImage.removeAttribute("data-stickman-known-banner-container");
      logoImage.removeAttribute("data-stickman-banner-slot");
      logoImage.removeAttribute("data-stickman-banner-selector");
      logoImage.setAttribute("data-stickman-safe-asset", "true");
    }
  }
}

function isMarkedSafeAsset(node) {
  if (!(node instanceof HTMLElement)) {
    return false;
  }

  return node.getAttribute("data-stickman-safe-asset") === "true" || node.closest("[data-stickman-safe-asset='true']") !== null;
}  

function isAmazonHost(host) {
  if (!host || typeof host !== "string") {
    return false;
  }

  const normalizedHost = host.toLowerCase();
  return normalizedHost === "amazon.com" || normalizedHost.endsWith(".amazon.com") || normalizedHost.startsWith("amazon.");
}

function isTrustedDestinationHost(host) {
  if (!host || typeof host !== "string") {
    return false;
  }

  const normalizedHost = host.toLowerCase();
  if (normalizedHost.endsWith(".edu") || normalizedHost === "edu") {
    return true;
  }

  if (isAmazonHost(normalizedHost)) {
    return true;
  }

  return TRUSTED_PRODUCTIVITY_DOMAINS.some((domain) => domainMatches(normalizedHost, domain));
}

function shouldBypassCleanup() {
  return isTrustedProductivitySite() || isTrustedDownloadHost();
}

function getRedirectTargetHost(parsedUrl) {
  if (!(parsedUrl instanceof URL)) {
    return "";
  }

  const redirectParams = ["url", "target", "dest", "destination", "redirect", "redir", "out"];
  for (const key of redirectParams) {
    const value = parsedUrl.searchParams.get(key);
    if (!value) {
      continue;
    }

    let nested;
    try {
      nested = new URL(value, parsedUrl.href);
    } catch (_error) {
      continue;
    }

    if (nested.protocol === "http:" || nested.protocol === "https:") {
      return nested.hostname.toLowerCase();
    }
  }

  return "";
}

function shouldRunHeavyBannerScan() {
  const now = Date.now();
  if (now - lastHeavyBannerScanAt < 1200) {
    return false;
  }
  lastHeavyBannerScanAt = now;
  return true;
}

function domainMatches(host, domain) {
  return host === domain || host.endsWith(`.${domain}`);
}

function shouldUseDomainRule(rule) {
  if (!rule || !Array.isArray(rule.includeDomains) || !Array.isArray(rule.excludeDomains)) {
    return false;
  }

  const includePass =
    rule.includeDomains.length === 0 || rule.includeDomains.some((domain) => domainMatches(hostname, domain));

  if (!includePass) {
    return false;
  }

  return !rule.excludeDomains.some((domain) => domainMatches(hostname, domain));
}

function isSelectorValid(selector) {
  if (!selector || typeof selector !== "string") {
    return false;
  }

  const cached = selectorValidityCache.get(selector);
  if (cached !== undefined) {
    return cached;
  }

  let isValid = false;
  try {
    if (window.CSS && typeof window.CSS.supports === "function") {
      isValid = window.CSS.supports(`selector(${selector})`);
    } else {
      document.querySelector(selector);
      isValid = true;
    }
  } catch (_error) {
    isValid = false;
  }

  selectorValidityCache.set(selector, isValid);
  return isValid;
}

function buildCssRuleText(selectors) {
  const valid = [];
  for (const selector of selectors) {
    if (isSelectorValid(selector)) {
      valid.push(selector);
    }
  }
  if (valid.length === 0) {
    return "";
  }
  return `${valid.join(",\n")} { display: none !important; visibility: hidden !important; }`;
}

function ensureCosmeticStyle(styleId, cssText) {
  let styleEl = document.getElementById(styleId);
  if (!(styleEl instanceof HTMLStyleElement)) {
    styleEl = document.createElement("style");
    styleEl.id = styleId;
    (document.head || document.documentElement).appendChild(styleEl);
  }

  if (styleEl.textContent !== cssText) {
    styleEl.textContent = cssText;
  }
}

function ensureEffectsStyle() {
  const cssText = `
    .stickman-dissolve {
      transition: opacity ${EFFECTS.dissolveMs}ms ease-out, filter ${EFFECTS.dissolveMs}ms ease-out !important;
      opacity: 0 !important;
      filter: blur(1px) saturate(0.8) !important;
      pointer-events: none !important;
    }

    .stickman-asset {
      position: fixed;
      z-index: 2147483645;
      opacity: 0.32;
      pointer-events: none;
      transform-origin: center center;
      animation: stickman-pop ${EFFECTS.stickmanMs}ms ease-out forwards;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stickman-asset img {
      width: 50%;
      height: 50%;
      object-fit: contain;
      display: block;
      pointer-events: none;
    }

    @keyframes stickman-pop {
      0% { opacity: 0; transform: translateY(4px) scale(0.92); }
      20% { opacity: 0.65; transform: translateY(0) scale(1); }
      100% { opacity: 0; transform: translateY(-6px) scale(1.04); }
    }
  `;

  ensureCosmeticStyle(STYLE_IDS.effects, cssText);
}

function createStickmanImageElement(width, height) {
  const wrapper = document.createElement("div");
  wrapper.className = "stickman-asset";
  wrapper.style.width = `${Math.max(24, Math.round(width))}px`;
  wrapper.style.height = `${Math.max(24, Math.round(height))}px`;

  const img = document.createElement("img");
  img.src = chrome.runtime.getURL(STICKMAN_ASSET_PATH);
  img.alt = "";
  img.setAttribute("aria-hidden", "true");
  wrapper.appendChild(img);

  return wrapper;
}

function showStickmanEffectNearElement(node) {
  if (!(node instanceof HTMLElement)) {
    return;
  }

  const rect = node.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return;
  }

  const visibleLeft = Math.max(0, rect.left);
  const visibleTop = Math.max(0, rect.top);
  const visibleRight = Math.min(window.innerWidth, rect.right);
  const visibleBottom = Math.min(window.innerHeight, rect.bottom);
  const visibleWidth = Math.max(0, visibleRight - visibleLeft);
  const visibleHeight = Math.max(0, visibleBottom - visibleTop);

  // Only render the stickman when the ad is actually visible on screen.
  if (visibleWidth < 6 || visibleHeight < 6) {
    return;
  }

  const aspect = visibleWidth / Math.max(1, visibleHeight);
  let width;
  let height;

  if (aspect >= 2.4) {
    // Leaderboard-like banners: keep effect large but avoid awkward over-stretching.
    width = Math.min(Math.max(80, visibleWidth * 0.42), 320);
    height = Math.min(Math.max(44, visibleHeight * 0.96), 220);
  } else {
    width = Math.min(window.innerWidth * 0.9, Math.max(48, visibleWidth));
    height = Math.min(window.innerHeight * 0.9, Math.max(56, visibleHeight));
  }

  const stickman = createStickmanImageElement(width, height);

  const left = Math.max(4, Math.min(window.innerWidth - width - 4, visibleLeft + (visibleWidth - width) / 2));
  const top = Math.max(4, Math.min(window.innerHeight - height - 4, visibleTop + (visibleHeight - height) / 2));

  stickman.style.left = `${left}px`;
  stickman.style.top = `${top}px`;

  (document.body || document.documentElement).appendChild(stickman);
  setTimeout(() => {
    stickman.remove();
  }, EFFECTS.stickmanMs + 40);
}

function dissolveAndHideElement(node, marker) {
  if (!(node instanceof HTMLElement)) {
    return;
  }

  if (node.getAttribute(marker) === "true") {
    return;
  }

  if (isMarkedSafeAsset(node) === "true") {
    return;
  }

  node.setAttribute(marker, "true");
  showStickmanEffectNearElement(node);

  requestAnimationFrame(() => {
    node.classList.add("stickman-dissolve");
    node.style.setProperty("pointer-events", "none", "important");
    setTimeout(() => {
      node.style.setProperty("display", "none", "important");
      node.style.setProperty("visibility", "hidden", "important");
    }, EFFECTS.dissolveMs + 20);
  });
}

function dissolveAndHideBySelectors(selectors, marker) {
  const validSelectors = uniqueSelectors(selectors).filter((selector) => isSelectorValid(selector));
  if (validSelectors.length === 0) {
    return;
  }

  const seen = new Set();
  const chunkSize = 24;

  for (let index = 0; index < validSelectors.length; index += chunkSize) {
    const group = validSelectors.slice(index, index + chunkSize).join(",");
    let nodes;
    try {
      nodes = document.querySelectorAll(group);
    } catch (_error) {
      for (const selector of validSelectors.slice(index, index + chunkSize)) {
        try {
          nodes = document.querySelectorAll(selector);
        } catch (_innerError) {
          continue;
        }

        for (const node of nodes) {
          if (seen.has(node)) {
            continue;
          }
          seen.add(node);
          dissolveAndHideElement(node, marker);
        }
      }
      continue;
    }

    for (const node of nodes) {
      if (seen.has(node)) {
        continue;
      }
      seen.add(node);
      dissolveAndHideElement(node, marker);
    }
  }
}

function uniqueSelectors(selectors) {
  return [...new Set(selectors.filter((item) => typeof item === "string" && item.trim().length > 0))];
}

function applySelectorBucket(styleId, selectors) {
  const normalized = uniqueSelectors(selectors);
  const cssText = buildCssRuleText(normalized);
  ensureCosmeticStyle(styleId, cssText);
}

function safelyRun(handler) {
  try {
    handler();
  } catch (_error) {
    // Keep the cleaner resilient: one failed detector should not disable others.
  }
}

function removeBodyScrollLocks() {
  const body = document.body;
  const html = document.documentElement;

  if (!body || !html) {
    return;
  }

  const bodyOverflow = getComputedStyle(body).overflow;
  const htmlOverflow = getComputedStyle(html).overflow;

  if (bodyOverflow === "hidden") {
    body.style.setProperty("overflow", "auto", "important");
  }

  if (htmlOverflow === "hidden") {
    html.style.setProperty("overflow", "auto", "important");
  }
}

function hideLargeOverlays(aggressiveMode) {
  const viewportArea = window.innerWidth * window.innerHeight;
  const candidates = document.querySelectorAll("body > div, body > section, body > aside, body > iframe, body > dialog");

  for (const node of candidates) {
    if (!(node instanceof HTMLElement)) {
      continue;
    }

    const style = getComputedStyle(node);
    if (style.position !== "fixed" && style.position !== "sticky") {
      continue;
    }

    const rect = node.getBoundingClientRect();
    const area = Math.max(0, rect.width * rect.height);
    const coverage = viewportArea > 0 ? area / viewportArea : 0;

    const strongOverlay = coverage > 0.5 && Number(style.zIndex || 0) >= 10;
    const mildOverlay = aggressiveMode && coverage > 0.25 && Number(style.zIndex || 0) >= 5;

    if (strongOverlay || mildOverlay) {
      node.style.setProperty("display", "none", "important");
      node.setAttribute("data-stickman-overlay", "true");
    }
  }
}

function hideAntiAdblockOverlays() {
  for (const selector of ANTI_ADBLOCK_SELECTORS) {
    const nodes = document.querySelectorAll(selector);
    for (const node of nodes) {
      if (!(node instanceof HTMLElement)) {
        continue;
      }
      const text = (node.textContent || "").toLowerCase();
      const hasWarningText =
        text.includes("ad blocker") ||
        text.includes("adblock") ||
        text.includes("disable") ||
        text.includes("turn off") ||
        text.includes("whitelist") ||
        text.includes("please allow ads") ||
        text.includes("continue without") ||
        text.includes("detected ad blocker");

      const style = getComputedStyle(node);
      const rect = node.getBoundingClientRect();
      const viewportArea = window.innerWidth * window.innerHeight;
      const overlayArea = Math.max(0, rect.width * rect.height);
      const largeOverlay = viewportArea > 0 && overlayArea / viewportArea > 0.2;
      const forceLikeModal =
        (style.position === "fixed" || style.position === "sticky") && Number(style.zIndex || 0) >= 20;

      if (!hasWarningText && !(forceLikeModal && largeOverlay)) {
        continue;
      }
      node.style.setProperty("display", "none", "important");
      node.style.setProperty("pointer-events", "none", "important");
      node.setAttribute("data-stickman-anti-adblock", "true");
    }
  }
}

function hideInterstitialOverlays() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const viewportArea = viewportWidth * viewportHeight;
  const candidates = document.querySelectorAll("body > div, body > aside, body > section, body > iframe, body > dialog");

  for (const node of candidates) {
    if (!(node instanceof HTMLElement)) {
      continue;
    }

    const style = getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden") {
      continue;
    }

    const isOverlayPosition = style.position === "fixed" || style.position === "sticky";
    if (!isOverlayPosition) {
      continue;
    }

    const rect = node.getBoundingClientRect();
    const area = Math.max(0, rect.width * rect.height);
    const coverage = viewportArea > 0 ? area / viewportArea : 0;
    const centered =
      Math.abs(rect.left + rect.width / 2 - viewportWidth / 2) <= viewportWidth * 0.25 &&
      Math.abs(rect.top + rect.height / 2 - viewportHeight / 2) <= viewportHeight * 0.25;

    const text = (node.textContent || "").toLowerCase();
    const hasInterstitialText =
      text.includes("skip ad") ||
      text.includes("continue") ||
      text.includes("interstitial") ||
      text.includes("advertisement") ||
      text.includes("please wait") ||
      text.includes("seconds") ||
      text.includes("disable adblock");

    const looksLikeInterstitial =
      (coverage > 0.25 && Number(style.zIndex || 0) >= 15) ||
      (coverage > 0.15 && centered && hasInterstitialText);

    if (!looksLikeInterstitial) {
      continue;
    }

    node.style.setProperty("display", "none", "important");
    node.style.setProperty("pointer-events", "none", "important");
    node.setAttribute("data-stickman-interstitial", "true");
  }
}

function releasePageLocks() {
  const body = document.body;
  const html = document.documentElement;
  if (!body || !html) {
    return;
  }

  body.style.setProperty("overflow", "auto", "important");
  body.style.setProperty("position", "static", "important");
  body.style.setProperty("pointer-events", "auto", "important");

  html.style.setProperty("overflow", "auto", "important");
  html.style.setProperty("pointer-events", "auto", "important");
}

function hideTopRightFixedAdWidgets() {
  const viewportWidth = window.innerWidth;
  const candidates = document.querySelectorAll("body > div, body > aside, body > iframe, body *");
  const maxCandidates = 650;
  let checked = 0;

  const hasSuspiciousPopupSignals = (node, text) => {
    const classAndId = `${node.className || ""} ${node.id || ""}`.toLowerCase();
    const hasAbonemMarker = classAndId.includes("abonem") || classAndId.includes("pl-") || classAndId.includes("__name__");
    const hasMoneyPattern = /\$\s?\d[\d,]*(\.\d{2})?/.test(text);
    const hasScamWords =
      text.includes("antivirus") ||
      text.includes("winner") ||
      text.includes("congrat") ||
      text.includes("claim") ||
      text.includes("profit") ||
      text.includes("earn") ||
      text.includes("deposit") ||
      text.includes("withdraw");

    return hasAbonemMarker || hasMoneyPattern || hasScamWords;
  };

  for (const node of candidates) {
    if (checked >= maxCandidates) {
      break;
    }
    checked += 1;

    if (!(node instanceof HTMLElement)) {
      continue;
    }

    const style = getComputedStyle(node);
    if (style.position !== "fixed") {
      continue;
    }

    const rect = node.getBoundingClientRect();
    const inTopRightCorner = rect.top <= 60 && rect.right >= viewportWidth - 40;
    const looksLikeWidget = rect.width >= 120 && rect.width <= 520 && rect.height >= 20 && rect.height <= 360;
    const hasHighZ = Number(style.zIndex || 0) >= 8;

    if (!inTopRightCorner || !looksLikeWidget || !hasHighZ) {
      continue;
    }

    const text = (node.textContent || "").toLowerCase();
    const hasAdWords =
      text.includes("antivirus") ||
      text.includes("continue") ||
      text.includes("ad") ||
      hasSuspiciousPopupSignals(node, text) ||
      node.querySelector("iframe, a[href], img, n") !== null;

    if (!hasAdWords) {
      continue;
    }

    dissolveAndHideElement(node, "data-stickman-top-right-ad");

    const suspiciousChildren = node.querySelectorAll("n[class*='abonem'], [class*='abonem'], [class*='__name__']");
    for (const child of suspiciousChildren) {
      if (child instanceof HTMLElement) {
        dissolveAndHideElement(child, "data-stickman-top-right-ad-child");
      }
    }
  }
}

function isLikelyNovelContentBlock(node) {
  if (!(node instanceof HTMLElement)) {
    return false;
  }

  if (node.closest(".m-book, .m-book-m, .ul-list1, .ul-list1-1") !== null) {
    const novelLinks = node.querySelectorAll("a[href*='/novel/']").length;
    const coverImages = node.querySelectorAll("img[src*='/files/article/image/']").length;
    if (novelLinks >= 2 || coverImages >= 2) {
      return true;
    }
  }

  const titleNodes = node.querySelectorAll("h3.tit a[href*='/novel/']").length;
  if (titleNodes > 0) {
    return true;
  }

  return false;
}

function isLikelySafeActionButtonBlock(node) {
  if (!(node instanceof HTMLElement)) {
    return false;
  }

  const buttonLink =
    node.querySelector("a.elementor-button, a.elementor-button-link, .elementor-button-wrapper a") ||
    (node.matches("a.elementor-button, a.elementor-button-link") ? node : null);

  if (!(buttonLink instanceof HTMLAnchorElement)) {
    return false;
  }

  // Actual banner containers usually carry media embeds, while CTA test buttons do not.
  if (node.querySelector("iframe, img[data-ad], img[src*='ad'], picture iframe") !== null) {
    return false;
  }

  const text = (buttonLink.textContent || "").trim().toLowerCase();
  const href = (buttonLink.getAttribute("href") || "").toLowerCase();
  const id = (buttonLink.id || "").toLowerCase();

  const looksLikeTestButton =
    text.includes("advanced test") ||
    text.includes("test") ||
    id.startsWith("testingbutton") ||
    href.includes("canyoublockit.com/advanced-adblocker-test");

  return looksLikeTestButton;
}

function restoreSafeActionButtons() {
  const candidates = document.querySelectorAll(
    "[data-stickman-banner-slot='true'], [data-stickman-banner-selector='true'], [data-stickman-known-banner-container='true']"
  );

  for (const node of candidates) {
    if (!(node instanceof HTMLElement)) {
      continue;
    }

    if (!isLikelySafeActionButtonBlock(node)) {
      continue;
    }

    node.classList.remove("stickman-dissolve");
    node.style.removeProperty("display");
    node.style.removeProperty("visibility");
    node.style.removeProperty("pointer-events");
    node.removeAttribute("data-stickman-banner-slot");
    node.removeAttribute("data-stickman-banner-selector");
    node.removeAttribute("data-stickman-known-banner-container");
  }
}

function hasAdResourceSignals(node) {
  if (!(node instanceof HTMLElement)) {
    return false;
  }

  const adKeywords = /(adsterra|doubleclick|googlesyndication|adnxs|pubadx|popads|popcash|propellerads|mgid|revcontent|click\?|\/redirect|\/out|\/go|\/visit|banner|sponsor|promoted|native-ad|advertorial)/i;

  const links = node.querySelectorAll("a[href]");
  for (const link of links) {
    const href = link.getAttribute("href") || "";
    if (adKeywords.test(href)) {
      return true;
    }
  }

  const iframes = node.querySelectorAll("iframe[src]");
  for (const frame of iframes) {
    const src = frame.getAttribute("src") || "";
    if (adKeywords.test(src)) {
      return true;
    }
  }

  const images = node.querySelectorAll("img[src]");
  for (const image of images) {
    const src = image.getAttribute("src") || "";
    if (adKeywords.test(src)) {
      return true;
    }
  }

  const text = (node.textContent || "").toLowerCase();
  return /advertisement|sponsored|promoted|ads by|native ad/.test(text);
}

function hideLikelyBannerSlots() {
  const candidates = document.querySelectorAll("body div, body section, body aside, body iframe");
  const maxCandidates = 350;
  let checked = 0;

  for (const node of candidates) {
    if (checked >= maxCandidates) {
      break;
    }
    checked += 1;

    if (!(node instanceof HTMLElement)) {
      continue;
    }

    if (isMarkedSafeAsset(node)) {
      continue;
    }

    const style = getComputedStyle(node);
    if (style.display === "none" || style.visibility === "hidden") {
      continue;
    }

    const rect = node.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (width < 120 || height < 30 || width > window.innerWidth * 0.98 || height > window.innerHeight * 0.5) {
      continue;
    }

    const isCommonBannerSize =
      (width >= 300 && width <= 350 && height >= 45 && height <= 300) ||
      (width >= 680 && width <= 760 && height >= 80 && height <= 120) ||
      (width >= 900 && width <= 1000 && height >= 70 && height <= 110) ||
      (width >= 150 && width <= 180 && height >= 560 && height <= 620);

    if (!isCommonBannerSize) {
      continue;
    }

    if (isLikelyNovelContentBlock(node)) {
      continue;
    }

    if (isLikelySafeActionButtonBlock(node)) {
      continue;
    }

    const identity = `${node.id} ${node.className}`.toLowerCase();
    const hasAdIdentity =
      identity.includes("ad") ||
      identity.includes("banner") ||
      identity.includes("sponsor") ||
      identity.includes("promo") ||
      identity.includes("slot");

    const hasAdContent = hasAdResourceSignals(node);

    if (!hasAdIdentity && !hasAdContent) {
      continue;
    }

    dissolveAndHideElement(node, "data-stickman-banner-slot");
  }
}

function hideKnownBannerImages() {
  const images = document.querySelectorAll("img[src]");
  const maxImages = 500;
  let checked = 0;

  for (const img of images) {
    if (checked >= maxImages) {
      break;
    }
    checked += 1;

    if (!(img instanceof HTMLImageElement)) {
      continue;
    }

    if (isMarkedSafeAsset(img)) {
      continue;
    }

    const src = img.currentSrc || img.src || "";
    if (!src) {
      continue;
    }

    if (!/^https?:/i.test(src)) {
      continue;
    }

    let parsed;
    try {
      parsed = new URL(src, window.location.href);
    } catch (_error) {
      continue;
    }

    const host = parsed.hostname.toLowerCase();
    const isKnownHost = KNOWN_BANNER_IMAGE_HOSTS.some((value) => host === value || host.endsWith(`.${value}`));
    const path = parsed.pathname.toLowerCase();
    const query = parsed.search.toLowerCase();

    const hasTrackingPattern =
      path.includes("/bn/") ||
      path.includes("/banners/") ||
      path.includes("/banner/") ||
      path.endsWith("/chicken.gif") ||
      path.endsWith("/whob.gif") ||
      (host.includes("pubadx.one") && path.endsWith(".gif")) ||
      /ad|ads|advert|sponsor|promo/.test(path) ||
      query.includes("pid=__clb-") ||
      query.includes("afid=");

    if (!isKnownHost && !hasTrackingPattern) {
      continue;
    }

    dissolveAndHideElement(img, "data-stickman-known-banner");

    const container = img.closest("a, picture, figure, div, section");
    if (container instanceof HTMLElement) {
      dissolveAndHideElement(container, "data-stickman-known-banner-container");
    }
  }
}

function isLikelyAdRedirectUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return false;
  }

  let parsed;
  try {
    parsed = new URL(rawUrl, window.location.href);
  } catch (_error) {
    return false;
  }

  const host = parsed.hostname.toLowerCase();

  if (isTrustedDestinationHost(host)) {
    return false;
  }

  const redirectTargetHost = getRedirectTargetHost(parsed);
  if (isTrustedDestinationHost(redirectTargetHost)) {
    return false;
  }

  if (adRedirectDomains.some((domain) => host === domain || host.endsWith(`.${domain}`))) {
    return true;
  }

  const pathAndQuery = `${parsed.pathname}${parsed.search}`.toLowerCase();
  if (isAmazonHost(host) && pathAndQuery.startsWith("/sspa/click")) {
    return false;
  }

    if (/\/(redirect|out|go|visit|click|popunder|interstitial)(\/|\?|$)/.test(pathAndQuery)) {
    return true;
  }

  const params = parsed.searchParams;
  const redirectParams = ["url", "target", "dest", "destination", "redirect", "redir", "out"];
  for (const key of redirectParams) {
    const value = params.get(key);
    if (value && /^https?:\/\//i.test(value)) {
      return true;
    }
  }

  return false;
}

function isProtectedSafeNavigationLink(anchor) {
  if (!(anchor instanceof HTMLAnchorElement)) {
    return false;
  }

  const href = anchor.getAttribute("href") || "";
  if (!href) {
    return false;
  }

  let targetUrl;
  try {
    targetUrl = new URL(href, window.location.href);
  } catch (_error) {
    return false;
  }

  if (targetUrl.origin !== window.location.origin) {
    return false;
  }

  const isLogoHomeLink =
    anchor.closest(".logo") !== null &&
    (targetUrl.pathname === "/home" || targetUrl.pathname === "/");

  const hasExplicitSafeMarker = anchor.hasAttribute("data-stickman-safe-link");
  return isLogoHomeLink || hasExplicitSafeMarker;
}

function navigateProtectedSafeLink(event, anchor, isAuxClick = false) {
  let targetUrl;
  try {
    targetUrl = new URL(anchor.getAttribute("href") || "", window.location.href);
  } catch (_error) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  const wantsNewTab =
    isAuxClick ||
    event.button === 1 ||
    event.ctrlKey ||
    event.metaKey ||
    anchor.target === "_blank";

  if (wantsNewTab) {
    window.open(targetUrl.href, "_blank", "noopener,noreferrer");
    return;
  }

  window.location.assign(targetUrl.href);
}

function installDirectLinkGuard() {
  if (directLinkGuardInstalled) {
    return;
  }
  directLinkGuardInstalled = true;

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");
      if (!anchor) {
        return;
      }

      if (isProtectedSafeNavigationLink(anchor)) {
        navigateProtectedSafeLink(event, anchor, false);
        return;
      }

      const href = anchor.getAttribute("href") || "";
      if (!isLikelyAdRedirectUrl(href)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      anchor.setAttribute("data-stickman-blocked-link", "true");
    },
    true
  );

  // Middle-click direct-link ads often bypass standard click handlers.
  document.addEventListener(
    "auxclick",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest("a[href]");
      if (!anchor) {
        return;
      }

      if (isProtectedSafeNavigationLink(anchor)) {
        navigateProtectedSafeLink(event, anchor, true);
        return;
      }

      const href = anchor.getAttribute("href") || "";
      if (!isLikelyAdRedirectUrl(href)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      anchor.setAttribute("data-stickman-blocked-link", "true");
    },
    true
  );
}

function installPopunderBlocker() {
  if (popunderGuardInstalled) {
    return;
  }
  popunderGuardInstalled = true;

  const injected = document.createElement("script");
  injected.type = "text/javascript";
  injected.textContent = `(() => {
    if (window.__stickmanPopunderGuardInstalled) {
      return;
    }
    window.__stickmanPopunderGuardInstalled = true;

    const blockedHosts = ${JSON.stringify(adRedirectDomains)};
    const redirectParams = ['url', 'target', 'dest', 'destination', 'redirect', 'redir', 'out'];
    let blockedPopupCount = 0;

    const fakeWindow = {
      closed: true,
      opener: null,
      close: () => true,
      focus: () => false,
      blur: () => false,
      postMessage: () => false,
      location: {
        href: 'about:blank',
        assign: () => false,
        replace: () => false
      }
    };

    const isAdUrl = (value) => {
      if (!value || typeof value !== 'string') return false;
      try {
        const u = new URL(value, location.href);
        const host = u.hostname.toLowerCase();
        if (blockedHosts.some((d) => host === d || host.endsWith('.' + d))) return true;

        const t = (u.pathname + u.search).toLowerCase();
          if (/\/(redirect|out|go|visit|click|popunder|interstitial)(\/|\?|$)/.test(t)) {
          return true;
        }

        for (const key of redirectParams) {
          const candidate = u.searchParams.get(key);
          if (candidate && /^https?:\\/\\//i.test(candidate)) {
            return true;
          }
        }

        return false;
      } catch (_e) {
        return false;
      }
    };

    const isBlankPopup = (value) => {
      if (value === undefined || value === null) {
        return true;
      }
      const text = String(value).trim().toLowerCase();
      return text === '' || text === 'about:blank' || text === 'about:blank#blocked';
    };

    const shouldBlockOpen = (value, target, features) => {
      if (isAdUrl(value)) {
        return true;
      }

      // Popunders frequently call window.open('', '_blank', ...) then navigate later.
      if (isBlankPopup(value) && String(target || '').toLowerCase() === '_blank') {
        return true;
      }

      const featureText = String(features || '').toLowerCase();
      if (featureText.includes('popup') || featureText.includes('noopener') || featureText.includes('noreferrer')) {
        if (String(target || '').toLowerCase() === '_blank') {
          return true;
        }
      }

      return false;
    };

    const originalOpen = window.open;

    const openGuard = function(url, target, features, ...rest) {
      if (shouldBlockOpen(url, target, features)) {
        blockedPopupCount += 1;
        window.__stickmanBlockedPopups = blockedPopupCount;
        return fakeWindow;
      }

      return originalOpen.call(window, url, target, features, ...rest);
    };

    window.open = openGuard;
    if (typeof globalThis !== 'undefined') {
      globalThis.open = openGuard;
    }
  })();`;
  (document.documentElement || document.head || document.body).appendChild(injected);
  injected.remove();
}

function applyYouTubeAdPlaybackProtection() {
  const isYouTube = hostname === "youtube.com" || hostname.endsWith(".youtube.com");
  if (!isYouTube) {
    return;
  }

  const skipButtons = document.querySelectorAll(".ytp-ad-skip-button, .ytp-ad-skip-button-modern");
  for (const button of skipButtons) {
    if (button instanceof HTMLElement) {
      button.click();
    }
  }

  const player = document.querySelector(".html5-video-player");
  const isAdShowing = player instanceof HTMLElement && player.classList.contains("ad-showing");

  if (isAdShowing) {
    const video = document.querySelector("video");
    if (video instanceof HTMLVideoElement) {
      video.muted = true;
      video.playbackRate = 16;
      if (Number.isFinite(video.duration) && video.duration > 0) {
        video.currentTime = Math.max(video.currentTime, video.duration - 0.05);
      }
    }
  }

  const youtubeAdSelectors = [
    ".ytp-ad-player-overlay",
    ".ytp-ad-module",
    ".ytp-ad-image-overlay",
    "ytd-display-ad-renderer",
    "ytd-promoted-sparkles-web-renderer",
    "ytd-companion-slot-renderer",
    "#player-ads",
    ".video-ads"
  ];

  dissolveAndHideBySelectors(youtubeAdSelectors, "data-stickman-youtube-ad");
}

function applyCookieWallProtection(settings) {
  if (!settings.blockCookieWalls) {
    return;
  }
  applySelectorBucket(STYLE_IDS.cookie, COOKIE_WALL_SELECTORS);
  removeBodyScrollLocks();
}

function applyDistractionProtection(settings) {
  if (!settings.hideDistractions) {
    return;
  }

  const selectors = isTrustedMediaSite()
    ? DISTRACTION_SELECTORS.filter((selector) => selector !== "video[autoplay][muted]")
    : DISTRACTION_SELECTORS;

  applySelectorBucket(STYLE_IDS.distraction, selectors);
  hideLargeOverlays(settings.aggressiveMode);
}

function applyNativeBannerProtection() {
  ensureEffectsStyle();
  dissolveAndHideBySelectors(NATIVE_BANNER_SELECTORS, "data-stickman-native-selector");
  applySelectorBucket(STYLE_IDS.native, NATIVE_BANNER_SELECTORS);
}

function applyBannerAdProtection() {
  ensureEffectsStyle();
  restoreSafeActionButtons();
  dissolveAndHideBySelectors(BANNER_AD_SELECTORS, "data-stickman-banner-selector");
  if (shouldRunHeavyBannerScan()) {
    hideKnownBannerImages();
    hideLikelyBannerSlots();
  }
}

function applySiteSpecificProtection() {
  const siteSelectors = SITE_SPECIFIC_SELECTORS[hostname];
  if (!Array.isArray(siteSelectors) || siteSelectors.length === 0) {
    applySelectorBucket(STYLE_IDS.siteSpecific, []);
    return;
  }
  ensureEffectsStyle();
  dissolveAndHideBySelectors(siteSelectors, "data-stickman-site-selector");
  applySelectorBucket(STYLE_IDS.siteSpecific, siteSelectors);
}

function applyRemoteCosmeticProtection(settings, remoteCosmeticSelectors, remoteCosmeticDomainRules) {
  if (!settings.useRemoteLists) {
    applySelectorBucket(STYLE_IDS.remote, []);
    return;
  }

  const selectors = [];
  if (Array.isArray(remoteCosmeticSelectors)) {
    selectors.push(...remoteCosmeticSelectors);
  }

  if (Array.isArray(remoteCosmeticDomainRules)) {
    selectors.push(
      ...remoteCosmeticDomainRules
        .filter((rule) => shouldUseDomainRule(rule))
        .map((rule) => rule.selector)
    );
  }

  if (selectors.length > 0) {
    ensureEffectsStyle();
    dissolveAndHideBySelectors(selectors, "data-stickman-remote-selector");
  }

  applySelectorBucket(STYLE_IDS.remote, selectors);
}

function applyDirectLinkProtection() {
  if (shouldBypassCleanup()) {
    return;
  }

  installDirectLinkGuard();
}

function applyPopunderProtection() {
  if (shouldBypassCleanup()) {
    return;
  }

  installPopunderBlocker();
}

function applyAntiAdblockProtection() {
  hideAntiAdblockOverlays();
}

function applyInterstitialProtection() {
  hideInterstitialOverlays();
}

function applyFloatingWidgetProtection() {
  hideTopRightFixedAdWidgets();
}

function applyPageRecovery() {
  releasePageLocks();
}

function cleanupPage(settings, remoteCosmeticSelectors, remoteCosmeticDomainRules) {
  if (!settings.enabled || shouldBypassCleanup()) {
    return;
  }

  safelyRun(() => restoreSiteLogos());
  safelyRun(() => applyCookieWallProtection(settings));
  safelyRun(() => applyDistractionProtection(settings));
  safelyRun(() => applyNativeBannerProtection());
  safelyRun(() => applyBannerAdProtection());
  safelyRun(() => applySiteSpecificProtection());
  safelyRun(() => applyRemoteCosmeticProtection(settings, remoteCosmeticSelectors, remoteCosmeticDomainRules));
  safelyRun(() => applyDirectLinkProtection());
  safelyRun(() => applyPopunderProtection());
  safelyRun(() => applyYouTubeAdPlaybackProtection());
  safelyRun(() => applyAntiAdblockProtection());
  safelyRun(() => applyInterstitialProtection());
  safelyRun(() => applyFloatingWidgetProtection());
  safelyRun(() => applyPageRecovery());
}

async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (syncResult) => {
      chrome.storage.local.get(
        { remoteCosmeticSelectors: [], remoteCosmeticDomainRules: [] },
        (localResult) => {
        resolve({
          settings: { ...DEFAULT_SETTINGS, ...syncResult },
          remoteCosmeticSelectors: localResult.remoteCosmeticSelectors || [],
          remoteCosmeticDomainRules: localResult.remoteCosmeticDomainRules || []
        });
        }
      );
    });
  });
}

async function runCleanup() {
  const { settings, remoteCosmeticSelectors, remoteCosmeticDomainRules } = await getSettings();
  cleanupPage(settings, remoteCosmeticSelectors, remoteCosmeticDomainRules);
}

function scheduleCleanup() {
  if (shouldBypassCleanup()) {
    return;
  }

  if (cleanupScheduled) {
    return;
  }
  cleanupScheduled = true;
  setTimeout(() => {
    runCleanup()
      .catch(() => {})
      .finally(() => {
        cleanupScheduled = false;
      });
  }, 75);
}

const observer = new MutationObserver(() => {
  scheduleCleanup();
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    if (!shouldBypassCleanup()) {
      scheduleCleanup();
    }
  });
} else {
  scheduleCleanup();
}

if (!shouldBypassCleanup()) {
  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ["class", "style", "hidden", "aria-hidden"]
  });
}

chrome.storage.onChanged.addListener((_changes, area) => {
  if (shouldBypassCleanup()) {
    return;
  }

  if (area === "sync" || area === "local") {
    scheduleCleanup();
  }
});
