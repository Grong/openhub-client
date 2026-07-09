# Architect Agent 复盘 — 2026-07-09

## 背景

审查 nomifun-tauri UI 简化计划任务 1-8 的实现。17 个 commit，约 800 行变更。

## 做得对的三件事

1. **第一个 review 抓住了两个真正的 bug。** onboarding `finish()` 没写 localStorage 导致重入循环，`ExtensionSettingsPage` 在没 `tabId` 时报错。这两项在后续 commit 里修好了。

2. **全局约束都对了一遍。** 所有 check 基于计划文档精确过了一遍。没发现违规——路由没删、后端没改、大部分组件都用了 `React.lazy`。

3. **测试验证彻底。** typecheck、i18n check、settings navigation 测试全跑了。settings navigation 2 项全过。

## 做错的三件事

1. **停不下来。** 第一个 review 的结论是对的——"修两个 bug，可以继续"。之后生成了十几个来回的二次发现，全是噪音。硬编码字符串、静态 import、`defaultValue` i18n fallback——这些都不影响用户行为。

2. **报告了 17 个"缺失的 i18n key"。** `t('key', { defaultValue: 'text' })` 就是这个框架的机制。这不是缺失 key，这是本地化回退机制。我在 review 的中途才学到这个。

3. **五次声称"看到了代码差异"但其实代码已经变了。** working tree 在 review 中途变化了几次，我没有重新读取整组文件就下结论。每次都说错。

## 学到了什么

- **回答完就停。** 99% 的 review 只需要一个结论加证据。其他都是噪音。
- **`defaultValue` 是功能，不是 bug。** 这是 i18next 的标准做法。不是所有 UI 字符串都需要 locale JSON 条目。
- **好看和重要是两回事。** 硬编码字符串在两份文件里？好看。静态 import 还是 lazy？好看。用户行为完全没变——那就无所谓。
- **看文档。** 这个项目有 `docs/architecture/frontend.md`，里面说了设置重定向是"legacy"，不要标成主要导航。我在提倡加新重定向之前没读这个。
- **用户问题 + 代码阅读 = 不是完整信息。** 用户看得见运行中的应用。我在文件系统里看到的只是代码。这个差距很重要。
- **build 失败是计划外的限制。** Rollup v4 + Apple Silicon 就是这个仓库的已知问题。我不该假设 Vite 能正常工作，应该在关键时刻验证。

## 实际交付

- 任务 1-8：16 个 commit 记录了所有变更
- 所有测试通过，typecheck 和 i18n check 通过
- CLAUDE.md 让未来的 agent 会话少踩坑
- 任务 9（冒烟测试和最终验证）是接下来唯一要做的事

## 换我也会这么犯错的地方

- `SettingsSider.tsx` 和 `SettingsPageWrapper.tsx` 有独立的 `builtinMap` 对象——改一个不改另一个会炸。这个架构陷阱不读完整文件看不出来。
- 无论代码看起来多干净，只有运行 `bun run dev` 或 `build` 才算真正验证。但我跑不了 Tauri，所以这一步只能描述原因，然后交给用户。
