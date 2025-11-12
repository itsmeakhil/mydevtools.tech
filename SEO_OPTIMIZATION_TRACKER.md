# SEO Optimization Tracker - MyDevTools.tech

## ✅ Completed
- [x] JSON Formatter
- [x] UUID Generator
- [x] Base64 Encoder

## ⏳ Pending
- [ ] Hash Generator
- [ ] URL Encoder
- [ ] Timestamp Converter
- [ ] Password Generator
- [ ] QR Code Generator
- [ ] JWT Parser
- [ ] URL Shortener
- [ ] Token Generator
- [ ] OTP Generator
- [ ] ULID Generator
- [ ] BCrypt
- [ ] JSON to CSV
- [ ] JSON to YAML
- [ ] JSON to XML
- [ ] JSON to TOML
- [ ] YAML to JSON
- [ ] XML to JSON
- [ ] TOML to JSON
- [ ] TOML to YAML
- [ ] YAML to TOML
- [ ] JSON Diff
- [ ] HTML Entity Converter
- [ ] String Case Converter
- [ ] String Obfuscator
- [ ] Text Diff
- [ ] Text Statistics
- [ ] Markdown Preview
- [ ] Regex Cheatsheet
- [ ] HTTP Status Codes
- [ ] IPv4 Address Converter
- [ ] IPv4 Range Expander
- [ ] IPv4 Subnet Calculator
- [ ] Crontab Generator
- [ ] Chmod Calculator
- [ ] Git Commands
- [ ] Color Converter
- [ ] Emoji Picker
- [ ] ASCII Art Text Generator
- [ ] Lorem Ipsum Generator
- [ ] Numeronym Generator
- [ ] WiFi QR Generator
- [ ] URL Parser
- [ ] Device Info
- [ ] Encrypt/Decrypt Text
- [ ] API Grid

---

Last Updated: Starting optimization

Here are ready-to-use prompts for each phase. Paste them into your AI pair programmer (Cursor/Copilot) as you work.

### Phase 1 — Structure and foundation
- Refactor: “Extract `CollectionsSidebar`, `RequestTabs`, `MethodSelect`, `UrlBar`, `HeadersTable`, `ParamsTable`, `AuthPanel`, `BodyEditor`, `ResponsePanel`, `SaveRequestDialog`, `CreateCollectionDialog` from `src/app/app/api-grid/page.tsx`. Keep behavior identical. No regressions.”
- State helpers: “Create a small module for request-building helpers and types used by API Grid. Move `buildUrl`, `buildHeaders`, `buildBody`, and shared types into `src/lib/api-grid/`. Rewire imports.”
- Performance: “Memoize heavy child components and use `useCallback`/`useMemo` appropriately to reduce re-renders across the API Grid.”
- Code-splitting: “Dynamically import `BodyEditor` and `JSONViewer` in API Grid with loading fallbacks.”

### Phase 2 — Request builder enhancements
- Environments: “Add Environments to API Grid stored under `users/{uid}/apiGrid/environments` in Firestore. Support `${VAR}` interpolation in URL, headers, and body with a preview. Provide environment switcher.”
- Presets: “Add quick-add presets for common headers (JSON, form-data, auth) and auth helpers (bearer/basic/apiKey) with ‘apply to query/header’ toggle.”
- cURL/HAR import: “Implement ‘Import from cURL/HAR’ modal. Parse cURL/HAR into method, URL, headers, body, and populate current tab.”
- OpenAPI import: “Add OpenAPI import (URL or file). Parse into a new collection (grouped by tags/paths) with example requests scaffolded.”

### Phase 3 — Response experience
- View modes: “Add Response tabs: Pretty (JSON tree with syntax highlighting), Raw (text), Preview (render images/HTML when safe).”
- Metadata: “Show status badge, duration, and content-length if present. Add copy and ‘save response to file’ actions.”
- Search: “Add in-response search and collapse/expand-all controls for the JSON tree.”

### Phase 4 — History and collections
- History: “Add automatic request history with timestamp, status, and quick re-run. Provide clear-all and range-based clear.”
- Bulk actions: “Enable multi-select request items in collections for bulk delete/move/export. Preserve existing drag-and-drop.”
- Share: “Add ‘Share read-only link’ for a collection by publishing a public JSON snapshot to Firestore and linking to a read-only viewer.”
- Import/export: “Support Postman v2.1 collection import/export alongside the existing internal JSON format.”

### Phase 5 — Code snippets and examples
- Snippets: “Generate code snippets for the current request: cURL, JS fetch, Axios, Python requests, Go net/http. Add copy buttons and method-aware options.”
- Examples: “Create an ‘Examples’ drawer with prebuilt examples for `src/app/api/shorten/route.ts` and `src/app/api/stats/route.ts` including sample payloads.”
- Auth gating: “Read `requiresAuth` from `src/lib/tool-config.ts` and annotate examples or gate them behind login when true.”

### Phase 6 — Server proxy mode and security
- Proxy route: “Add an API route `/api/proxy` that accepts request config, performs server-side fetch with abort support, and returns response. Enforce size/time limits and sanitize headers.”
- UI toggle: “Add ‘Send via server’ toggle in API Grid. When enabled, route traffic through `/api/proxy` and hide secrets from client.”
- Redaction: “Redact auth values in logs and UI where appropriate. Ensure secrets are not persisted in history or accidental exports.”

### Phase 7 — A11y, polish, and telemetry
- Accessibility: “Add ARIA roles/labels, focus traps in dialogs, and keyboard navigation across panels. Provide a ‘?’ shortcut to open a shortcut cheatsheet.”
- UX polish: “Add skeletons for loading states, empty-state illustrations/messages, and confirm dialogs for destructive actions.”
- Telemetry: “Add privacy-safe usage events (feature toggles, imports, sends) to guide future optimization. Respect opt-out.”

### Phase 8 — Tests and hardening
- Unit tests: “Write tests for `buildUrl`, `buildHeaders`, `buildBody`, variable interpolation, cURL parser, and OpenAPI parser.”
- Integration: “Add tests for send-request flow (client and proxy), OpenAPI import to collections, and collection CRUD.”
- Performance audit: “Measure render counts for API Grid subcomponents; add memoization or keying fixes where needed.”

Optional — Registry integration
- Metadata integration: “Use `getAllToolsMetadata()` from `src/lib/tools-registry.ts` to surface a ‘Tool APIs’ panel; allow adding endpoints as example requests with tags/categories and `requiresAuth` badges.”

I can start with Phase 1 by extracting components and adding dynamic imports if you want.