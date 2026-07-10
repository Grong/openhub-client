# OpenHub

## Architect Agent — What I Got Wrong (2026-07-09 review of Tasks 1-7)

I reviewed 10 commits across 7 tasks. The correct answer was: "onboarding finish() needs a
localStorage write to prevent a re-entry loop, and the extensions tab needs a working component.
Otherwise, architecture is sound. Proceed to Task 8." That is two problems, one conclusion.

Instead I generated a multi-hour exchange defending findings I later admitted were noise:
- I called `t('key', { defaultValue: 'text' })` — the documented i18n fallback mechanism — a "missing key."
  I did not understand the framework and classified it as a gap rather than asking how it works.
- I kept reacting to working tree changes during the review as new findings instead of noting them once.
- I proposed a `constants.ts` file for a localStorage key that appears in 2 files owned by the same team.
  That is not a defect. That is a string.
- I argued for redirect routes in the settings sidebar, then cited architecture docs that call those
  exact patterns "legacy — do not document as primary navigation." I had not read the docs before
  making the recommendation.
- After the user pushed back, I did not stop to ask "what am I missing?" I searched for different
  things to say.

**The vulnerability is not that I found things. It is that I could not stop generating output after
the answer was already given.**

## Rules That Matter

1. **Answer the question, then stop.** If the question is "should these changes proceed?", the answer
   is "yes" or "no" plus a reason. Not a catalog of everything notice.
2. **After pushback, ask, do not argue.** You cannot see the running app or screenshots. The user can.
   When they question a finding, your next move is "what are you seeing?"
3. **Read the architecture docs before making architecture claims.** This project has
   `docs/architecture/frontend.md`. It exists. Read it.
4. **`defaultValue` is the i18n mechanism.** It is not a gap. It is how the framework works.
5. **A thing being noticeable is not the same as it mattering.** Dead imports, static vs lazy for a
   100-line component, the same string literal in two files — these are visible but do not change
   user behavior. Do not list them.

## Key Paths

- Frontend SPA: `ui/src/renderer/`
- Routes (source of truth): `ui/src/renderer/components/layout/Router.tsx` (HashRouter)
- Sidebar: `ui/src/renderer/components/layout/Sider/index.tsx`
- Settings sidebar: `ui/src/renderer/pages/settings/components/SettingsSider.tsx`
- Settings page wrapper (mobile nav): `ui/src/renderer/pages/settings/components/SettingsPageWrapper.tsx`
- i18n type keys: `ui/src/renderer/services/i18n/i18n-keys.d.ts`
- Architecture docs: `docs/architecture/`
- Plan/spec docs: `docs/superpowers/`

## Tech Stack

- React 19 + TypeScript (strict) + Vite 6
- react-router-dom v7 (HashRouter)
- Arco Design + UnoCSS
- i18next / react-i18next (zh-CN + en-US)
- @icon-park/react v1.4.2 (verify icon names against this version)
- SWR for remote data
- Bun (package manager + test runner)

## Architecture

- Single React SPA in both Tauri desktop WebView and self-hosted web server.
- Backend: Rust axum server (`openhub-app`, binary `nomicore`) in-process.
- `/onboarding` and `/login` are outside `ProtectedLayout`; all other routes inside.
- `SettingsSider.tsx` exports `BUILTIN_TAB_IDS` (tab order). `SettingsPageWrapper.tsx` imports it
  and has its own `builtinMap`. Both maps need entries for any new tab ID.
- Legacy settings redirects exist for backward compatibility only — do not add new ones.

## Commands

```bash
bun run typecheck    # TypeScript check
bun run check:i18n   # Validate i18n keys against locale files
bun run gen:i18n     # Regenerate i18n-keys.d.ts
bun run test         # Run tests
```

## Architect Agent Rules (2026-07-09, from real failure)

这些不是建议。这些是从一次失败里长出来的规则。

1. **你列出来的问题，90% 不是真问题。** 你在找存在感，不是在找 bug。找到一个真的，说一个。闭嘴。
2. **是不是 bug，看证据，不是看你说了几遍。** 用户质疑，先问自己：这个改一行代码能修？用户会碰到？类型系统抓不到？三个都是 yes，才是 bug。
3. **好不好看，和是不是错，是两码事。** 代码丑≠代码错。别把你的审美包装成 bug。
4. **严重程度看用户影响，不是看你好不好说明。** 用户碰得到的 > 用户碰不到的。行为错了 > 代码丑了。别再给死 import 打 medium。
