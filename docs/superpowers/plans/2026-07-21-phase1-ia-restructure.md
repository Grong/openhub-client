# 一期 IA 立骨 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 OpenHub 前端切换为「项目为基本单元」的信息架构——新侧边栏（派活/待验收/定时任务/项目/名册/知识库/设置）、guid 首页演化为项目首页、默认落点规则、无项目引导页、待验收队列页，全程零数据层变更、随时可 revert。

**Architecture:** 纯前端改造（React SPA，`ui/src/renderer/`）。一期的"项目"= 现有工作路径（projectWorkpaths）；"待验收"= 现有 `RequirementStatus.NeedsReview` 需求（数据源已存在，零新后端）。被砍域只摘路由不删代码。视觉按 spec §11：明度分层 token + 无边框 + 品牌紫焦点环。

**Tech Stack:** React 19 + TypeScript(strict) + Vite 6 · react-router-dom v7 (HashRouter) · Arco Design + UnoCSS · i18next (zh-CN/en-US) · @icon-park/react v1.4.2 · bun test（结构测试模式）

**Spec:** `docs/superpowers/specs/2026-07-20-product-positioning-design.md`（§3 信息架构、§4 视觉风格、§11 一期设计细则）

## Global Constraints

- 每个任务的完成定义：`bun run typecheck` 通过 + 该任务测试通过（在 `ui/` 下执行）。
- 改 i18n 后必须跑：`bun run gen:i18n && bun run check:i18n`（仓库根目录）。
- i18n 一律双语：zh-CN + en-US，新增 key 放入既有模块（`common.json` / `guid.json` / `requirements.json`），不新建模块。
- 结构测试模式：测试用 `readFileSync` 断言源码包含/不包含特定结构（参照 `ui/src/renderer/pages/conversation/SessionList/WorkpathSectionToolbar.structure.test.ts`）。
- 品牌色一律走 token：`rgb(var(--primary-6))` / `var(--brand)`，禁止写死 hex。
- 圆角只用 `--radius-sm`（8px）/ `--radius-md`（12px）/ `--radius-lg`（20px）/ 999px。
- 明度分层：禁止在新 IA 页面新增 1px border / 分割线（浮层除外），层级用 `--el-*` 变量（Task 1 定义）。
- 图标用 @icon-park/react v1.4.2 已验证存在的名字（Plus, CheckCorrect, Clock, FolderPlus, FolderOpen, EveryUser, BookOne, SettingTwo, Search, Home, Robot, Lightning, Shield, Brain, Down, ArrowUp, CloseSmall, FileQuestion, Video, ChartLine, Write）。
- 一次性迁移重定向已在 CLAUDE.md「不加新 redirect」规则下登记为例外（spec §10.9），仅限 `/requirements*` → 任务板、`/guid` → 项目首页语境，不新增其它。
- 被砍域只摘路由和导航，页面文件保留在磁盘（二期才删）。
- 做减法：能复用不新建（ProjectGroup、useRequirements、LoadErrorResult、GuidInputCard 全部复用）。

---

### Task 1: 明度分层 token + 品牌紫焦点环

**Files:**
- Modify: `ui/src/renderer/styles/themes/default-color-scheme.css`
- Modify: `ui/src/renderer/styles/themes/base.css`
- Test: `ui/src/renderer/styles/themes/elevation.structure.test.ts` (create)

**Interfaces:**
- Produces: CSS 变量 `--el-canvas` / `--el-surface` / `--el-elevated` / `--el-popover`（亮色+暗色各一套）；`:focus-visible` 全局焦点环。

- [ ] **Step 1: 写失败的结构测试**

Create `ui/src/renderer/styles/themes/elevation.structure.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const scheme = readFileSync(join(here, 'default-color-scheme.css'), 'utf8');
const base = readFileSync(join(here, 'base.css'), 'utf8');

describe('elevation tokens (spec 11.1)', () => {
  test('light mode defines all four elevation levels', () => {
    expect(scheme).toContain('--el-canvas: #ffffff');
    expect(scheme).toContain('--el-surface: #f5f5f6');
    expect(scheme).toContain('--el-elevated: #ececee');
    expect(scheme).toContain('--el-popover: rgba(255, 255, 255, 0.85)');
  });

  test('dark mode defines all four elevation levels', () => {
    expect(scheme).toContain('--el-canvas: #141414');
    expect(scheme).toContain('--el-surface: #1c1c1e');
    expect(scheme).toContain('--el-elevated: #262628');
    expect(scheme).toContain('--el-popover: rgba(46, 46, 48, 0.85)');
  });

  test('brand-violet focus ring exists globally (spec 11.2)', () => {
    expect(base).toContain(':focus-visible');
    expect(base).toContain('outline: 2px solid rgb(var(--primary-6))');
    expect(base).toContain('outline-offset: 2px');
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd ui && bun test src/renderer/styles/themes/elevation.structure.test.ts`
Expected: FAIL（`--el-canvas` / `:focus-visible` 不存在）

- [ ] **Step 3: 实现 token 与焦点环**

在 `default-color-scheme.css` 的亮色块（`:root, [data-color-scheme='default']`）末尾追加：

```css
  /* Elevation ramp — 明度分层（spec 11.1）。层级只用明度差表达，禁止 1px 边框。 */
  --el-canvas: #ffffff;
  --el-surface: #f5f5f6;
  --el-elevated: #ececee;
  --el-popover: rgba(255, 255, 255, 0.85);
```

在暗色块（`[data-color-scheme='default'][data-theme='dark']`）末尾追加：

```css
  /* Elevation ramp - Dark Mode */
  --el-canvas: #141414;
  --el-surface: #1c1c1e;
  --el-elevated: #262628;
  --el-popover: rgba(46, 46, 48, 0.85);
```

在 `base.css` 末尾追加：

```css
/* 键盘焦点环（spec 11.2）：无边框风格下唯一的键盘导航信号，不可省略。 */
:focus-visible {
  outline: 2px solid rgb(var(--primary-6));
  outline-offset: 2px;
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd ui && bun test src/renderer/styles/themes/elevation.structure.test.ts`
Expected: 3 pass

- [ ] **Step 5: Commit**

```bash
git add ui/src/renderer/styles/themes/default-color-scheme.css ui/src/renderer/styles/themes/base.css ui/src/renderer/styles/themes/elevation.structure.test.ts
git commit -m "feat: elevation ramp tokens + brand-violet focus ring (spec 11.1/11.2)"
```

