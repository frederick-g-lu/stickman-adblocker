# Architecture Notes

## Extension Runtime Model

- **Manifest V3** with a background service worker.
- **Declarative Net Request (DNR)** performs network-level blocking.
- **Content script** performs cosmetic cleanup and nuisance suppression.
- **Popup UI** controls user settings using `chrome.storage.sync`.
- **Remote list ingestion** pulls EasyList/uBO-compatible sources and compiles them into dynamic DNR rules.

## Blocking Layers

1. Network ad blocking (`rules/core-ads.json`)
2. Tracker blocking (`rules/tracking.json`)
3. Risky/malicious ad source blocking (`rules/malware.json`)
4. Dynamic network rules from remote lists (`src/background/service-worker.js`)
5. Cosmetic cleanup (`src/content/page-cleaner.js`)

## List Engine Pipeline

1. Fetch remote lists (EasyList/EasyPrivacy/uAssets)
2. Parse EasyList/uBO syntax subset:
	- Network patterns: `||domain^`, domain tokens, protocol-anchored entries
	- Cosmetic rules: `##selector`
3. Deduplicate and cap according to MV3 limits
4. Push network filters to `chrome.declarativeNetRequest.updateDynamicRules`
5. Store cosmetic selectors in `chrome.storage.local` for content script usage

## Robustness Enhancements

- Last-known-good cache for compiled dynamic rules and cosmetic selectors.
- Source health tracking (`success`/`failure`) for each list URL.
- Graceful fallback to cached rules when remote sources are temporarily unavailable.
- Parser support for more options (`domain=`, `third-party`) with safe degradation for unsupported syntax.
- Debounced DOM cleanup in content script to reduce heavy mutation churn.

## Safety Approach

- Keep static rulesets segmented by concern for easy maintenance.
- Use settings-driven enable/disable rather than hard-coded behavior.
- Avoid injecting remote code or external script dependencies.
- Keep content-script modifications idempotent and reversible by page reload.
- Use periodic background updates (alarms) instead of page-level remote execution.
- Keep all parser behavior explicit and fail-safe for unsupported syntax.

## Limitations

- MV3 DNR has rule and API constraints compared with legacy blocking models.
- YouTube ad delivery patterns change often and may need regular rule updates.
- Overlay heuristics can produce false positives on rare sites.
- Advanced uBO-specific extended syntax is not fully represented in this lightweight parser.

## Maintenance

- Add new domains to appropriate rules files.
- Keep rule IDs unique within each file.
- Run `node tools/validate.js` before each release.
- Periodically verify remote list endpoint health and update sources if needed.
