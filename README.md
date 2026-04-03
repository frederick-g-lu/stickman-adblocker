# Stickman AdBlock (Chromium Extension)

A production-oriented Manifest V3 Chromium extension inspired by uBlock Origin design principles, focused on:

- Blocking YouTube/video and website ad requests.
- Blocking common tracking/analytics endpoints.
- Blocking risky and known malicious ad domains.
- Reducing nuisance UX such as cookie walls, floating videos, and newsletter popups.

## uBO-Inspired Basis

This project is based on the architecture and filtering approach used by uBlock Origin:

- Multiple independent protection layers (ads, trackers, malware, cosmetic).
- Filter-list driven blocking strategy.
- Periodic list refresh and user-triggered manual refresh.
- Last-known-good fallback to keep protection active during list source outages.

This project doesn't copy uBlock Origin source code. It implements an original codebase that follows similar concepts and uses publicly available filter lists.

## Project Structure

- `manifest.json`: Extension manifest and capability declarations.
- `src/background/service-worker.js`: Protection state management and DNR ruleset control.
- `src/content/page-cleaner.js`: Cosmetic filtering and nuisance overlay cleanup.
- `rules/core-ads.json`: Core ad network and ad URL pattern rules.
- `rules/tracking.json`: Tracker and telemetry blocking rules.
- `rules/malware.json`: Malicious/risky ad domain blocking rules.
- `popup/`: Popup UI for runtime toggles.
- `tools/validate.js`: Local validation script for manifest/rules/basic JS syntax.
- `docs/ARCHITECTURE.md`: Design and safety notes.
- `docs/REFERENCES.md`: Upstream inspirations and filter-list attributions.

## Usage

1. Click the extension icon.
2. Toggle protection layers:
   - Enable protection
   - Block ad networks
   - Block trackers
   - Block risky ad domains
   - Remove cookie walls
   - Hide distractions
   - Aggressive cleanup mode
   - Use remote filter lists

The badge shows:

- `OFF` when disabled.
- A number (`1`-`4`) when enabled, representing active protection layers.

## Validation

node tools/validate.js

This checks:

- manifest format and required fields.
- DNR rules file format and duplicate rule IDs.
- JavaScript syntax.

## Important Notes

- This extension is designed for personal use and iterative improvement.
- Aggressive cleanup can occasionally hide legitimate overlays on some sites.