---

### Task 2: 落点决策函数 resolveLandingTarget

**Files:**
- Create: `ui/src/renderer/pages/guid/utils/landingTarget.ts`
- Test: `ui/src/renderer/pages/guid/utils/landingTarget.test.ts` (create)

**Interfaces:**
- Produces: `resolveLandingTarget(lastProjectId: string | null, projects: ReadonlyArray<{ id: string }>): LandingTarget`，`LandingTarget = { kind: 'project'; projectId: string } | { kind: 'onboarding' }`；`LAST_PROJECT_KEY = 'openhub_last_project_id'`。Task 4（Router 落点重定向）和 Task 6（项目首页）消费。

- [ ] **Step 1: 写失败的单测**

Create `ui/src/renderer/pages/guid/utils/landingTarget.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import { resolveLandingTarget } from './landingTarget';

const projects = [{ id: 'alpha' }, { id: 'beta' }];

describe('resolveLandingTarget (spec: 有项目→最近项目，无项目→引导页)', () => {
  test('no projects → onboarding', () => {
    expect(resolveLandingTarget(null, [])).toEqual({ kind: 'onboarding' });
  });

  test('has last project and it still exists → that project', () => {
    expect(resolveLandingTarget('beta', projects)).toEqual({ kind: 'project', projectId: 'beta' });
  });

  test('last project was deleted → fall back to first project', () => {
    expect(resolveLandingTarget('ghost', projects)).toEqual({ kind: 'project', projectId: 'alpha' });
  });

  test('no last project but projects exist → first project', () => {
    expect(resolveLandingTarget(null, projects)).toEqual({ kind: 'project', projectId: 'alpha' });
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd ui && bun test src/renderer/pages/guid/utils/landingTarget.test.ts`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 实现**

Create `ui/src/renderer/pages/guid/utils/landingTarget.ts`:

```ts
/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

/** localStorage key: 最近使用的项目 id（单机状态，见 spec 默认落点规则）。 */
export const LAST_PROJECT_KEY = 'openhub_last_project_id';

export type LandingTarget = { kind: 'project'; projectId: string } | { kind: 'onboarding' };

/**
 * 默认落点决策：
 * - 无项目 → 引导页（新建/打开）
 * - 有项目 → 最近使用的项目；已被删则回落到列表第一个
 */
export function resolveLandingTarget(
  lastProjectId: string | null,
  projects: ReadonlyArray<{ id: string }>
): LandingTarget {
  if (projects.length === 0) return { kind: 'onboarding' };
  if (lastProjectId && projects.some((p) => p.id === lastProjectId)) {
    return { kind: 'project', projectId: lastProjectId };
  }
  return { kind: 'project', projectId: projects[0].id };
}

export function readLastProjectId(): string | null {
  try {
    return localStorage.getItem(LAST_PROJECT_KEY);
  } catch {
    return null;
  }
}

export function writeLastProjectId(projectId: string): void {
  try {
    localStorage.setItem(LAST_PROJECT_KEY, projectId);
  } catch {
    /* best effort */
  }
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd ui && bun test src/renderer/pages/guid/utils/landingTarget.test.ts`
Expected: 4 pass

- [ ] **Step 5: Commit**

```bash
git add ui/src/renderer/pages/guid/utils/landingTarget.ts ui/src/renderer/pages/guid/utils/landingTarget.test.ts
git commit -m "feat: landing-target decision function (spec default landing rule)"
```

---

### Task 3: 无项目引导页 ProjectOnboardingPage

**Files:**
- Create: `ui/src/renderer/pages/onboardingProject/ProjectOnboardingPage.tsx`
- Create: `ui/src/renderer/pages/onboardingProject/index.ts`
- Modify: `ui/src/renderer/services/i18n/locales/zh-CN/guid.json`
- Modify: `ui/src/renderer/services/i18n/locales/en-US/guid.json`
- Test: `ui/src/renderer/pages/onboardingProject/ProjectOnboardingPage.structure.test.ts` (create)

**Interfaces:**
- Consumes: `ipcBridge.dialog.showOpen.invoke`（打开目录）、`addProjectWorkpath`、`addRecentWorkspace`（既有，来自 `@renderer/pages/conversation/SessionList/utils/projectWorkpaths` 与 `@renderer/components/workspace`）。
- Produces: 默认导出 React 组件 `ProjectOnboardingPage`，路由挂载于 `/welcome`（Task 4 注册）。`data-testid='project-onboarding-page'`、`'onboarding-create-project'`、`'onboarding-open-project'`。

- [ ] **Step 1: 写失败的结构测试**

Create `ui/src/renderer/pages/onboardingProject/ProjectOnboardingPage.structure.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'ProjectOnboardingPage.tsx'), 'utf8');

describe('project onboarding page (spec: 无项目→引导页)', () => {
  test('renders create + open entries with testids', () => {
    expect(source).toContain("data-testid='project-onboarding-page'");
    expect(source).toContain("data-testid='onboarding-create-project'");
    expect(source).toContain("data-testid='onboarding-open-project'");
  });

  test('open entry mounts an existing directory as a project', () => {
    expect(source).toContain('ipcBridge.dialog.showOpen');
    expect(source).toContain('addProjectWorkpath');
    expect(source).toContain('addRecentWorkspace');
  });

  test('elevation tokens, no 1px borders', () => {
    expect(source).toContain('var(--el-elevated)');
    expect(source).not.toContain('border: 1px');
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd ui && bun test src/renderer/pages/onboardingProject/ProjectOnboardingPage.structure.test.ts`
Expected: FAIL（文件不存在）

- [ ] **Step 3: 加 i18n key**

`zh-CN/guid.json` 的顶层追加（保持 JSON 合法，接在现有 key 后）：

```json
  "onboardingProject": {
    "title": "从第一个项目开始",
    "subtitle": "项目是工作的基本单元：里面装着任务、成员（AI + 人）、资源和规则。",
    "create": "新建项目",
    "open": "打开已有项目",
    "openHint": "「打开」= 把已有的目录/资料挂载为一个项目",
    "createSuccess": "项目已创建",
    "createFailed": "项目创建失败"
  }
```

`en-US/guid.json`：

