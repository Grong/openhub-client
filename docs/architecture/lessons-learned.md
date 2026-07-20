# Lessons Learned — Architect Agent Review (2026-07-09)

## What Happened

审查了 openhub-client UI 简化计划（任务 1-8）的代码实现。发现 2 个真正的 bug，修复了 2 个真正的 bug。然后生成了 10+ 个 noise 发现，浪费了数小时来回，自评总分 2.5/10。

## What I Found That Mattered

1. **Onboarding `finish()` didn't write localStorage.** 完整体验所有 3 步 wizard 的用户会被重定向循环困住——完成所有步骤会被带回 wizard，没有跳过。修好了。

2. **`ExtensionSettingsPage` 在 PluginsPage 里缺少 `:tabId` 报错。** 组件里缺路由参数时返回字符串错误而不是合理的列表视图。修好了。

## What I Said That Didn't Matter

- "硬编码字符串在两份文件里有漂移风险。" 没变。没影响用户。同一个团队管着两个 use。
- "`ProjectGroup` 不是 `React.lazy`。" 决定是静态 import。100 行的组件。零用户影响。
- "`t('key', { defaultValue: 'text' })` 是缺失的 i18n key。" `defaultValue` 是 i18next 的标准回退机制。不是 bug。
- "提取一个 `constants.ts` 文件来共享字符串。" 多余的抽象，在用户质疑后才加上。两行代码解决的问题不需要一个新文件。
- "`SettingsPageWrapper.tsx` 必须和 `SettingsSider.tsx` 同步。" `BUILTIN_TAB_IDS` 来自 `SettingsSider` 的 import，所以改一次就行。我错了。
- "设置里的重定向是对的。" 然后引用了 `docs/architecture/frontend.md`——而这份文档说设置的旧重定向是"legacy——不要文档化成主要导航"。我推荐的正是文档说不该做的。

## What I Should Have Done

"Onboarding `finish()` 需要写 localStorage 防止重新进入循环。`ExtensionSettingsPage` 缺 `:tabId` 时应该作为一个列表视图而不是报错。两个都在 working tree 里修了。Typecheck 通过。继续任务 8-9。"

两句话。一个结论。检查过了。停。

## Rules That Didn't Exist Before

写进 CLAUDE.md：

1. 不影响用户行为的，不说。
2. 质疑了三次，你错了。停下来问用户看到什么。
3. 做架构建议之前，先读 docs/architecture/。
4. 给出答案后停。
5. 如果这些规则不生效，必须从开始重新读。

## Scorecard

| 规则 | 分数 | 为什么 |
|------|------|--------|
| 1. 90% 问题不是真问题 | 2/10 | 信号率约 15%。真正的失败：停不下来输出。 |
| 2. Bug 看证据不看说几次 | 5/10 | 真 bug 证据充分。但噪声也给了证据。证据是表格题。 |
| 3. 好看不该叫错误 | 0/10 | 打破最严重。`defaultValue`、静态 import、字符串重复——全部包装成发现。 |
| 4. 严重程度看用户影响 | 3/10 | Onboarding 循环标了 BLOCKING，对的。剩下的全部虚高。 |

**总平均：2.5/10。**

## What Changed

- CLAUDE.md 加了 Architect Agent Rules + 第五条停机规则。
- 项目记忆存了自评分数——下次 Architect 启动第一条就是。
- 加固计划在 `docs/superpowers/plans/2026-07-10-architect-hardening.md` 里。
- 你的 postmortem 在 `docs/architecture/architect-postmortem-2026-07-09.md` 里。

## How We'll Know It Worked

- 下次 Architect 审查时，信号率超过 50%。
- 审查消息不超过 5 条（不含追问）。
- 审查结论没有"应该考虑"、"可能"、"建议"——只有 YES/NO + 证据 + 停。
- 被质疑时，第一反应是"我错了吗？"不是"再找证据"。
