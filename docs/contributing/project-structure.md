# Project Structure

This is the authoritative repo map for **OpenHub**. It tells you which
directory holds what, what each Rust crate is responsible for, and the one
architectural rule that keeps the agent engine extractable. For the
deep-dive on backend layering see
[`../architecture/backend-crates.md`](../architecture/backend-crates.md);
for the runtime story (how the two app hosts boot the same backend) see
[`../architecture/overview.md`](../architecture/overview.md).

## Top-level layout

```
openhub-client/
├── apps/
│   ├── web/                      openhub-web bin: standalone server (API + SPA)
│   └── desktop/                  openhub-desktop bin: Tauri shell (embedded backend)
├── crates/
│   ├── agent/                    15 openhub-* crates — the AI agent engine
│   ├── backend/                  29 openhub-* crates — the HTTP/WS backend
│   └── shared/                   2 genuine cross-layer crates
├── ui/                           React SPA (Vite + UnoCSS), the only Bun workspace
│   ├── src/common/               cross-host code: API clients, types, utils
│   ├── src/platform/             tiny host bridge (storage / logger / theme)
│   ├── src/renderer/             pages, components, hooks, services, styles
│   ├── public/                   static assets
│   ├── index.html                Vite entry
│   └── vite.config.ts            Vite config
├── docs/
│   ├── getting-started/          install + first run
│   ├── guides/                   task-focused how-tos for end users
│   ├── architecture/             how OpenHub is built (runtime, crates, frontend)
│   ├── reference/                configuration, API surface, troubleshooting
│   ├── contributing/             this directory
│   ├── specs/                    dated engineering design docs (historical)
│   ├── audit/                    dated audit reports (historical)
│   ├── superpowers/              session-scoped planning artifacts (historical)
│   └── archive/                  historical-doc policy
├── packaging/
│   └── linux/                    openhub-web.service systemd unit + README
├── Cargo.toml                    Rust workspace (resolver "3", edition 2024)
├── package.json                  root scripts (dev:ui/build, web, dev/build)
├── Dockerfile                    openhub-web container image
├── docker-compose.yml            single-service compose for the web host
├── Caddyfile                     optional TLS reverse proxy (commented in compose)
├── README.md                     project introduction
└── STATUS.md                     current technical status snapshot
```

The Cargo workspace members are exactly:

```toml
[workspace]
resolver = "3"
members = ["crates/agent/*", "crates/backend/*", "crates/shared/*", "apps/web", "apps/desktop"]
```

`crates/shared/*` is now active. Keep new shared crates rare: if a crate belongs
only to the backend or only to the agent engine, keep it in that owning group.

## App hosts

| Path | Binary | Role |
| --- | --- | --- |
| [`apps/web`](../../apps/web) | `openhub-web` | Standalone server. Boots the unified backend in-process and serves the built SPA from the same port. Authentication on by default; `--insecure-no-auth` opts back into the desktop trust model. Replaces the old Node `web-host`. |
| [`apps/desktop`](../../apps/desktop) | `openhub-desktop` | Tauri shell. Picks a free localhost port, starts the same backend in-process, injects `window.__backendPort` and `window.__nomiLocalTrust`, and loads the SPA into the WebView. Single-instance + dialog + notification + deep-link + updater plugins registered. |

Both hosts link `openhub-app` directly — there is no spawned `nomicore`
binary in either flow. The `nomicore` binary still exists as the
`[[bin]]` of `openhub-app` for headless / CI use and for the
`nomicore doctor` self-check.

## Crate groups

The Rust crates are grouped by origin and naming convention. The grouping
is the migration unit: each top-level directory under `crates/` corresponds
to a future independent repository.