```json
  "onboardingProject": {
    "title": "Start with your first project",
    "subtitle": "A project is the basic unit of work: tasks, members (AI + humans), resources, and rules live inside it.",
    "create": "New project",
    "open": "Open existing project",
    "openHint": "\"Open\" mounts an existing directory as a project",
    "createSuccess": "Project created",
    "createFailed": "Failed to create project"
  }
```

Run: `bun run gen:i18n && bun run check:i18n`（仓库根目录）→ 必须通过。

- [ ] **Step 4: 实现页面**

Create `ui/src/renderer/pages/onboardingProject/ProjectOnboardingPage.tsx`:

```tsx
/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import { ipcBridge } from '@/common';
import { addRecentWorkspace } from '@renderer/components/workspace';
import { addProjectWorkpath } from '@renderer/pages/conversation/SessionList/utils/projectWorkpaths';
import { Message } from '@arco-design/web-react';
import { FolderOpen, FolderPlus } from '@icon-park/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { writeLastProjectId } from '../guid/utils/landingTarget';

/**
 * 无项目时的默认落点（spec §3 引导页）：新建项目 / 打开已有项目。
 * 一期「项目」= 工作路径；二期升级为四块实体。
 */
const ProjectOnboardingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const mountProject = async () => {
    try {
      const paths = await ipcBridge.dialog.showOpen.invoke({ properties: ['openDirectory', 'createDirectory'] });
      const projectPath = paths?.[0]?.trim();
      if (!projectPath) return;
      addProjectWorkpath(projectPath);
      addRecentWorkspace(projectPath);
      writeLastProjectId(projectPath);
      Message.success(t('guid.onboardingProject.createSuccess'));
      void navigate('/guid', { state: { workspace: projectPath } });
    } catch (error) {
      console.error('[OnboardingProject] failed:', error);
      Message.error(t('guid.onboardingProject.createFailed'));
    }
  };

  return (
    <div
      data-testid='project-onboarding-page'
      className='size-full flex flex-col items-center justify-center gap-16px bg-[var(--el-canvas)]'
    >
      <div className='text-20px font-semibold text-t-primary'>{t('guid.onboardingProject.title')}</div>
      <div className='text-13px text-t-secondary max-w-420px text-center'>{t('guid.onboardingProject.subtitle')}</div>
      <div className='flex items-center gap-12px'>
        <button
          type='button'
          data-testid='onboarding-create-project'
          onClick={() => void mountProject()}
          className='flex items-center gap-8px px-18px py-10px rd-[var(--radius-md)] bg-[rgb(var(--primary-6))] text-white text-14px cursor-pointer'
        >
          <FolderPlus theme='outline' size='16' fill='currentColor' />
          {t('guid.onboardingProject.create')}
        </button>
        <button
          type='button'
          data-testid='onboarding-open-project'
          onClick={() => void mountProject()}
          className='flex items-center gap-8px px-18px py-10px rd-[var(--radius-md)] bg-[var(--el-elevated)] text-t-primary text-14px cursor-pointer'
        >
          <FolderOpen theme='outline' size='16' fill='currentColor' />
          {t('guid.onboardingProject.open')}
        </button>
      </div>
      <div className='text-11px text-t-tertiary'>{t('guid.onboardingProject.openHint')}</div>
    </div>
  );
};

export default ProjectOnboardingPage;
```

Create `ui/src/renderer/pages/onboardingProject/index.ts`:

```ts
export { default } from './ProjectOnboardingPage';
```

- [ ] **Step 5: 跑测试确认通过 + typecheck**

Run: `cd ui && bun test src/renderer/pages/onboardingProject/ProjectOnboardingPage.structure.test.ts && bun run typecheck`
Expected: 3 pass + tsc 无错误

- [ ] **Step 6: Commit**

```bash
git add ui/src/renderer/pages/onboardingProject ui/src/renderer/services/i18n/locales/zh-CN/guid.json ui/src/renderer/services/i18n/locales/en-US/guid.json ui/src/renderer/services/i18n/i18n-keys.d.ts
git commit -m "feat: project onboarding page (spec landing rule empty branch)"
```

---

### Task 4: Router 按域重组（新 IA 路由 + 摘被砍域 + 迁移重定向）

**Files:**
- Modify: `ui/src/renderer/components/layout/Router.tsx`（Routes 块整体重组）
- Test: `ui/src/renderer/components/layout/Router.structure.test.ts` (create)

**Interfaces:**
- Consumes: Task 3 的 `ProjectOnboardingPage`（挂载 `/welcome`）。
- Produces: 路由表新结构——新 IA 路由存在、被砍域路由不存在、`/requirements*` → `/review` 重定向、`/` → `/guid`（Task 6 在 guid 内执行落点决策）。

- [ ] **Step 1: 写失败的结构测试**

Create `ui/src/renderer/components/layout/Router.structure.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'Router.tsx'), 'utf8');

describe('Router — new IA (spec phase 1)', () => {
  test('new IA routes exist', () => {
    expect(source).toContain("path='/welcome'");
    expect(source).toContain("path='/review'");
    expect(source).toContain("path='/roster'");
  });

  test('cut domains are no longer routable', () => {
    expect(source).not.toContain("path='/workshop'");
    expect(source).not.toContain("path='/assets'");
    expect(source).not.toContain("path='/public-companions'");
    expect(source).not.toContain("path='/plugins'");
    expect(source).not.toContain("path='/open-capabilities'");
  });

  test('one-time migration redirects registered (CLAUDE.md exception)', () => {
    expect(source).toContain("path='/requirements'");
    expect(source).toContain("<Navigate to='/review'");
  });

  test('session deep links still work (regression)', () => {
    expect(source).toContain("path='/conversation/:id'");
    expect(source).toContain("path='/terminal/:id'");
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd ui && bun test src/renderer/components/layout/Router.structure.test.ts`
Expected: FAIL（`/welcome`、`/review`、`/roster` 不存在；被砍域路由仍存在）

- [ ] **Step 3: 重组 Router**

在 `Router.tsx` 中（以下只列改动点，保持其余结构不动）：

1. 删除这些 lazy import 与对应 Route：`WorkshopListPage`、`WorkshopCanvasPage`、`AssetLibraryPage`、`PublicCompanionRosterPage`、`PublicAgentDetailPage`、`PluginsPage`、`OpenCapabilitiesPage`，以及 `/workshop`、`/workshop/:id`、`/assets`、`/public-companions`、`/public-companions/:id`、`/plugins`、`/open-capabilities`、`/settings/workshop`、`/settings/public-service` 路由行。
2. 新增 lazy import 与路由：

