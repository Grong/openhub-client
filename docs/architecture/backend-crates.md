# Backend Crates

The 29 `openhub-*` crates under [`crates/backend/`](../../crates/backend/) form
the HTTP/WS server. Together they compile into the `openhub-app` library crate
and, via `openhub-app/src/main.rs`, the **`nomicore`** binary. The two app hosts
(`openhub-desktop` and `openhub-web`) link `openhub-app` directly and call
`run_embedded_server` or compose `create_router` themselves.

The grouping below mirrors how the crates depend on each other in the workspace
manifest ([`Cargo.toml`](../../Cargo.toml)). It is not a strict layered DAG —
some feature crates depend on each other — but it gives a cognitive map that
lines up with how a request travels through the server.

## Agent-layer dependency rule

The normal product seam is
[`openhub-ai-agent`](../../crates/backend/openhub-ai-agent/). Feature crates
that need agent concepts should consume them through
`openhub_ai_agent::{openhub_config, openhub_types, RequirementSink}` when possible.

There are deliberate, feature-gated direct-dependency exceptions:

- [`openhub-app`](../../crates/backend/openhub-app/) depends on optional
  `openhub-computer`, `openhub-browser`, `openhub-config`, `openhub-tools`, and
  `openhub-types` for the `mcp-computer-stdio` and `mcp-browser-stdio` bridge
  subcommands.
- [`openhub-gateway`](../../crates/backend/openhub-gateway/) depends on optional
  `openhub-browser`, `openhub-computer`, `openhub-config`, `openhub-tools`, and
  `openhub-types` for the Desktop Gateway browser/computer registries.

Do not add another direct `openhub-*` dependency without documenting why it cannot
go through the normal seam or one of those bridge surfaces.

## Core, data, realtime, runtime

| Crate | Responsibility |
| --- | --- |
| [`openhub-common`](../../crates/backend/openhub-common/) | `AppError`, error chain, enums (`AgentType`, `ConversationStatus`, `MessageType`, `McpServerStatus`, ...), id generation (`generate_prefixed_id` for entity IDs, `generate_id` for tokens), AES-GCM `encrypt_string` / `decrypt_string`, `TimestampMs`, pagination helpers, `constants::DEFAULT_HOST/DEFAULT_PORT/BODY_LIMIT/CSRF_*`. |
| [`openhub-api-types`](../../crates/backend/openhub-api-types/) | Every HTTP request / response DTO, the `WebSocketMessage` envelope, ACP / Nomi / OpenClaw / Remote build-extras. The frontend's TypeScript types mirror this crate. |
| [`openhub-db`](../../crates/backend/openhub-db/) | SQLite via `sqlx`, embedded migrations, repository traits and Sqlite implementations for users, conversations, MCP, requirements, cron, ACP sessions, assistants, terminal sessions, companion tokens, webhooks, and more. Owns the `Database` handle and `init_database`. |
| [`openhub-realtime`](../../crates/backend/openhub-realtime/) | `WebSocketManager`, `BroadcastEventBus`, `/ws` upgrade handler with token validation, message router trait, heartbeat timing, per-connection buffer constants. |
| [`openhub-runtime`](../../crates/backend/openhub-runtime/) | Bundled runtime support for Bun, PATH enhancement for child processes, cross-platform process-tree kill, and a spawn `Builder` with the merged PATH. |
| [`openhub-assets`](../../crates/backend/openhub-assets/) | Embedded static assets (`include_dir!`) shipped with the server. |

## Authentication and session

| Crate | Responsibility |
| --- | --- |
| [`openhub-auth`](../../crates/backend/openhub-auth/) | JWT HS256 (`JwtService`), bcrypt password hashing, login / logout / refresh / change-password / setup routes, `auth_middleware`, **CSRF double-submit cookie** middleware (cookie `openhub-csrf-token`, header `x-csrf-token`), security-headers middleware, **rate limiting** (auth / api / authenticated-action variants), QR-code login token store, `validate_username` / `validate_password`. Exposes `CurrentUser` for handlers. |

## The agent seam

| Crate | Responsibility |
| --- | --- |
| [`openhub-ai-agent`](../../crates/backend/openhub-ai-agent/) | **The single bridge to `crates/agent/`.** Builds the agent factory (ACP / Nomi / OpenClaw / Nanobot / Remote variants), holds the `AgentRegistry` and `WorkerTaskManagerImpl`, persists ACP sessions, broadcasts `AgentStreamEvent`, exposes `agent_routes` (model info, capabilities, slash commands, ...) and `remote_agent_routes`. Re-exports `openhub_config`, `openhub_types`, and `RequirementSink` for the rest of the backend. |

## Feature crates (the bulk of the product)