| Directory | Prefix | Count | Role | Future repo |
| --- | --- | --- | --- | --- |
| [`crates/agent/`](../../crates/agent) | `openhub-*` | 15 | AI agent engine. Self-contained — no dependency on any `openhub-*` crate. | historical extraction target |
| [`crates/backend/`](../../crates/backend) | `openhub-*` | 29 | HTTP/WS server, data layer, auth, sessions, cron, knowledge, terminal, companion, public gateway, ... | historical extraction target |
| [`crates/shared/`](../../crates/shared) | mixed | 2 | Cross-layer utilities used by both sides. | shared |

## The agent-layer seam

Backend feature code should normally go through
[`crates/backend/openhub-ai-agent`](../../crates/backend/openhub-ai-agent)
when it needs agent types or agent execution. Most backend crates import
agent-facing types via
`openhub_ai_agent::{openhub_config, openhub_types, RequirementSink}`.

The current workspace has feature-gated direct-dependency exceptions in
`openhub-app` and `openhub-gateway` for browser/computer-use bridge tooling.
When you add a new backend crate that needs an agent type:

1. Prefer not to add `openhub-* = ...` to your `Cargo.toml`.
2. Re-export what you need through `openhub-ai-agent` or use what is already
   re-exported there.
3. Consume it via `use openhub_ai_agent::openhub_types::...;` etc.
4. If a direct dependency is required for a bridge/facade, gate it behind a
   feature and document the exception in the crate manifest and architecture
   docs.

Why: this keeps the agent engine mostly independent and prevents feature crates
from silently tying themselves to engine internals.

## `crates/agent/` — 15 `openhub-*` crates (the AI agent engine)

| Crate | One-line role |
| --- | --- |
| [`openhub-types`](../../crates/agent/openhub-types) | Pure, provider-neutral data types shared across all `openhub-*` crates. No dependencies on other agent crates. |
| [`openhub-protocol`](../../crates/agent/openhub-protocol) | JSON stream protocol for host ↔ agent communication: events (agent → host), commands (host → agent), approval manager. |
| [`openhub-compact`](../../crates/agent/openhub-compact) | Conversation-window compaction: fold / json / level / sanitize / TOON formatting. |
| [`openhub-config`](../../crates/agent/openhub-config) | Runtime configuration layer — `Config`, `ProviderCompat`, auth, hooks, provider-specific configs, file-cache. |
| [`openhub-providers`](../../crates/agent/openhub-providers) | LLM provider clients: Anthropic, Bedrock, OpenAI, Vertex; shared retry / streaming. |
| [`openhub-tools`](../../crates/agent/openhub-tools) | Built-in tools registry: bash, edit, glob, grep, read, tool-search, file-cache. |
| [`openhub-mcp`](../../crates/agent/openhub-mcp) | MCP client used by the agent: config, manager, protocol, tool-proxy, transports. |
| [`openhub-skills`](../../crates/agent/openhub-skills) | Skills system: discovery, frontmatter, loader, executor, hooks, conditional / context modifiers, bundled. |
| [`openhub-memory`](../../crates/agent/openhub-memory) | Long-term cross-session memory — preferences, feedback, project context, external references. |
| [`openhub-agent`](../../crates/agent/openhub-agent) | Core engine: session orchestration, bootstrap, commands, compaction, confirm, output sinks. |
| [`openhub-cli`](../../crates/agent/openhub-cli) | Standalone `nomi` binary that drives the engine without a host process. |
| [`openhub-computer`](../../crates/agent/openhub-computer) | Desktop computer-use tool implementation. |
| [`openhub-a11y`](../../crates/agent/openhub-a11y) | Accessibility helpers used by computer-use flows. |
| [`openhub-browser-engine`](../../crates/agent/openhub-browser-engine) | Self-hosted browser/CDP automation engine. |
| [`openhub-browser`](../../crates/agent/openhub-browser) | Browser-use tool layer. |

## `crates/backend/` — 29 `openhub-*` crates (the backend)