```tsx
const ProjectOnboardingPage = React.lazy(() => import('@renderer/pages/onboardingProject'));
const ReviewQueuePage = React.lazy(() => import('@renderer/pages/reviewQueue'));
const RosterPage = React.lazy(() => import('@renderer/pages/roster'));
```

```tsx
{/* ── 新 IA（spec §3）：落点 / 工作 / 公司 ── */}
<Route path='/welcome' element={withRouteFallback(ProjectOnboardingPage)} />
<Route path='/review' element={withRouteFallback(ReviewQueuePage)} />
<Route path='/roster' element={withRouteFallback(RosterPage)} />
{/* 一次性迁移重定向（CLAUDE.md 规则登记例外，spec §10.9） */}
<Route path='/requirements' element={<Navigate to='/review' replace />} />
<Route path='/requirements/*' element={<Navigate to='/review' replace />} />
```

3. 删除旧 `RequirementsLayout` 嵌套路由块（`/requirements` + `extensions` + `sources`）及 Legacy requirement redirects（`/requirements/kanban`、`/requirements/new`、`/requirements/:id/edit`、`/requirements/tag-sessions`、`/autowork`、`/other` 全部指向 `/review` 或直接删除——其中 `/autowork`、`/other` 改为 `<Navigate to='/review' replace />`）。
4. `pages/reviewQueue`、`pages/roster` 目录此任务先建占位组件（真实页面在 Task 7/8 实现）：

Create `ui/src/renderer/pages/reviewQueue/index.tsx`:

```tsx
import React from 'react';

/** 占位：待验收队列页由后续任务实现。 */
const ReviewQueuePage: React.FC = () => <div data-testid='review-queue-page' />;
export default ReviewQueuePage;
```

Create `ui/src/renderer/pages/roster/index.tsx`:

```tsx
import React from 'react';

/** 占位：员工名册页由后续任务实现。 */
const RosterPage: React.FC = () => <div data-testid='roster-page' />;
export default RosterPage;
```

- [ ] **Step 4: 跑测试确认通过 + typecheck**

Run: `cd ui && bun test src/renderer/components/layout/Router.structure.test.ts && bun run typecheck`
Expected: 4 pass + tsc 无错误

- [ ] **Step 5: 回归测试**

Run: `cd ui && bun test 2>&1 | tail -4`
Expected: 失败数不超过基线（10 个既有失败），无新增失败

- [ ] **Step 6: Commit**

```bash
git add ui/src/renderer/components/layout/Router.tsx ui/src/renderer/components/layout/Router.structure.test.ts ui/src/renderer/pages/reviewQueue ui/src/renderer/pages/roster
git commit -m "feat: reorganize router around project-first IA, drop cut-domain routes"
```

---

### Task 5: Sider 新 IA（含待验收 badge 聚合查询）

**Files:**
- Modify: `ui/src/renderer/components/layout/Sider/index.tsx`
- Create: `ui/src/renderer/components/layout/Sider/SiderNav/IaNavItems.tsx`
- Create: `ui/src/renderer/components/layout/Sider/useNeedsReviewCount.ts`
- Modify: `ui/src/renderer/services/i18n/locales/zh-CN/common.json`
- Modify: `ui/src/renderer/services/i18n/locales/en-US/common.json`
- Test: `ui/src/renderer/components/layout/Sider/iaSider.structure.test.ts` (create)
- Test: `ui/src/renderer/components/layout/Sider/useNeedsReviewCount.test.ts` (create)

**Interfaces:**
- Consumes: Task 4 的路由（`/guid`、`/review`、`/scheduled`、`/roster`、`/knowledge`、`/settings/system`）；`ipcBridge.requirements.list.invoke({ status: 'needs_review', page: 1, page_size: 1 })` 返回 `{ items, total }`（既有，`ui/src/common/adapter/ipcBridge.ts` 的 `IListRequirementsParams`）。
- Produces: `IaNavItems`（导航项配置数组）、`useNeedsReviewCount(): { count: number }`（一次聚合查询，badge 数据源）。

- [ ] **Step 1: 写失败的结构测试**

Create `ui/src/renderer/components/layout/Sider/iaSider.structure.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const siderSource = readFileSync(join(here, 'index.tsx'), 'utf8');
const navSource = readFileSync(join(here, 'SiderNav/IaNavItems.tsx'), 'utf8');

describe('Sider — new IA nav (spec §3)', () => {
  test('nav contains exactly the confirmed set', () => {
    for (const key of ['assign', 'review', 'scheduled', 'roster', 'knowledge', 'settings']) {
      expect(navSource).toContain(`'${key}'`);
    }
  });

  test('cut domains absent from nav', () => {
    expect(navSource).not.toContain('workshop');
    expect(navSource).not.toContain('plugins');
    expect(navSource).not.toContain('open-capabilities');
    expect(navSource).not.toContain('public-companions');
  });

  test('review badge uses one aggregate query (no per-project fetch)', () => {
    const hookSource = readFileSync(join(here, 'useNeedsReviewCount.ts'), 'utf8');
    expect(hookSource).toContain("status: 'needs_review'");
    expect(hookSource).toContain('page_size: 1');
  });
});
```

Create `ui/src/renderer/components/layout/Sider/useNeedsReviewCount.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'useNeedsReviewCount.ts'), 'utf8');

describe('useNeedsReviewCount', () => {
  test('subscribes to requirement change events for live badge', () => {
    expect(source).toContain('onStatusChanged');
    expect(source).toContain('onCreated');
    expect(source).toContain('onDeleted');
  });

  test('fails soft to zero', () => {
    expect(source).toContain('catch');
    expect(source).toContain('setCount(0)');
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd ui && bun test src/renderer/components/layout/Sider/iaSider.structure.test.ts src/renderer/components/layout/Sider/useNeedsReviewCount.test.ts`
Expected: FAIL（文件不存在）

- [ ] **Step 3: 加 i18n key**

`zh-CN/common.json` 在 `"siderSection"` 平级追加：

```json
  "iaNav": {
    "assign": "派活",
    "review": "待验收",
    "scheduled": "定时任务",
    "roster": "员工名册",
    "unassigned": "未分配任务",
    "pinned": "置顶",
    "projects": "项目",
    "company": "公司"
  }
```

`en-US/common.json`：

