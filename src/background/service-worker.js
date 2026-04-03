const DEFAULT_SETTINGS = {
  enabled: true,
  blockAds: true,
  blockTrackers: true,
  blockMalware: true,
  blockCookieWalls: true,
  hideDistractions: true,
  aggressiveMode: false,
  interactiveStickman: false,
  useRemoteLists: true
};

const RULESET_MAP = {
  core_ads: "blockAds",
  tracking: "blockTrackers",
  malware: "blockMalware"
};

const LIST_URLS = [
  "https://easylist.to/easylist/easylist.txt",
  "https://easylist.to/easylist/easyprivacy.txt",
  "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/filters.txt",
  "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/privacy.txt",
  "https://raw.githubusercontent.com/uBlockOrigin/uAssets/master/filters/unbreak.txt"
];

const UPDATE_ALARM = "stickman-update-filter-lists";
const DYNAMIC_RULE_START = 500000;
const DYNAMIC_RULE_LIMIT = 5000;
const COSMETIC_SELECTOR_LIMIT = 3000;
const COSMETIC_DOMAIN_RULE_LIMIT = 4000;
const MAX_TEXT_CACHE_BYTES = 2_000_000;
const SOURCE_CACHE_STORAGE_KEY = "cachedSourcePayloads";
const SELFIE_SCHEMA_VERSION = 1;
const AUTO_UPDATE_INTERVAL_MINUTES = 60 * 12;
const STARTUP_WARM_CHECK_DELAY_MINUTES = 3;

function nowMs() {
  return Date.now();
}

function toIsoTime(ms) {
  return new Date(ms).toISOString();
}

function safeParseTime(value) {
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : null;
}

function isOlderThanMinutes(isoTimestamp, minutes) {
  const time = safeParseTime(isoTimestamp);
  if (time === null) {
    return true;
  }
  return nowMs() - time >= minutes * 60 * 1000;
}

function parseOptionTokens(optionsPart) {
  const options = new Set();
  const domains = [];
  let thirdPartyOnly = false;

  if (!optionsPart) {
    return { options, domains, thirdPartyOnly };
  }

  for (const token of optionsPart.split(",")) {
    const normalized = token.trim().toLowerCase();
    if (!normalized || normalized.startsWith("~")) {
      continue;
    }

    if (normalized === "third-party") {
      thirdPartyOnly = true;
      continue;
    }

    if (normalized.startsWith("domain=")) {
      const rawDomains = normalized.slice("domain=".length).split("|");
      for (const domain of rawDomains) {
        if (domain && !domain.startsWith("~")) {
          domains.push(domain.trim());
        }
      }
      continue;
    }

    options.add(normalized);
  }

  return { options, domains, thirdPartyOnly };
}

function normalizeResourceTypes(optionSet) {
  const map = {
    script: "script",
    image: "image",
    media: "media",
    stylesheet: "stylesheet",
    xhr: "xmlhttprequest",
    xmlhttprequest: "xmlhttprequest",
    subdocument: "sub_frame",
    document: "main_frame",
    websocket: "websocket",
    ping: "ping",
    font: "font"
  };

  const types = [];
  for (const [key, value] of Object.entries(map)) {
    if (optionSet.has(key)) {
      types.push(value);
    }
  }
  return types;
}

function normalizeDomains(domains) {
  return domains
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item && /^[a-z0-9.-]+$/.test(item))
    .slice(0, 10);
}

function parseCosmeticDomainScope(domainScope) {
  if (!domainScope) {
    return { includeDomains: [], excludeDomains: [] };
  }

  const includeDomains = [];
  const excludeDomains = [];

  for (const token of domainScope.split(",")) {
    const value = token.trim();
    if (!value) {
      continue;
    }

    if (value.startsWith("~")) {
      excludeDomains.push(value.slice(1));
    } else {
      includeDomains.push(value);
    }
  }

  return {
    includeDomains: normalizeDomains(includeDomains),
    excludeDomains: normalizeDomains(excludeDomains)
  };
}