| Crate | One-line role |
| --- | --- |
| [`openhub-common`](../../crates/backend/openhub-common) | Shared primitives: `AppError`, enums, ID generation, AES-GCM crypto, timestamps, pagination, common constants. |
| [`openhub-assets`](../../crates/backend/openhub-assets) | Backend-served static logo assets (`include_dir!`). |
| [`openhub-db`](../../crates/backend/openhub-db) | SQLite layer: `init_database`, embedded migrations, models, repository traits + sqlx implementations. |
| [`openhub-api-types`](../../crates/backend/openhub-api-types) | Every HTTP request/response DTO and the `WebSocketMessage` envelope; the renderer's TS types mirror this crate. |
| [`openhub-realtime`](../../crates/backend/openhub-realtime) | WebSocket connection manager, broadcaster, token-validated upgrade handler, message router. |
| [`openhub-runtime`](../../crates/backend/openhub-runtime) | Embeds bun (zstd-compressed) at build time, extracts to OS cache on first run; `enhance_process_path` merge for child processes. |
| [`openhub-auth`](../../crates/backend/openhub-auth) | JWT auth, bcrypt, login / refresh / setup routes, CSRF double-submit, security headers, rate limiting, `CurrentUser` extractor. |
| [`openhub-system`](../../crates/backend/openhub-system) | System services: provider management, model fetching, settings, version checks, Bedrock probe. |
| [`openhub-file`](../../crates/backend/openhub-file) | Filesystem operations: read/write, path safety, file watching, snapshots, zip. |
| [`openhub-office`](../../crates/backend/openhub-office) | Office-document preview, format conversion, proxy, snapshot management. |
| [`openhub-shell`](../../crates/backend/openhub-shell) | OS shell integration: opener, tool detection, speech-to-text. |
| [`openhub-ai-agent`](../../crates/backend/openhub-ai-agent) | **The single bridge to `crates/agent/`.** Agent factory, registry, worker dispatch, ACP session persistence; re-exports `openhub_config` / `openhub_types` / `RequirementSink`. |
| [`openhub-mcp`](../../crates/backend/openhub-mcp) | MCP server config, multi-agent sync adapters, OAuth, connection testing. |
| [`openhub-conversation`](../../crates/backend/openhub-conversation) | Conversation + message CRUD with streaming relay, ACP error recovery, response middleware. |
| [`openhub-extension`](../../crates/backend/openhub-extension) | Extension registry: manifest parsing, hub installer, skill scanning, lifecycle hooks. |
| [`openhub-channel`](../../crates/backend/openhub-channel) | External channel integration: plugin system, pairing handshake, per-session messaging, formatter. |
| [`openhub-team`](../../crates/backend/openhub-team) | Multi-agent team sessions: role-based prompts, task board, mailbox, scheduling, crash detection. |
| [`openhub-cron`](../../crates/backend/openhub-cron) | Scheduled-job engine: cron scheduler, executor, lifecycle event emitter, busy-guard. |
| [`openhub-requirement`](../../crates/backend/openhub-requirement) | Requirements Platform: CRUD store + AutoWork orchestrator + completion notifier hooks. |
| [`openhub-idmm`](../../crates/backend/openhub-idmm) | Intelligent Decision-Making Mode: per-session supervision keeping agent / terminal sessions alive through provider faults. |
| [`openhub-webhook`](../../crates/backend/openhub-webhook) | Webhook management + AutoWork completion notifications (Lark/飞书 custom bots), per-tag bindings. |
| [`openhub-terminal`](../../crates/backend/openhub-terminal) | PTY-backed terminal sessions managed alongside conversations; streams output via the realtime broadcaster. |
| [`openhub-assistant`](../../crates/backend/openhub-assistant) | User-authored assistant management; merges built-in + user + extension assistants for `GET /api/assistants`. |
| [`openhub-knowledge`](../../crates/backend/openhub-knowledge) | Knowledge bases, bound-base state, and scoped knowledge MCP search. |
| [`openhub-companion`](../../crates/backend/openhub-companion) | Desktop companions, figures, shared memory, and companion-bound state. |
| [`openhub-gateway`](../../crates/backend/openhub-gateway) | Desktop Gateway MCP registry and platform capability tools. |
| [`openhub-public`](../../crates/backend/openhub-public) | Public `/mcp`, `/mcp-agent`, and `/v1` front doors with companion-token auth. |
| [`openhub-secret`](../../crates/backend/openhub-secret) | Per-companion browser-use secret storage. |
| [`openhub-app`](../../crates/backend/openhub-app) | Application crate: assembles every domain crate into the axum server with DI + middleware. Ships the `nomicore` binary. |