```json
  "iaNav": {
    "assign": "Assign work",
    "review": "Review",
    "scheduled": "Scheduled",
    "roster": "Roster",
    "unassigned": "Unassigned",
    "pinned": "Pinned",
    "projects": "Projects",
    "company": "Company"
  }
```

Run: `bun run gen:i18n && bun run check:i18n` → 通过。

- [ ] **Step 4: 实现 badge hook**

Create `ui/src/renderer/components/layout/Sider/useNeedsReviewCount.ts`:

```ts
/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import { ipcBridge } from '@/common';
import { isHandledAuthExpiredHttpError } from '@/common/adapter/httpBridge';
import { useCallback, useEffect, useState } from 'react';

/**
 * 待验收角标：一次聚合查询（page_size=1 只取 total），订阅需求变更事件实时刷新。
 * 失败静默归零（角标不是关键路径）。
 */
export function useNeedsReviewCount(): { count: number } {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await ipcBridge.requirements.list.invoke({ status: 'needs_review', page: 1, page_size: 1 });
      setCount(res.total);
    } catch (e) {
      if (isHandledAuthExpiredHttpError(e)) return;
      setCount(0);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const unsubs = [
      ipcBridge.requirements.onCreated.on(() => void refresh()),
      ipcBridge.requirements.onStatusChanged.on(() => void refresh()),
      ipcBridge.requirements.onDeleted.on(() => void refresh()),
    ];
    return () => unsubs.forEach((u) => u());
  }, [refresh]);

  return { count };
}
```

- [ ] **Step 5: 实现导航项配置 + Sider 重组**

Create `ui/src/renderer/components/layout/Sider/SiderNav/IaNavItems.tsx`:

```tsx
/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import { BookOne, CheckCorrect, Clock, EveryUser, Plus, SettingTwo } from '@icon-park/react';
import React from 'react';

export type IaNavKey = 'assign' | 'review' | 'scheduled' | 'roster' | 'knowledge' | 'settings';

export interface IaNavItem {
  key: IaNavKey;
  path: string;
  labelKey: string;
  icon: React.ReactNode;
}

/** 新 IA 导航（spec §3）：派活 / 待验收 / 定时任务 / 员工名册 / 知识库 / 设置。 */
export const IA_NAV_ITEMS: IaNavItem[] = [
  { key: 'assign', path: '/guid', labelKey: 'common.iaNav.assign', icon: <Plus theme='outline' size='16' /> },
  { key: 'review', path: '/review', labelKey: 'common.iaNav.review', icon: <CheckCorrect theme='outline' size='16' /> },
  { key: 'scheduled', path: '/scheduled', labelKey: 'common.iaNav.scheduled', icon: <Clock theme='outline' size='16' /> },
  { key: 'roster', path: '/roster', labelKey: 'common.iaNav.roster', icon: <EveryUser theme='outline' size='16' /> },
  { key: 'knowledge', path: '/knowledge', labelKey: 'knowledge.title', icon: <BookOne theme='outline' size='16' /> },
  { key: 'settings', path: '/settings/system', labelKey: 'settings.title', icon: <SettingTwo theme='outline' size='16' /> },
];
```

重组 `Sider/index.tsx`：删除 `isSessionRoute`/`isSettings` 分支结构、会话列表区、知识库/插件/模型&Agent 旧入口；新结构自上而下——品牌头、`IA_NAV_ITEMS` 渲染（`review` 项右侧挂 badge：`count > 0` 时显示品牌紫 pill，`>99` 显示 `99+`）、`SiderSectionHeader`（pinned/projects）、`ProjectGroup`（保留现状，作为「项目」区）、底部设置。被删分支引用的 import（SessionCreateBar、WorkpathSessionList、SiderKnowledgeEntry、SiderPluginEntry、SiderModelHubEntry、useKnowledgeInboxPending 等）一并清理。

- [ ] **Step 6: 跑测试确认通过 + typecheck + 回归**

Run: `cd ui && bun test src/renderer/components/layout/Sider && bun run typecheck && bun test 2>&1 | tail -4`
Expected: 结构测试全过 + tsc 无错误 + 无新增回归失败

- [ ] **Step 7: Commit**

```bash
git add ui/src/renderer/components/layout/Sider ui/src/renderer/services/i18n/locales/zh-CN/common.json ui/src/renderer/services/i18n/locales/en-US/common.json ui/src/renderer/services/i18n/i18n-keys.d.ts
git commit -m "feat: rebuild sidebar around new IA with review badge"
```

---

### Task 6: guid 首页演化为项目首页（语境条 + 建议卡 git 检测）

**Files:**
- Modify: `ui/src/renderer/pages/guid/GuidPage.tsx`
- Create: `ui/src/renderer/pages/guid/components/ProjectContextStrip.tsx`
- Create: `ui/src/renderer/pages/guid/utils/suggestionCards.ts`
- Modify: `ui/src/renderer/services/i18n/locales/zh-CN/guid.json`
- Modify: `ui/src/renderer/services/i18n/locales/en-US/guid.json`
- Test: `ui/src/renderer/pages/guid/utils/suggestionCards.test.ts` (create)
- Test: `ui/src/renderer/pages/guid/ProjectHome.structure.test.ts` (create)

**Interfaces:**
- Consumes: Task 2 的 `resolveLandingTarget` / `writeLastProjectId`；`ipcBridge.fs.getFileMetadata.invoke({ path, workspace })` 返回 `{ mode, branch? }`（git 检测，参照 `SessionList/hooks/useWorkpathBranches.ts:33`）。
- Produces: `getSuggestionCards(isGitRepo: boolean): SuggestionCard[]`；`ProjectContextStrip` 组件（`data-testid='project-context-strip'`）；落点执行：进入 `/guid` 无 workspace 时按 `resolveLandingTarget` 跳转。

- [ ] **Step 1: 写失败的单测**

Create `ui/src/renderer/pages/guid/utils/suggestionCards.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import { getSuggestionCards } from './suggestionCards';

describe('getSuggestionCards (spec 11: 建议卡按 git 检测降级)', () => {
  test('git repo → dev cards', () => {
    const keys = getSuggestionCards(true).map((c) => c.key);
    expect(keys).toEqual(['explore', 'build', 'review', 'fix']);
  });

  test('non-git → generic cards', () => {
    const keys = getSuggestionCards(false).map((c) => c.key);
    expect(keys).toEqual(['write', 'ask', 'task', 'chat']);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd ui && bun test src/renderer/pages/guid/utils/suggestionCards.test.ts`
