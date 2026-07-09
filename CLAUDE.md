# NomiFun — CLAUDE.md

## Architect Agent Guidelines (2026-07-09 postmortem)

1. **Answer the question, then stop.** The first answer is usually sufficient. Only extend if asked.
2. **Read `docs/architecture/` before making architecture claims.** This project has `frontend.md`, `backend-crates.md`, `agent-engine.md`, `overview.md`, etc. Read the relevant ones.
3. **`t('key', { defaultValue: 'text' })` is the i18n fallback mechanism.** It is not a missing key. The locale JSON file is optional; the `defaultValue` prop is how the system is designed to work.
4. **Distinguish matters from noticeables.** Logic errors that change user-visible behavior matter. Dead imports (tree-shaken), static import vs `React.lazy`, hardcoded strings in 2 files owned by the same team — these are noticeable but do not matter in review.
5. **If the user questions a finding 3 times, you are probably wrong.** Stop defending. Ask what they are seeing. You cannot see the running app or screenshots.
6. **"Proceed" is a valid review conclusion.** Not every review needs to find something.
7. **Check `git status` at the start.** Working tree changes during review should be noted once, not reacted to as new findings.

## Key Paths

- **Frontend SPA:** `ui/src/renderer/`
- **Routes (source of truth):** `ui/src/renderer/components/layout/Router.tsx` (HashRouter)
- **Sidebar:** `ui/src/renderer/components/layout/Sider/index.tsx`
- **SiderNav entries:** `ui/src/renderer/components/layout/Sider/SiderNav/`
- **Settings sidebar:** `ui/src/renderer/pages/settings/components/SettingsSider.tsx`
- **Settings page wrapper (mobile nav):** `ui/src/renderer/pages/settings/components/SettingsPageWrapper.tsx`
- **i18n type keys:** `ui/src/renderer/services/i18n/i18n-keys.d.ts`
- **i18n locale files:** `ui/src/renderer/services/i18n/locales/zh-CN/` and `en-US/`
- **Architecture docs:** `docs/architecture/`
- **Plan/spec docs:** `docs/superpowers/`

## Tech Stack

- React 19 + TypeScript (strict)
- Vite 6 bundler
- react-router-dom v7 (HashRouter)
- Arco Design UI library
- UnoCSS (utility classes)
- i18next / react-i18next (zh-CN + en-US)
- @icon-park/react **v1.4.2** (verify icon names against this version — not all icons from newer versions exist)
- SWR for remote data
- Bun (package manager + test runner)
- Tauri 2 desktop shell

## Architecture

- Single React SPA served in both Tauri desktop WebView and self-hosted web server
- Backend is a Rust axum server (`nomifun-app`, binary `nomicore`) running in-process
- Communication: HTTP REST + WebSocket (desktop uses loopback port with `x-nomi-local-trust` auth)
- Route structure: `HashRouter` with `/onboarding` and `/login` outside `ProtectedLayout`; all other routes inside

### Settings Architecture

- `SettingsSider.tsx` exports `BUILTIN_TAB_IDS` — defines visible tab order
- `SettingsPageWrapper.tsx` imports `BUILTIN_TAB_IDS` for mobile top-nav (has its own `builtinMap`)
- Both files have independent `builtinMap` objects that must be kept in sync
- Each tab ID needs an entry in both `builtinMap` objects AND a matching route in `Router.tsx`
- Legacy settings paths (e.g., `/settings/model`, `/settings/agent`) are redirects — documented as "do not use as primary navigation" in `docs/architecture/frontend.md:72-76`

## Constraints (UI Simplification Plan)

- No backend API changes
- No route deletions — only sidebar visibility changes
- `React.lazy` for new components
- i18n keys use existing naming conventions

## Commands

```bash
bun run typecheck          # TypeScript compilation check
bun run check:i18n         # Validate i18n type keys against locale files
bun run gen:i18n           # Regenerate i18n-keys.d.ts from locale files
bun run test               # Run tests
```
