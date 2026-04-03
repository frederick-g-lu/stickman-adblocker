const CONTROL_IDS = [
  "enabled",
  "blockAds",
  "blockTrackers",
  "blockMalware",
  "blockCookieWalls",
  "hideDistractions",
  "aggressiveMode",
  "interactiveStickman",
  "useRemoteLists"
];

const statusEl = document.getElementById("status");
const metaEl = document.getElementById("meta");
const refreshButton = document.getElementById("refreshLists");

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#ff6a6a" : "#93a4b8";
}

function readFormState() {
  const next = {};
  for (const id of CONTROL_IDS) {
    const el = document.getElementById(id);
    next[id] = Boolean(el && el.checked);
  }
  return next;
}

function applyFormState(settings) {
  for (const id of CONTROL_IDS) {
    const el = document.getElementById(id);
    if (!el) {
      continue;
    }
    el.checked = Boolean(settings[id]);
  }
}

function formatMeta(meta) {
  if (!meta) {
    return "No list sync metadata yet.";
  }

  const timestamp = meta.lastUpdatedAt ? new Date(meta.lastUpdatedAt).toLocaleString() : "unknown";
  const fallback = meta.usedCachedFallback ? "yes" : "no";
  return `Last sync: ${timestamp} | Sources ok: ${meta.sourceSuccess || 0}/${meta.sourceCount || 0} | Applied network rules: ${meta.appliedNetwork || 0} | Stored cosmetic selectors: ${meta.storedCosmetic || 0} | Cached fallback: ${fallback}`;
}

async function fetchSettings() {
  const response = await chrome.runtime.sendMessage({ type: "getSettings" });
  if (!response || !response.ok) {
    throw new Error(response?.error || "Failed to read settings");
  }
  return response;
}

async function saveSettings() {
  const settings = readFormState();
  setStatus("Saving...");

  const response = await chrome.runtime.sendMessage({
    type: "updateSettings",
    settings
  });

  if (!response || !response.ok) {
    throw new Error(response?.error || "Failed to save settings");
  }

  setStatus("Protection settings updated.");
}

function wireEvents() {
  for (const id of CONTROL_IDS) {
    const el = document.getElementById(id);
    if (!el) {
      continue;
    }
    el.addEventListener("change", () => {
      saveSettings().catch((error) => {
        setStatus(String(error), true);
      });
    });
  }

  refreshButton.addEventListener("click", async () => {
    try {
      refreshButton.disabled = true;
      setStatus("Updating remote lists...");
      const response = await chrome.runtime.sendMessage({ type: "updateRemoteListsNow" });
      if (!response || !response.ok) {
        throw new Error(response?.error || "List update failed");
      }

      metaEl.textContent = formatMeta(response.result?.remoteMeta || null);
      setStatus("Remote filter lists updated.");
    } catch (error) {
      setStatus(String(error), true);
    } finally {
      refreshButton.disabled = false;
    }
  });
}

(async function init() {
  try {
    wireEvents();
    const response = await fetchSettings();
    applyFormState(response.settings);
    metaEl.textContent = formatMeta(response.remoteMeta);
    setStatus("Ready.");
  } catch (error) {
    setStatus(String(error), true);
  }
})();