| Crate | Responsibility |
| --- | --- |
| [`openhub-conversation`](../../crates/backend/openhub-conversation/) | Conversation and message CRUD, send-message route, **streaming relay** that fans backend agent tokens onto `/ws`, ACP error recovery, response middleware (e.g. `/cron` slash-command detection, `<think>` stripping), skill resolver / snapshot, runtime-state persistence. |
| [`openhub-mcp`](../../crates/backend/openhub-mcp/) | MCP server CRUD, **OAuth flow**, multi-CLI sync (`Claude`, `Codex`, `CodeBuddy`, `Gemini`, `Qwen`, `OpenCode`, `Nomi`, `Openhub` adapters under `adapters/`), connection test, session injection of MCP capabilities (incl. built-in image-gen). |
| [`openhub-extension`](../../crates/backend/openhub-extension/) | Extension and skill hub: manifests, dependency graph, classifier, install / enable / disable, packs that bundle skills + MCP servers + assistants. |
| [`openhub-team`](../../crates/backend/openhub-team/) | Multi-agent teams: scheduler, mailbox, task board, crash detection, event loop, the team-MCP server (`mcp/`), the Guide MCP `openhub_create_team` tool, prompts. |
| [`openhub-channel`](../../crates/backend/openhub-channel/) | External chat-channel adapters (Telegram, Lark, DingTalk, WeChat) — feature-gated. New conversations default to **master-agent mode**: companion persona + the Desktop Gateway tools (opt-out per platform via `assistant.{platform}.masterAgent`). |
| [`openhub-gateway`](../../crates/backend/openhub-gateway/) | **Desktop Gateway MCP** — in-process HTTP tool server exposing the whole desktop (conversations, cron, companion memory, requirements, and feature-gated browser/computer tools) as `openhub_*` tools to internal and external agent surfaces. Reached internally via the `nomicore mcp-gateway-stdio` bridge. |
| [`openhub-cron`](../../crates/backend/openhub-cron/) | Scheduled tasks: cron expressions, timezone repair, the cron daemon, slash-command-driven creation. |
| [`openhub-requirement`](../../crates/backend/openhub-requirement/) | **AutoWork orchestrator** — backend-driven, boot-resume, persistent loop. Speaks to the agent layer through `RequirementSink`. |
| [`openhub-idmm`](../../crates/backend/openhub-idmm/) | Intelligent Decision-Making Mode: a per-session supervisor that keeps agent / terminal sessions alive through provider faults and decision stalls (rule tier + sidecar model). See [Intelligent Decision](../guides/intelligent-decision.md). |
| [`openhub-webhook`](../../crates/backend/openhub-webhook/) | Outbound Lark sender, `CompletionNotifier` for finished agent runs. |
| [`openhub-assistant`](../../crates/backend/openhub-assistant/) | Assistant (preset prompt + skill set + MCP set) CRUD, override resolution, import/export. |
| [`openhub-companion`](../../crates/backend/openhub-companion/) | Desktop companion state, figure/image assets, memory/persona data, companion public image serving, and companion-bound token integration. |
| [`openhub-knowledge`](../../crates/backend/openhub-knowledge/) | Knowledge bases, source ingestion, bound-base mount state, and scoped read-only knowledge MCP server. |
| [`openhub-public`](../../crates/backend/openhub-public/) | Companion-token authenticated public front doors: `/mcp`, `/mcp-agent`, and `/v1`. |
| [`openhub-secret`](../../crates/backend/openhub-secret/) | Per-companion browser-use secret storage and credential lookup. |

## Infrastructure features

| Crate | Responsibility |
| --- | --- |
| [`openhub-terminal`](../../crates/backend/openhub-terminal/) | Terminal sessions backed by `portable-pty`, resize, input/output streaming over WS. |
| [`openhub-shell`](../../crates/backend/openhub-shell/) | OS shell helpers: open files in the system, speech-to-text against Deepgram or OpenAI, clipboard / paste integration. |
| [`openhub-file`](../../crates/backend/openhub-file/) | Sandboxed filesystem under the conversation work dir (`browse`, `path_safety`, `watch_service`, `snapshot_service`), zip helpers. |
| [`openhub-office`](../../crates/backend/openhub-office/) | LibreOffice convert/preview pipeline (Office documents → preview). |
| [`openhub-system`](../../crates/backend/openhub-system/) | LLM provider / model lookup, app-level settings, sysinfo, app version-check / self-updater scaffold. |

## The composition root: `openhub-app`

[`openhub-app`](../../crates/backend/openhub-app/) is what the two host binaries
link. It is structured as:

| Module | Role |
| --- | --- |
| `cli.rs` | Top-level `nomicore` clap parser: `--host/--port/--data-dir/--work-dir/--app-version/--local/--log-dir/--log-level` plus subcommands `mcp-requirement-stdio`, `mcp-knowledge-stdio`, `mcp-gateway-stdio`, `mcp-open-stdio`, `mcp-computer-stdio`, `mcp-browser-stdio`, `terminal-hook`, `doctor`, `tools`, `call`, and `agent`. The web host calls `Cli::parse_from(["openhub-web"])` to get a defaulted instance, then overrides what it owns. |
| `bootstrap/` | Layered initialization: `tracing_init` (file + console layers), `work_dir` resolution, `builtin_skills` materialization, `environment::{init_environment,init_data_layer}`, `admin::ensure_admin_credentials` for first-run pre-seed in authenticated mode. |
| `services.rs` | The `AppServices` god-bag: every feature-crate service wired together with the right repositories. Built once via `AppServices::from_config(database, &config)`. |
| `router/` | `create_router(&services)` and the typed `routes`, `state`, `health`, `trace` helpers; `build_assistant_state` / `build_conversation_state` / `build_extension_states` / `build_module_states` / `build_ws_state`. |
| `commands/` | CLI subcommand bodies for the server, current stdio MCP bridges, terminal lifecycle hook, diagnostics, and public capability client commands. |
| `lib.rs` | Public façade: `run_embedded_server`, `AppServices`, `create_router`, `bootstrap` re-exports. This is the only API the host binaries import. |

## Checking direct agent dependencies

If you want to inspect direct `openhub-*` dependencies, scan every backend crate
manifest:

```sh
# from the repo root, on a Unix shell
rg -l 'openhub-[a-z-]+\\s*=' crates/backend/*/Cargo.toml
```

Expect the primary seam (`openhub-ai-agent`) plus the feature-gated bridge
exceptions described above.