function toUrlFilterFromPattern(pattern) {
  if (pattern.startsWith("||") && pattern.endsWith("^")) {
    return pattern;
  }

  if (pattern.startsWith("|http://") || pattern.startsWith("|https://")) {
    return pattern.slice(1);
  }

  if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(pattern)) {
    return `||${pattern}^`;
  }

  const cleaned = pattern.replace(/^\|/, "").replace(/\|$/, "");
  if (cleaned && /^[a-z0-9_./*%^?=&:-]+$/i.test(cleaned)) {
    return cleaned;
  }

  return null;
}

function parseFilterLine(line) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("!") || trimmed.startsWith("[")) {
    return null;
  }

  if (trimmed.includes("#@#") || trimmed.includes("#?#") || trimmed.includes("#$#")) {
    return null;
  }

  if (trimmed.includes("##")) {
    const [domainPart, selector] = trimmed.split("##", 2);
    if (!selector || !selector.trim()) {
      return null;
    }
    const scope = parseCosmeticDomainScope(domainPart.trim());
    return {
      type: "cosmetic",
      selector: selector.trim(),
      includeDomains: scope.includeDomains,
      excludeDomains: scope.excludeDomains
    };
  }

  if (trimmed.startsWith("@@") || trimmed.startsWith("/") || trimmed.includes("$removeparam")) {
    return null;
  }

  const [patternPart, optionsPart] = trimmed.split("$", 2);
  const pattern = patternPart.trim();
  if (!pattern) {
    return null;
  }

  const parsedOptions = parseOptionTokens(optionsPart);

  const urlFilter = toUrlFilterFromPattern(pattern);

  if (!urlFilter) {
    return null;
  }

  return {
    type: "network",
    urlFilter,
    resourceTypes: normalizeResourceTypes(parsedOptions.options),
    initiatorDomains: parsedOptions.domains,
    thirdPartyOnly: parsedOptions.thirdPartyOnly
  };
}

function parseFilters(text) {
  const lines = text.split(/\r?\n/);
  const network = [];
  const cosmeticGlobal = [];
  const cosmeticDomain = [];
  const seenFilters = new Set();
  const seenCosmeticKeys = new Set();

  for (const line of lines) {
    const parsed = parseFilterLine(line);
    if (!parsed) {
      continue;
    }

    if (parsed.type === "network") {
      const key = `${parsed.urlFilter}::${parsed.resourceTypes.join("|")}::${parsed.initiatorDomains.join("|")}::${parsed.thirdPartyOnly}`;
      if (seenFilters.has(key)) {
        continue;
      }
      seenFilters.add(key);
      network.push(parsed);
      continue;
    }

    if (parsed.type === "cosmetic") {
      const key = `${parsed.selector}::${parsed.includeDomains.join("|")}::${parsed.excludeDomains.join("|")}`;
      if (seenCosmeticKeys.has(key)) {
        continue;
      }
      seenCosmeticKeys.add(key);

      if (parsed.includeDomains.length === 0 && parsed.excludeDomains.length === 0) {
        cosmeticGlobal.push(parsed.selector);
      } else {
        cosmeticDomain.push({
          selector: parsed.selector,
          includeDomains: parsed.includeDomains,
          excludeDomains: parsed.excludeDomains
        });
      }
    }
  }

  return { network, cosmeticGlobal, cosmeticDomain };
}

function scoreNetworkFilter(filter) {
  let score = 0;
  if (filter.urlFilter.startsWith("||")) {
    score += 5;
  }
  if (filter.urlFilter.includes("/")) {
    score += 2;
  }
  if (filter.resourceTypes.length > 0) {
    score += 2;
  }
  if (filter.initiatorDomains.length > 0) {
    score += 1;
  }
  return score;
}

function sortNetworkFilters(networkFilters) {
  return [...networkFilters].sort((a, b) => scoreNetworkFilter(b) - scoreNetworkFilter(a));
}

function computeParsedFingerprint(network, cosmeticGlobal, cosmeticDomain) {
  const parts = [
    `n:${network.length}`,
    `cg:${cosmeticGlobal.length}`,
    `cd:${cosmeticDomain.length}`
  ];

  const networkSlice = network.slice(0, 96);
  for (const item of networkSlice) {
    parts.push(
      `u:${item.urlFilter}|r:${item.resourceTypes.join(".")}|i:${item.initiatorDomains.join(".")}|t:${item.thirdPartyOnly ? 1 : 0}`
    );
  }

  const cosmeticGlobalSlice = cosmeticGlobal.slice(0, 96);
  for (const selector of cosmeticGlobalSlice) {
    parts.push(`cg:${selector}`);
  }

  const cosmeticDomainSlice = cosmeticDomain.slice(0, 96);
  for (const rule of cosmeticDomainSlice) {
    parts.push(`cd:${rule.selector}|i:${rule.includeDomains.join(".")}|e:${rule.excludeDomains.join(".")}`);
  }

  return parts.join("\u001f");
}

function buildDynamicRules(networkFilters) {
  const rules = [];
  let id = DYNAMIC_RULE_START;

  for (const filter of networkFilters) {
    if (rules.length >= DYNAMIC_RULE_LIMIT) {
      break;
    }

    const condition = {
      urlFilter: filter.urlFilter,
      resourceTypes:
        filter.resourceTypes.length > 0
          ? filter.resourceTypes
          : ["script", "xmlhttprequest", "sub_frame", "image", "media"]
    };

    if (filter.initiatorDomains.length > 0) {
      condition.initiatorDomains = filter.initiatorDomains.slice(0, 10);
    }

    if (filter.thirdPartyOnly) {
      condition.domainType = "thirdParty";
    }

    rules.push({
      id,
      priority: 1,
      action: { type: "block" },
      condition
    });

    id += 1;
  }

  return rules;
}

async function fetchList(url) {
  const response = await fetch(url, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Failed list fetch: ${url} (${response.status})`);
  }
  return response.text();
}

function buildConditionalRequestHeaders(cacheEntry) {
  if (!cacheEntry) {
    return undefined;
  }

  const headers = {};
  if (cacheEntry.etag) {
    headers["If-None-Match"] = cacheEntry.etag;
  }
  if (cacheEntry.lastModified) {
    headers["If-Modified-Since"] = cacheEntry.lastModified;
  }

  return Object.keys(headers).length > 0 ? headers : undefined;
}

function normalizeSourceCacheEntries(entries) {
  const byUrl = new Map();

  if (!Array.isArray(entries)) {
    return byUrl;
  }

  for (const entry of entries) {
    if (!entry || typeof entry.url !== "string" || typeof entry.text !== "string") {
      continue;
    }

    byUrl.set(entry.url, {
      url: entry.url,
      text: entry.text,
      etag: typeof entry.etag === "string" ? entry.etag : "",
      lastModified: typeof entry.lastModified === "string" ? entry.lastModified : "",
      updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : ""
    });
  }

  return byUrl;
}

async function loadCachedSourcePayloads() {
  const local = await chrome.storage.local.get([SOURCE_CACHE_STORAGE_KEY]);
  return normalizeSourceCacheEntries(local[SOURCE_CACHE_STORAGE_KEY]);
}

function compactCachedTexts(entries) {
  let total = 0;
  const compacted = [];

  for (const entry of entries) {
    if (!entry || typeof entry.text !== "string") {
      continue;
    }
    const size = entry.text.length;
    if (total + size > MAX_TEXT_CACHE_BYTES) {
      continue;
    }
    total += size;
    compacted.push(entry);
  }

  return compacted;
}

async function loadCachedCompiledState() {
  const local = await chrome.storage.local.get([
    "cachedDynamicRules",
    "cachedRemoteCosmeticSelectors",
    "cachedRemoteCosmeticDomainRules",
    "filterSelfie",
    "remoteRulesMeta"
  ]);
  return {
    rules: Array.isArray(local.cachedDynamicRules) ? local.cachedDynamicRules : [],
    selectors: Array.isArray(local.cachedRemoteCosmeticSelectors)
      ? local.cachedRemoteCosmeticSelectors
      : [],
    domainRules: Array.isArray(local.cachedRemoteCosmeticDomainRules)
      ? local.cachedRemoteCosmeticDomainRules
      : [],
    selfie:
      local.filterSelfie && local.filterSelfie.schemaVersion === SELFIE_SCHEMA_VERSION
        ? local.filterSelfie
        : null,
    remoteMeta: local.remoteRulesMeta || null
  };
}

async function applyDynamicRulesAndSelectors(rules, selectors, domainRules) {
  const existingDynamic = await chrome.declarativeNetRequest.getDynamicRules();

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingDynamic.map((rule) => rule.id),
    addRules: rules
  });

  await chrome.storage.local.set({
    remoteCosmeticSelectors: selectors,
    remoteCosmeticDomainRules: domainRules
  });
}

async function persistSelfieSnapshot({ fingerprint, rules, selectors, domainRules, sourceUrls }) {
  const createdAt = toIsoTime(nowMs());
  await chrome.storage.local.set({
    filterSelfie: {
      schemaVersion: SELFIE_SCHEMA_VERSION,
      fingerprint,
      sourceUrls,
      createdAt,
      dynamicRuleCount: rules.length,
      selectorCount: selectors.length,
      domainSelectorCount: domainRules.length
    },
    cachedDynamicRules: rules,
    cachedRemoteCosmeticSelectors: selectors,
    cachedRemoteCosmeticDomainRules: domainRules
  });
}

async function warmFromSelfieIfNeeded(settings) {
  if (!settings.enabled || !settings.useRemoteLists) {
    return;
  }

  const local = await loadCachedCompiledState();
  if (!local.selfie || local.rules.length === 0) {
    return;
  }

  const dynamic = await chrome.declarativeNetRequest.getDynamicRules();
  if (dynamic.length > 0) {
    return;
  }

  await applyDynamicRulesAndSelectors(local.rules, local.selectors, local.domainRules);
}

async function updateRemoteFilterLists(options = {}) {
  const force = Boolean(options.force);
  const settings = await getSettings();
  if (!settings.enabled || !settings.useRemoteLists) {
    return { skipped: true, reason: "Remote lists disabled" };
  }

  const localState = await loadCachedCompiledState();
  if (!force && localState.remoteMeta && !isOlderThanMinutes(localState.remoteMeta.lastUpdatedAt, AUTO_UPDATE_INTERVAL_MINUTES)) {
    return { skipped: true, reason: "Recent update still fresh" };
  }

  const cachedSources = await loadCachedSourcePayloads();

  const listResults = await Promise.all(
    LIST_URLS.map(async (url) => {
      try {
        const cacheEntry = cachedSources.get(url) || null;
        const headers = buildConditionalRequestHeaders(cacheEntry);
        const response = await fetch(url, {
          cache: "no-cache",
          headers
        });

        if (response.status === 304) {
          if (!cacheEntry) {
            throw new Error(`Missing cached source for unchanged list: ${url}`);
          }

          return {
            ok: true,
            url,
            text: cacheEntry.text,
            notModified: true,
            etag: cacheEntry.etag,
            lastModified: cacheEntry.lastModified
          };
        }

        if (!response.ok) {
          throw new Error(`Failed list fetch: ${url} (${response.status})`);
        }

        const text = await response.text();
        return {
          ok: true,
          url,
          text,
          notModified: false,
          etag: response.headers.get("etag") || "",
          lastModified: response.headers.get("last-modified") || ""
        };
      } catch (error) {
        return { ok: false, url, error: String(error) };
      }
    })
  );

  const succeeded = listResults.filter((item) => item.ok);
  const failed = listResults.filter((item) => !item.ok);
  const allListsUnchanged =
    succeeded.length === LIST_URLS.length && succeeded.every((item) => item.notModified);

  const allNetwork = [];
  const allCosmeticGlobal = [];
  const allCosmeticDomain = [];

  if (!allListsUnchanged && succeeded.length > 0) {
    for (const item of succeeded) {
      const parsed = parseFilters(item.text);
      allNetwork.push(...parsed.network);
      allCosmeticGlobal.push(...parsed.cosmeticGlobal);
      allCosmeticDomain.push(...parsed.cosmeticDomain);
    }
  }

  let dynamicRules = buildDynamicRules(sortNetworkFilters(allNetwork));
  let cosmeticSelectors = allCosmeticGlobal.slice(0, COSMETIC_SELECTOR_LIMIT);
  let cosmeticDomainRules = allCosmeticDomain.slice(0, COSMETIC_DOMAIN_RULE_LIMIT);
  let usedCachedFallback = false;
  let parsedNetworkCount = allNetwork.length;
  let parsedCosmeticCount = allCosmeticGlobal.length + allCosmeticDomain.length;
  let parsedFingerprint = computeParsedFingerprint(allNetwork, allCosmeticGlobal, allCosmeticDomain);

  if (allListsUnchanged && localState.selfie && localState.rules.length > 0) {
    dynamicRules = localState.rules;
    cosmeticSelectors = localState.selectors;
    cosmeticDomainRules = localState.domainRules;
    usedCachedFallback = true;
    parsedNetworkCount = localState.remoteMeta?.parsedNetwork ?? dynamicRules.length;
    parsedCosmeticCount = localState.remoteMeta?.parsedCosmetic ?? cosmeticSelectors.length + cosmeticDomainRules.length;
    parsedFingerprint = localState.selfie.fingerprint;
  }

  if (dynamicRules.length === 0) {
    const cached = await loadCachedCompiledState();
    if (cached.rules.length > 0) {
      dynamicRules = cached.rules;
      cosmeticSelectors = cached.selectors;
      cosmeticDomainRules = cached.domainRules;
      usedCachedFallback = true;
    }
  }

  if (dynamicRules.length === 0) {
    throw new Error("No usable dynamic rules from remote lists or cache");
  }

  const previousFingerprint = localState.selfie?.fingerprint || "";
  const hasChanged = parsedFingerprint !== previousFingerprint || usedCachedFallback;

  if (hasChanged) {
    await applyDynamicRulesAndSelectors(dynamicRules, cosmeticSelectors, cosmeticDomainRules);
    await persistSelfieSnapshot({
      fingerprint: parsedFingerprint,
      rules: dynamicRules,
      selectors: cosmeticSelectors,
      domainRules: cosmeticDomainRules,
      sourceUrls: LIST_URLS
    });
  }

  const sourcePayloads = [];
  for (const item of succeeded) {
    sourcePayloads.push({
      url: item.url,
      text: item.text,
      etag: item.etag || "",
      lastModified: item.lastModified || "",
      updatedAt: new Date().toISOString()
    });
  }

  const storagePayload = {
    sourceHealth: {
      ok: succeeded.map((item) => item.url),
      failed: failed.map((item) => ({ url: item.url, error: item.error }))
    },
    remoteRulesMeta: {
      sourceCount: LIST_URLS.length,
      sourceSuccess: succeeded.length,
      sourceFailed: failed.length,
      parsedNetwork: parsedNetworkCount,
      appliedNetwork: dynamicRules.length,
      parsedCosmetic: parsedCosmeticCount,
      storedCosmetic: cosmeticSelectors.length,
      storedDomainCosmetic: cosmeticDomainRules.length,
      parsedFingerprint,
      unchangedSnapshot: !hasChanged,
      usedCachedFallback,
      lastUpdatedAt: new Date().toISOString()
    }
  };

  if (!allListsUnchanged || !cachedSources.size) {
    storagePayload[SOURCE_CACHE_STORAGE_KEY] = sourcePayloads;
  }

  await chrome.storage.local.set(storagePayload);

  return {
    skipped: false,
    fetched: succeeded.length,
    failed: failed.length,
    unchangedSnapshot: !hasChanged,
    usedCachedFallback,
    parsedNetwork: parsedNetworkCount,
    appliedNetwork: dynamicRules.length,
    parsedCosmetic: parsedCosmeticCount,
    remoteMeta: {
      sourceCount: LIST_URLS.length,
      sourceSuccess: succeeded.length,
      sourceFailed: failed.length,
      parsedNetwork: parsedNetworkCount,
      appliedNetwork: dynamicRules.length,
      parsedCosmetic: parsedCosmeticCount,
      storedCosmetic: cosmeticSelectors.length,
      storedDomainCosmetic: cosmeticDomainRules.length,
      parsedFingerprint,
      unchangedSnapshot: !hasChanged,
      usedCachedFallback,
      lastUpdatedAt: new Date().toISOString()
    }
  };
}

async function getSettings() {
  const stored = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...stored };
}

async function setSettings(nextSettings) {
  await chrome.storage.sync.set(nextSettings);
}

async function applyRulesets(settings) {
  const enableRulesetIds = [];
  const disableRulesetIds = [];

  for (const [rulesetId, key] of Object.entries(RULESET_MAP)) {
    const shouldEnable = settings.enabled && Boolean(settings[key]);
    if (shouldEnable) {
      enableRulesetIds.push(rulesetId);
    } else {
      disableRulesetIds.push(rulesetId);
    }
  }

  await chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds,
    disableRulesetIds
  });
}

async function updateBadge(settings) {
  if (!settings.enabled) {
    await chrome.action.setBadgeText({ text: "OFF" });
    await chrome.action.setBadgeBackgroundColor({ color: "#4a4a4a" });
    return;
  }

  const layers = [
    settings.blockAds,
    settings.blockTrackers,
    settings.blockMalware,
    settings.useRemoteLists
  ].filter(Boolean).length;

  await chrome.action.setBadgeText({ text: String(layers) });
  await chrome.action.setBadgeBackgroundColor({ color: "#0a7f3f" });
}

async function ensureUpdateAlarm() {
  const existing = await chrome.alarms.get(UPDATE_ALARM);
  if (existing) {
    return;
  }
  await chrome.alarms.create(UPDATE_ALARM, {
    delayInMinutes: STARTUP_WARM_CHECK_DELAY_MINUTES,
    periodInMinutes: AUTO_UPDATE_INTERVAL_MINUTES
  });
}

async function syncProtectionState() {
  const settings = await getSettings();
  await applyRulesets(settings);
  await updateBadge(settings);
  await warmFromSelfieIfNeeded(settings);
  await ensureUpdateAlarm();
}

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  const merged = { ...DEFAULT_SETTINGS, ...existing };
  await setSettings(merged);
  await syncProtectionState();
  try {
    await updateRemoteFilterLists({ force: true });
  } catch (_error) {
    // Initial list fetch may fail due to network availability.
  }
});

chrome.runtime.onStartup.addListener(async () => {
  await syncProtectionState();
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== UPDATE_ALARM) {
    return;
  }
  try {
    await updateRemoteFilterLists({ force: false });
  } catch (_error) {
    // Retry on next interval.
  }
});

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area !== "sync") {
    return;
  }

  const relevantKeys = [
    "enabled",
    "blockAds",
    "blockTrackers",
    "blockMalware",
    "useRemoteLists"
  ];

  const hasRelevantChange = relevantKeys.some((key) => key in changes);
  if (!hasRelevantChange) {
    return;
  }

  await syncProtectionState();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message !== "object") {
    sendResponse({ ok: false, error: "Invalid message" });
    return false;
  }

  if (message.type === "getSettings") {
    Promise.all([getSettings(), chrome.storage.local.get(["remoteRulesMeta"])])
      .then(([settings, local]) =>
        sendResponse({
          ok: true,
          settings,
          remoteMeta: local.remoteRulesMeta || null
        })
      )
      .catch((error) => sendResponse({ ok: false, error: String(error) }));
    return true;
  }

  if (message.type === "updateSettings") {
    const candidate = message.settings || {};
    getSettings()
      .then(async (current) => {
        const next = { ...current, ...candidate };
        await setSettings(next);
        await syncProtectionState();
        sendResponse({ ok: true, settings: next });
      })
      .catch((error) => sendResponse({ ok: false, error: String(error) }));
    return true;
  }

  if (message.type === "updateRemoteListsNow") {
    updateRemoteFilterLists({ force: true })
      .then((result) => sendResponse({ ok: true, result }))
      .catch((error) => sendResponse({ ok: false, error: String(error) }));
    return true;
  }

  sendResponse({ ok: false, error: "Unknown message type" });
  return false;
});