Expected: FAIL（模块不存在）

- [ ] **Step 3: 加 i18n key**

`zh-CN/guid.json` 追加：

```json
  "projectHome": {
    "hero": "我们应该在 {project} 中做什么？",
    "assignPlaceholder": "给这个项目派活…",
    "suggest": {
      "explore": "探索并理解代码",
      "build": "构建新功能、应用或工具",
      "review": "审查代码并提出修改建议",
      "fix": "修复问题和失败",
      "write": "写一个需求",
      "ask": "问一个问题",
      "task": "创建一个任务",
      "chat": "自由聊聊"
    }
  }
```

`en-US/guid.json`：

```json
  "projectHome": {
    "hero": "What should we build in {project}?",
    "assignPlaceholder": "Assign work to this project…",
    "suggest": {
      "explore": "Explore and understand the code",
      "build": "Build a feature, app, or tool",
      "review": "Review code and suggest changes",
      "fix": "Fix bugs and failures",
      "write": "Draft a requirement",
      "ask": "Ask a question",
      "task": "Create a task",
      "chat": "Just chat"
    }
  }
```

Run: `bun run gen:i18n && bun run check:i18n` → 通过。

- [ ] **Step 4: 实现建议卡模块**

Create `ui/src/renderer/pages/guid/utils/suggestionCards.ts`:

```ts
/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

export type SuggestionCardKey =
  | 'explore' | 'build' | 'review' | 'fix'
  | 'write' | 'ask' | 'task' | 'chat';

export interface SuggestionCard {
  key: SuggestionCardKey;
  labelKey: string;
}

const DEV_CARDS: SuggestionCard[] = [
  { key: 'explore', labelKey: 'guid.projectHome.suggest.explore' },
  { key: 'build', labelKey: 'guid.projectHome.suggest.build' },
  { key: 'review', labelKey: 'guid.projectHome.suggest.review' },
  { key: 'fix', labelKey: 'guid.projectHome.suggest.fix' },
];

const GENERIC_CARDS: SuggestionCard[] = [
  { key: 'write', labelKey: 'guid.projectHome.suggest.write' },
  { key: 'ask', labelKey: 'guid.projectHome.suggest.ask' },
  { key: 'task', labelKey: 'guid.projectHome.suggest.task' },
  { key: 'chat', labelKey: 'guid.projectHome.suggest.chat' },
];

/**
 * 建议卡（一期降级规则，spec §11 前置说明）：git 仓库 → 研发卡；否则 → 通用卡。
 * 二期项目实体带类型字段后改为按类型生成。
 */
export function getSuggestionCards(isGitRepo: boolean): SuggestionCard[] {
  return isGitRepo ? DEV_CARDS : GENERIC_CARDS;
}

/** git 检测：与 SessionList/hooks/useWorkpathBranches.ts 同一数据源。 */
export async function detectGitRepo(
  workpath: string,
  invoke: (args: { path: string; workspace: string }) => Promise<{ mode?: string }>
): Promise<boolean> {
  const trimmed = workpath.replace(/[\\/]+$/, '');
  const separator = workpath.includes('\\') ? '\\' : '/';
  try {
    const info = await invoke({ path: `${trimmed}${separator}.git`, workspace: workpath });
    return info?.mode === 'git-repo';
  } catch {
    return false;
  }
}
```

- [ ] **Step 5: 实现语境条 + GuidPage 集成**

Create `ui/src/renderer/pages/guid/components/ProjectContextStrip.tsx`:

```tsx
/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Home } from '@icon-park/react';
import React from 'react';

/** 项目语境条：composer 上方的项目归属提示（一期：项目名 + 工作路径）。 */
const ProjectContextStrip: React.FC<{ projectName: string; workpath?: string }> = ({ projectName, workpath }) => (
  <div data-testid='project-context-strip' className='flex items-center gap-6px text-11px text-t-tertiary px-4px'>
    <Home theme='outline' size='12' fill='currentColor' />
    <span className='truncate'>{projectName}</span>
    {workpath && <span className='truncate text-t-disabled'>· {workpath}</span>}
  </div>
);

export default ProjectContextStrip;
```

`GuidPage.tsx` 集成：
1. 顶部 hero 文案从 `t('conversation.welcome.title')` 改为 `t('guid.projectHome.hero', { project: 当前项目名 })`（当前项目名 = workspace 目录最后一段，无 workspace 时用 `t('conversation.welcome.title')` 回落）。
2. `GuidResourceCards` 上方插入建议卡行：`<div className={styles.guidSuggestCards}>{cards.map(...)}</div>`，cards 来自 `getSuggestionCards(isGitRepo)`；`isGitRepo` 在 workspace 变化时用 `detectGitRepo(workpath, (args) => ipcBridge.fs.getFileMetadata.invoke(args))` 求得。
3. composer（`GuidInputCard`）正上方挂 `<ProjectContextStrip projectName={...} workpath={...} />`；`GuidInputCard` 的 placeholder 在有项目时用 `t('guid.projectHome.assignPlaceholder')`。
4. 进入 `/guid` 时若 `location.state?.workspace` 存在，调用 `writeLastProjectId(workspace)`。

- [ ] **Step 6: 结构测试 + 单测 + typecheck**

Create `ui/src/renderer/pages/guid/ProjectHome.structure.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const pageSource = readFileSync(join(here, 'GuidPage.tsx'), 'utf8');

describe('guid → project home (spec §3)', () => {
  test('hero uses project-scoped copy', () => {
    expect(pageSource).toContain('guid.projectHome.hero');
  });
  test('composer carries project context strip', () => {
    expect(pageSource).toContain('ProjectContextStrip');
  });
  test('records last project on entry', () => {
    expect(pageSource).toContain('writeLastProjectId');
  });
});
```

Run: `cd ui && bun test src/renderer/pages/guid && bun run typecheck`
Expected: 全过 + tsc 无错误

- [ ] **Step 7: Commit**

```bash
git add ui/src/renderer/pages/guid ui/src/renderer/services/i18n/locales/zh-CN/guid.json ui/src/renderer/services/i18n/locales/en-US/guid.json ui/src/renderer/services/i18n/i18n-keys.d.ts
git commit -m "feat: evolve guid homepage into project home with suggestion cards"
```

---

### Task 7: 待验收队列页（NeedsReview 数据源）