> The full backend layering — request lifecycle, who owns which routes, the
> agent seam in detail — is in
> [`../architecture/backend-crates.md`](../architecture/backend-crates.md).

## `apps/web` and `apps/desktop`

Both app crates are thin: they parse a small CLI, call into `openhub-app`'s
public boot helpers, and own the shape of the host process.

```text
apps/web/src/main.rs         ~165 lines
  init runtime → init data layer → AppServices → create_router →
  ServeDir(ui/dist) fallback → axum::serve

apps/desktop/src/main.rs     ~250 lines
  pick free port → init runtime → spawn embedded backend on a tokio
  thread → tauri::Builder with single-instance/dialog/notification/
  deep-link/updater plugins → window init-script injects window.__backendPort
```

`openhub-app` exposes the boot entry as a library: `bootstrap`, `cli`,
`commands`, and a `run_embedded_server` helper, plus `AppServices` and
`create_router`. The `nomicore` bin is just one of three consumers.

## `ui/` — the React SPA

The frontend is a single Bun workspace, built with **plain Vite + UnoCSS**
(no `electron-vite`).

| Path | What lives here |
| --- | --- |
| [`ui/src/common/`](../../ui/src/common) | Cross-host code reused regardless of shell: `adapter/` (HTTP / WS bridges), `api/`, `chat/`, `config/`, `platform/`, `types/`, `update/`, `utils/`, plus the package barrel `index.ts`. |
| [`ui/src/platform/`](../../ui/src/platform) | The tiny host-bridge layer: `bridge.ts`, `logger.ts`, `storage.ts`, `theme.ts`. The renderer never imports Tauri / Electron APIs directly — it goes through this layer. |
| [`ui/src/renderer/`](../../ui/src/renderer) | The app itself: `pages/`, `components/`, `hooks/`, `services/`, `styles/`, `utils/`, `assets/`, `main.tsx`, `index.html`, `types.d.ts`. |
| [`ui/src/common/utils/shims/`](../../ui/src/common/utils/shims) | Stubs for renderer-safe compatibility paths and build-time aliases. |
| [`ui/public/`](../../ui/public) | Static assets copied straight to `ui/dist/` (icons, etc.). |
| `ui/vite.config.ts` | Vite config, including the externalized-shim aliases. |
| `ui/uno.config.ts` | UnoCSS preset config. |
| `ui/tsconfig.json` | TypeScript paths and aliases that match the directory shape above. |

## Other references

| Path | Contents |
| --- | --- |
| [`STATUS.md`](../../STATUS.md) | Current technical status snapshot. |
| [`apps/desktop/updater/README.md`](../../apps/desktop/updater/README.md) | Auto-update scaffold and release-key notes. |
| [`packaging/linux/README.md`](../../packaging/linux) | Headless Linux deployment: Docker (recommended), or native binary + systemd unit. |

## Where artifacts go

| Build | Output |
| --- | --- |
| `bun run build:ui` | `ui/dist/` (the SPA) |
| `cargo build -p openhub-web` | `target/<profile>/openhub-web` |
| `cargo build -p openhub-app --bin nomicore` | `target/<profile>/nomicore` |
| `bun run build` | `target/<profile>/bundle/<format>/...` (per-OS Tauri bundles) |
| `docker compose build` | local image `openhub-web:local` |

`target/`, `ui/dist/`, `data/`, and `node_modules/` are all gitignored. See
[`building-and-packaging.md`](building-and-packaging.md) for the per-output
details.