**Files:**
- Modify: `ui/src/renderer/pages/reviewQueue/index.tsx`（替换占位）
- Create: `ui/src/renderer/pages/reviewQueue/ReviewQueuePage.tsx`
- Create: `ui/src/renderer/pages/reviewQueue/useReviewQueue.ts`
- Modify: `ui/src/renderer/services/i18n/locales/zh-CN/requirements.json`
- Modify: `ui/src/renderer/services/i18n/locales/en-US/requirements.json`
- Test: `ui/src/renderer/pages/reviewQueue/ReviewQueuePage.structure.test.ts` (create)

**Interfaces:**
- Consumes: `useRequirements({ status: 'needs_review', page: 1, page_size: 100 })`（既有，`pages/requirements/useRequirements.ts`）；`ipcBridge.requirements.updateStatus.invoke`（既有，mcp_server 已验证支持 `done` / `in_progress` 状态迁移）；`LoadErrorResult`（既有）。
- Produces: `ReviewQueuePage`（`data-testid='review-queue-page'`、`'review-queue-approve'`、`'review-queue-reject'`、`'review-queue-batch-approve'`）；按项目（workpath 字段）分组渲染。

- [ ] **Step 1: 写失败的结构测试**

Create `ui/src/renderer/pages/reviewQueue/ReviewQueuePage.structure.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'ReviewQueuePage.tsx'), 'utf8');
const hookSource = readFileSync(join(here, 'useReviewQueue.ts'), 'utf8');

describe('review queue page (spec 11.3)', () => {
  test('data source is needs_review requirements', () => {
    expect(hookSource).toContain("status: 'needs_review'");
  });

  test('rows expose approve/reject actions', () => {
    expect(source).toContain("data-testid='review-queue-approve'");
    expect(source).toContain("data-testid='review-queue-reject'");
  });

  test('batch approve exists and empty state invites assignment', () => {
    expect(source).toContain("data-testid='review-queue-batch-approve'");
    expect(source).toContain('reviewQueue.emptyAction');
  });

  test('error state reuses LoadErrorResult', () => {
    expect(source).toContain('LoadErrorResult');
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd ui && bun test src/renderer/pages/reviewQueue/ReviewQueuePage.structure.test.ts`
Expected: FAIL（文件不存在）

- [ ] **Step 3: 加 i18n key**

`zh-CN/requirements.json` 追加：

```json
  "reviewQueue": {
    "title": "待验收",
    "batchApprove": "全部通过",
    "approve": "通过",
    "reject": "打回",
    "empty": "都验收完了",
    "emptyAction": "去派活",
    "waitingHours": "等待 {{hours}}h",
    "waitingDays": "等待 {{days}}d",
    "approveSuccess": "已通过",
    "rejectSuccess": "已打回",
    "loadError": "加载失败"
  }
```

`en-US/requirements.json`：

```json
  "reviewQueue": {
    "title": "Review",
    "batchApprove": "Approve all",
    "approve": "Approve",
    "reject": "Reject",
    "empty": "All reviewed",
    "emptyAction": "Assign work",
    "waitingHours": "Waiting {{hours}}h",
    "waitingDays": "Waiting {{days}}d",
    "approveSuccess": "Approved",
    "rejectSuccess": "Sent back",
    "loadError": "Load failed"
  }
```

Run: `bun run gen:i18n && bun run check:i18n` → 通过。

- [ ] **Step 4: 实现 hook**

Create `ui/src/renderer/pages/reviewQueue/useReviewQueue.ts`:

```ts
/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import { ipcBridge } from '@/common';
import type { IRequirement } from '@/common/adapter/ipcBridge';
import { useRequirements } from '@renderer/pages/requirements/useRequirements';
import { useCallback, useMemo } from 'react';

export interface ReviewGroup {
  project: string;
  items: IRequirement[];
}

/** 待验收队列：按项目（workpath）分组的 NeedsReview 需求。 */
export function useReviewQueue() {
  const { items, total, loading, error, refresh } = useRequirements({ status: 'needs_review', page: 1, page_size: 100 });

  const groups = useMemo<ReviewGroup[]>(() => {
    const map = new Map<string, IRequirement[]>();
    for (const item of items) {
      const key = (item as { workpath?: string }).workpath || '';
      const list = map.get(key) ?? [];
      list.push(item);
      map.set(key, list);
    }
    return [...map.entries()].map(([project, groupItems]) => ({ project, items: groupItems }));
  }, [items]);

  const approve = useCallback(
    async (id: number | string) => {
      await ipcBridge.requirements.updateStatus.invoke({ id, status: 'done' });
      void refresh();
    },
    [refresh]
  );

  const reject = useCallback(
    async (id: number | string) => {
      await ipcBridge.requirements.updateStatus.invoke({ id, status: 'in_progress' });
      void refresh();
    },
    [refresh]
  );

  const approveAll = useCallback(async () => {
    await Promise.all(items.map((item) => ipcBridge.requirements.updateStatus.invoke({ id: item.id, status: 'done' })));
    void refresh();
  }, [items, refresh]);

  return { groups, total, loading, error, refresh, approve, reject, approveAll };
}
```

- [ ] **Step 5: 实现页面（按 spec 11.3 结构）**

Create `ui/src/renderer/pages/reviewQueue/ReviewQueuePage.tsx`，结构：页头（标题 + `全部通过 ▾`）、`LoadErrorResult`（error 时）、空态（`都验收完了 🎉 + 去派活` 按钮跳 `/guid`）、分组列表（组头=项目名+计数；任务行=标题 / 等待时长（>24h 加 `text-warning`）/ 行内 `[通过] [打回]` 按钮，`data-testid` 按结构测试）。样式：`bg-[var(--el-canvas)]` 页底、行 `bg-[var(--el-surface)]`、`rd-[var(--radius-md)]`、无 1px border。

替换 `ui/src/renderer/pages/reviewQueue/index.tsx`：

```tsx
export { default } from './ReviewQueuePage';
```

- [ ] **Step 6: 跑测试确认通过 + typecheck**

Run: `cd ui && bun test src/renderer/pages/reviewQueue && bun run typecheck`
Expected: 4 pass + tsc 无错误

- [ ] **Step 7: Commit**

```bash
git add ui/src/renderer/pages/reviewQueue ui/src/renderer/services/i18n/locales/zh-CN/requirements.json ui/src/renderer/services/i18n/locales/en-US/requirements.json ui/src/renderer/services/i18n/i18n-keys.d.ts
git commit -m "feat: review queue page on NeedsReview requirements (spec 11.3)"
```

---

### Task 8: 员工名册页（壳 · 聚合只读）

**Files:**
- Modify: `ui/src/renderer/pages/roster/index.tsx`（替换占位）
- Create: `ui/src/renderer/pages/roster/RosterPage.tsx`
- Modify: `ui/src/renderer/services/i18n/locales/zh-CN/common.json`
- Modify: `ui/src/renderer/services/i18n/locales/en-US/common.json`
- Test: `ui/src/renderer/pages/roster/RosterPage.structure.test.ts` (create)

**Interfaces:**
- Consumes: `ipcBridge.agents.list.invoke()`、`ipcBridge.assistants.list.invoke()`（既有，`/api/agents`、`/api/assistants`）；`LoadErrorResult`。
- Produces: `RosterPage`（`data-testid='roster-page'`、`'roster-empty'`）。一期只读聚合：员工卡片 = 名称 + 类型（agent 后端/助手）+ 状态点；编辑入口二期接。

- [ ] **Step 1: 写失败的结构测试**

Create `ui/src/renderer/pages/roster/RosterPage.structure.test.ts`:

```ts
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(here, 'RosterPage.tsx'), 'utf8');

describe('roster page (spec: 员工名册)', () => {
  test('aggregates agents and assistants, read-only in phase 1', () => {
    expect(source).toContain('ipcBridge.agents.list');
    expect(source).toContain('ipcBridge.assistants.list');
  });

  test('has warm empty state with primary action', () => {
    expect(source).toContain("data-testid='roster-empty'");
    expect(source).toContain('roster.emptyAction');
  });

  test('error state reuses LoadErrorResult', () => {
    expect(source).toContain('LoadErrorResult');
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd ui && bun test src/renderer/pages/roster/RosterPage.structure.test.ts`
Expected: FAIL

- [ ] **Step 3: 加 i18n key 并实现**

`zh-CN/common.json` 的 `iaNav` 后追加：

```json
  "roster": {
    "title": "员工名册",
    "empty": "还没有员工",
    "emptyAction": "去添加",
    "typeAgent": "Agent 后端",
    "typeAssistant": "助手",
    "loadError": "加载失败"
  }
```

`en-US/common.json`：

```json
  "roster": {
    "title": "Roster",
    "empty": "No employees yet",
    "emptyAction": "Add one",
    "typeAgent": "Agent backend",
    "typeAssistant": "Assistant",
    "loadError": "Load failed"
  }
```

Run: `bun run gen:i18n && bun run check:i18n` → 通过。

Create `ui/src/renderer/pages/roster/RosterPage.tsx`：并发拉 `ipcBridge.agents.list.invoke()` 与 `ipcBridge.assistants.list.invoke()`，合并为卡片网格（`bg-[var(--el-surface)]`、`rd-[var(--radius-md)]`）：名称 + 类型徽标（`common.roster.typeAgent` / `typeAssistant`）+ 状态点；error → `LoadErrorResult`；空 → `还没有员工 + 去添加`（跳 `/models`）；`emptyAction` 跳 `/models`。替换 `index.tsx` 为 `export { default } from './RosterPage';`。

- [ ] **Step 4: 跑测试确认通过 + typecheck**

Run: `cd ui && bun test src/renderer/pages/roster && bun run typecheck`
Expected: 3 pass + tsc 无错误

- [ ] **Step 5: Commit**

```bash
git add ui/src/renderer/pages/roster ui/src/renderer/services/i18n/locales/zh-CN/common.json ui/src/renderer/services/i18n/locales/en-US/common.json ui/src/renderer/services/i18n/i18n-keys.d.ts
git commit -m "feat: roster page shell aggregating agents and assistants"
```

---

### Task 9: DESIGN.md 创建 + 全量回归

**Files:**
- Create: `DESIGN.md`
- Test: 无新测试（回归验证）

**Interfaces:**
- Consumes: spec §4 + §11 的全部设计决策。
- Produces: 设计系统文档（后续任务的校准源）。

- [ ] **Step 1: 创建 DESIGN.md**

Create `DESIGN.md`（仓库根目录），内容四节：① 明度分层 token 表（canvas/surface/elevated/popover 明暗两色，摘自 spec 11.1）；② 品牌紫使用规则（仅交互强调：主按钮/选中态/badge/焦点环；`--primary-6` ramp 引用）；③ 无边框规则（禁 1px border，浮层 8% 透明度边缘 + blur 例外）+ 圆角三档 + 焦点环规范；④ 自觉决定记录（系统字体栈保持，品类惯例）。

- [ ] **Step 2: 全量回归**

Run: `cd ui && bun run typecheck && bun test 2>&1 | tail -4`
Expected: tsc 无错误；测试失败数 ≤ 10（全部为基线既有失败：qrLoginResume×2、projectWorkpaths×3、addImportantToAll×2、manual theme bg×1、session sidebar tooltips×1、workpath routes×1），零新增

Run: `bun run check:i18n`（仓库根目录）
Expected: 通过

- [ ] **Step 3: Commit**

```bash
git add DESIGN.md
git commit -m "docs: create DESIGN.md from spec section 4 and 11"
```

---

## 执行顺序与并行

- Lane A（顺序）：T1 → T2 → T3 → T4（主题→函数→引导页→路由，层层依赖）
- Lane B（T4 后并行）：T5（Sider）、T6（项目首页）、T7（待验收队列）、T8（名册）——四个页面级任务互不依赖，可并行 worktree
- T9 最后（DESIGN.md + 回归）

## Self-Review 记录

- Spec 覆盖：§3 IA（T4/T5/T6/T7/T8）、§4 风格（T1）、§11.1-11.5（T1/T7/落点 T2/引导 T3）、默认落点（T2/T6）、移动端冻结（Global Constraints 注明一期不做）、一次性 redirect 例外（T4）。一期 NOT in scope（项目四块/状态机/迁移/认证）明确排除。
- 占位扫描：无 TBD/TODO；每步含实际代码或精确改动点。
- 类型一致性：`resolveLandingTarget`/`writeLastProjectId`（T2 定义，T3/T6 消费）✓；`getSuggestionCards`/`detectGitRepo`（T6）✓；`useReviewQueue` 返回 `{ groups, total, loading, error, approve, reject, approveAll }`（T7）✓；`useNeedsReviewCount`（T5）✓。
