# UI 简化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 OpenHub 侧边栏从 13 个入口精简到 5 个（新建对话 + 知识库 + 插件 + 项目列表 + 设置），加入首次引导 Wizard，简化会话创建流程。

**Architecture:** 纯前端 UI 重组。不涉及后端 API 变更、数据库迁移或 agent 引擎改动。所有改动限定在 `ui/src/renderer/` 下。

**Tech Stack:** React 19 + TypeScript + React Router + Arco Design + UnoCSS

## 全局约束

- 不修改后端 API 和 agent 能力
- 不删除任何现有路由，仅隐藏侧边栏入口
- 桌面版电脑/浏览器操控的底层实现保持不变
- 11 个 IM 频道保留在对外伙伴设置中
- 终端模式保留在设置中
- 所有新组件使用 React.lazy 懒加载
- i18n 的 key 使用现有命名约定（`common.siderSection.*` 等）

---

### Task 1: 简化侧边栏主组件

**Files:**
- Modify: `ui/src/renderer/components/layout/Sider/index.tsx`

**Interfaces:**
- Consumes: 现有的 `SiderNav` 入口组件
- Produces: 简化的侧边栏，仅暴露 5 个入口：NewConversation、Knowledge、Plugins、ProjectGroup、Settings footer

- [ ] **Step 1: 删除不需要的导入和 handler**

修改 `ui/src/renderer/components/layout/Sider/index.tsx`，删除不再需要的导入和导航 handler。

移除这些导入（第 16-30 行区域）：
```tsx
// 删除以下导入:
// SiderAssetLibraryEntry,
// SiderAssistantSkillsEntry,
// SiderNomiEntry,
// SiderOpenCapabilitiesEntry,
// SiderPublicServiceEntry,
// SiderRequirementsEntry,
// SiderScheduledEntry,
// SiderWorkshopEntry,
```

移除这些 handler（第 91-98 行区域）：
```tsx
// 删除以下 handler:
// handleScheduledClick, handleRequirementsClick, handleAssetLibraryClick,
// handleNomiClick, handleWorkshopClick, handlePublicServiceClick,
// handleAssistantSkillsClick, handleMcpClick, handleOpenCapabilitiesClick
```

保留以下导入：
```tsx
import {
  SiderConversationEntry,      // 改为 NewConversation 用途
  SiderKnowledgeEntry,
  SiderSectionHeader,
} from './SiderNav';
```

新增导入：
```tsx
import { useProjectWorkPaths } from '@renderer/hooks/projectWorkpaths';
```

- [ ] **Step 2: 重写侧边栏 JSX 结构**

替换 `{isSettings ? ...}` 分支中的 JSX（第 167-261 行）：

```tsx
{isSettings ? (
  <Suspense fallback={<div className='size-full' />}>
    <SettingsSider collapsed={collapsed} tooltipEnabled={tooltipEnabled} />
  </Suspense>
) : (
  <div className='size-full flex flex-col gap-2px'>
    {/* + 新建对话 */}
    <SiderConversationEntry
      isMobile={isMobile}
      isActive={isSessionRoute}
      collapsed={collapsed}
      siderTooltipProps={siderTooltipProps}
      onClick={handleConversationClick}
    />
    {/* 知识库 */}
    <SiderKnowledgeEntry
      isMobile={isMobile}
      isActive={pathname.startsWith('/knowledge')}
      collapsed={collapsed}
      siderTooltipProps={siderTooltipProps}
      onClick={handleKnowledgeClick}
      dot={pendingInboxCount > 0}
    />
    {/* 插件 — 统一 MCP + Skill + Extension */}
    <SiderPluginEntry
      isMobile={isMobile}
      isActive={pathname.startsWith('/plugins')}
      collapsed={collapsed}
      siderTooltipProps={siderTooltipProps}
      onClick={handlePluginsClick}
    />

    {/* 项目 — 动态分组 */}
    <ProjectGroup
      isMobile={isMobile}
      collapsed={collapsed}
      siderTooltipProps={siderTooltipProps}
    />
  </div>
)}
```

- [ ] **Step 3: 添加新 handler 和 route 判断逻辑**

```tsx
const handlePluginsClick = () => navTo('/plugins');

// 更新 isSessionRoute 判断（保持不变，ConversationShell 覆盖的路径不变）
const isSessionRoute =
  pathname === '/guid' ||
  pathname.startsWith('/conversation/') ||
  pathname === '/terminal-new' ||
  pathname.startsWith('/terminal/');
```

- [ ] **Step 4: 底部固定区域保留 ModelHub + Settings**

底部区域（第 263-290 行）保留不变，ModelHubEntry 和 SettingsFooter 仍在底部。`SiderOpenCapabilitiesEntry` 从底部移除（移至设置页）。

- [ ] **Step 5: 验证**

运行：`bun run typecheck`，确认无类型错误。

- [ ] **Step 6: 提交**

```bash
git add ui/src/renderer/components/layout/Sider/index.tsx
git commit -m "feat: simplify sidebar from 13 entries to 5 core entries

Remove: Nomi, Workshop, PublicService, AssetLibrary, Scheduled,
Requirements, AssistantSkills, MCP, OpenCapabilities from sidebar.
Add: Plugin entry (unified MCP+Skill+Extension).
Keep: Conversation, Knowledge, ModelHub, Settings.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: 创建 SiderPluginEntry 组件

**Files:**
- Create: `ui/src/renderer/components/layout/Sider/SiderNav/SiderPluginEntry.tsx`

**Interfaces:**
- Produces: `SiderPluginEntry` 组件，props 与现有 Sider*Entry 保持一致

- [ ] **Step 1: 创建 SiderPluginEntry 组件**

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Apps } from '@icon-park/react';
import SiderItem from '../SiderItem';

interface SiderPluginEntryProps {
  isMobile: boolean;
  isActive: boolean;
  collapsed: boolean;
  siderTooltipProps: Record<string, unknown>;
  onClick: () => void;
}

const SiderPluginEntry: React.FC<SiderPluginEntryProps> = ({
  isMobile,
  isActive,
  collapsed,
  siderTooltipProps,
  onClick,
}) => {
  const { t } = useTranslation();

  return (
    <SiderItem
      icon={<Apps theme="outline" size="22" strokeWidth={3} />}
      label={t('common.sider.plugins', { defaultValue: '插件' })}
      isActive={isActive}
      collapsed={collapsed}
      isMobile={isMobile}
      tooltipProps={siderTooltipProps}
      onClick={onClick}
    />
  );
};

export default SiderPluginEntry;
```

- [ ] **Step 2: 更新 SiderNav/index.ts 导出**

```tsx
export { default as SiderPluginEntry } from './SiderPluginEntry';
```

- [ ] **Step 3: 提交**

```bash
git add ui/src/renderer/components/layout/Sider/SiderNav/
git commit -m "feat: add SiderPluginEntry for unified plugin navigation

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: 创建项目动态分组组件

**Files:**
- Create: `ui/src/renderer/components/layout/Sider/ProjectGroup.tsx`

**Interfaces:**
- Consumes: `useProjectWorkPaths()` hook（假设已存在的项目工作路径 hook，如不存在则创建一个读取项目列表的 hook）
- Produces: `ProjectGroup` 组件，无项目时不渲染

- [ ] **Step 1: 创建 ProjectGroup 组件**

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Folder } from '@icon-park/react';
import SiderItem from './SiderItem';
import SiderSectionHeader from './SiderNav/SiderSectionHeader';

interface ProjectGroupProps {
  isMobile: boolean;
  collapsed: boolean;
  siderTooltipProps: Record<string, unknown>;
}

const ProjectGroup: React.FC<ProjectGroupProps> = ({
  isMobile,
  collapsed,
  siderTooltipProps,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const projects = useProjectWorkPaths();

  if (!projects || projects.length === 0) return null;

  return (
    <>
      <SiderSectionHeader
        label={t('common.siderSection.projects', { defaultValue: '项目' })}
        collapsed={collapsed}
      />
      {projects.map((project) => (
        <SiderItem
          key={project.id}
          icon={<Folder theme="outline" size="22" strokeWidth={3} />}
          label={project.name}
          isActive={false}
          collapsed={collapsed}
          isMobile={isMobile}
          tooltipProps={siderTooltipProps}
          onClick={() => navigate(`/conversation/${project.id}`)}
        />
      ))}
    </>
  );
};

export default ProjectGroup;
```

- [ ] **Step 2: 更新 Sider 导入并使用**

在 Sider/index.tsx 中导入 `ProjectGroup`：
```tsx
const ProjectGroup = React.lazy(() => import('./ProjectGroup'));
```

- [ ] **Step 3: 提交**

```bash
git add ui/src/renderer/components/layout/Sider/ProjectGroup.tsx
git add ui/src/renderer/components/layout/Sider/index.tsx
git commit -m "feat: add dynamic project group in sidebar

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: 创建统一插件页面

**Files:**
- Create: `ui/src/renderer/pages/plugins/PluginsPage.tsx`
- Create: `ui/src/renderer/pages/plugins/index.tsx`
- Create: `ui/src/renderer/pages/plugins/PluginRecommendations.tsx`
- Modify: `ui/src/renderer/components/layout/Router.tsx`

**Interfaces:**
- Produces: `/plugins` 路由，3 个 Tab：MCP 服务器 | Skill 包 | 扩展市场
- Consumes: 现有 `McpPage`、`SkillsHubSettings`、`ExtensionSettingsPage` 页面组件

- [ ] **Step 1: 创建 PluginsPage**

```tsx
// ui/src/renderer/pages/plugins/PluginsPage.tsx
import React, { useState, Suspense } from 'react';
import { Tabs } from '@arco-design/web-react';
import { useTranslation } from 'react-i18next';
import HubPageShell from '@renderer/components/layout/HubPageShell';
import AppLoader from '@renderer/components/layout/AppLoader';
import PluginRecommendations from './PluginRecommendations';

const McpPage = React.lazy(() => import('@renderer/pages/mcp'));
const SkillsHubSettings = React.lazy(() => import('@renderer/pages/settings/SkillsHubSettings'));
const ExtensionSettingsPage = React.lazy(() => import('@renderer/pages/settings/ExtensionSettingsPage'));

const TabPane = Tabs.TabPane;

const PLUGIN_TABS = [
  { key: 'mcp', title: 'MCP 服务器' },
  { key: 'skills', title: 'Skill 包' },
  { key: 'extensions', title: '扩展市场' },
];

const PluginsPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('mcp');

  return (
    <HubPageShell
      title={t('plugins.title', { defaultValue: '插件' })}
      subtitle={t('plugins.subtitle', { defaultValue: '给 AI 装插件，扩展它的能力' })}
    >
      <PluginRecommendations />
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        style={{ marginTop: 16 }}
      >
        {PLUGIN_TABS.map((tab) => (
          <TabPane key={tab.key} title={tab.title} />
        ))}
      </Tabs>
      <Suspense fallback={<AppLoader />}>
        {activeTab === 'mcp' && <McpPage />}
        {activeTab === 'skills' && <SkillsHubSettings />}
        {activeTab === 'extensions' && <ExtensionSettingsPage />}
      </Suspense>
    </HubPageShell>
  );
};

export default PluginsPage;
```

- [ ] **Step 2: 创建 PluginRecommendations 组件（静态兜底列表）**

```tsx
// ui/src/renderer/pages/plugins/PluginRecommendations.tsx
import React from 'react';
import { Card, Grid, Typography, Tag } from '@arco-design/web-react';
import { useTranslation } from 'react-i18next';

const { Row, Col } = Grid;

// 静态推荐列表 — 网络请求失败的兜底数据
const STATIC_RECOMMENDATIONS = [
  { id: 'filesystem', name: '文件系统', desc: '读写本地文件', tags: ['内置'] },
  { id: 'web-search', name: '网页搜索', desc: '搜索互联网内容', tags: ['内置'] },
  { id: 'image-gen', name: '图片生成', desc: 'AI 生成图片', tags: ['MCP'] },
];

const PluginRecommendations: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div style={{ marginBottom: 8 }}>
      <Typography.Title heading={6}>
        {t('plugins.recommendations', { defaultValue: '推荐插件' })}
      </Typography.Title>
      <Row gutter={16}>
        {STATIC_RECOMMENDATIONS.map((plugin) => (
          <Col span={8} key={plugin.id}>
            <Card hoverable size="small">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Typography.Text bold>{plugin.name}</Typography.Text>
                {plugin.tags.map((tag) => (
                  <Tag key={tag} size="small" color="arcoblue">{tag}</Tag>
                ))}
              </div>
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                {plugin.desc}
              </Typography.Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default PluginRecommendations;
```

- [ ] **Step 3: 创建 barrel 导出**

```tsx
// ui/src/renderer/pages/plugins/index.tsx
export { default } from './PluginsPage';
```

- [ ] **Step 4: 注册路由**

在 `Router.tsx` 中添加：

```tsx
const PluginsPage = React.lazy(() => import('@renderer/pages/plugins'));

// 在 <Routes> 中添加:
<Route path="/plugins" element={withRouteFallback(PluginsPage)} />
```

- [ ] **Step 5: 提交**

```bash
git add ui/src/renderer/pages/plugins/
git add ui/src/renderer/components/layout/Router.tsx
git commit -m "feat: add unified plugins page with MCP/Skills/Extensions tabs

Includes static recommendation list as fallback for network errors.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: 创建首次引导 Wizard

**Files:**
- Create: `ui/src/renderer/pages/onboarding/OnboardingWizard.tsx`
- Create: `ui/src/renderer/pages/onboarding/index.tsx`
- Create: `ui/src/renderer/pages/onboarding/steps/WelcomeStep.tsx`
- Create: `ui/src/renderer/pages/onboarding/steps/ApiKeyStep.tsx`
- Create: `ui/src/renderer/pages/onboarding/steps/CompanionStep.tsx`
- Modify: `ui/src/renderer/components/layout/Router.tsx`

**Interfaces:**
- Produces: `/onboarding` 路由，3 步引导流程
- Consumes: localStorage `onboarding_skipped` flag
- Consumes: 现有 API Key 保存和模型服务商选择逻辑

- [ ] **Step 1: 创建 OnboardingWizard 主组件**

```tsx
// ui/src/renderer/pages/onboarding/OnboardingWizard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeStep from './steps/WelcomeStep';
import ApiKeyStep from './steps/ApiKeyStep';
import CompanionStep from './steps/CompanionStep';

const ONBOARDING_SKIPPED_KEY = 'openhub_onboarding_skipped';

const OnboardingWizard: React.FC = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_SKIPPED_KEY, 'true');
    finish();
  };

  const finish = () => {
    navigate('/guid');
  };

  const steps = [
    <WelcomeStep key="welcome" onNext={handleNext} onSkip={handleSkip} />,
    <ApiKeyStep key="apikey" onNext={handleNext} onSkip={handleSkip} />,
    <CompanionStep key="companion" onNext={handleNext} />,
  ];

  return (
    <div className="onboarding-wizard size-full flex items-center justify-center bg-fill-1">
      <div className="onboarding-card w-420px rd-12px bg-white p-32px shadow-md">
        {/* 步骤指示器 */}
        <div className="flex justify-center gap-8px mb-24px">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-6px rd-3px transition-all ${
                i === step ? 'w-24px bg-primary-6' : i < step ? 'w-12px bg-primary-4' : 'w-12px bg-fill-3'
              }`}
            />
          ))}
        </div>
        {steps[step]}
      </div>
    </div>
  );
};

/** 工具函数：检查是否需要显示引导 */
export const shouldShowOnboarding = (): boolean => {
  return localStorage.getItem(ONBOARDING_SKIPPED_KEY) !== 'true';
};

export default OnboardingWizard;
```

- [ ] **Step 2: 创建 WelcomeStep**

```tsx
// ui/src/renderer/pages/onboarding/steps/WelcomeStep.tsx
import React from 'react';
import { Button, Typography } from '@arco-design/web-react';
import { useTranslation } from 'react-i18next';

interface WelcomeStepProps {
  onNext: () => void;
  onSkip: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext, onSkip }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center text-center gap-16px">
      {/* 伙伴插图占位 — 后续替换为实际伙伴形象 SVG */}
      <div className="size-120px rd-50% bg-fill-2 flex items-center justify-center">
        <span className="text-48px">🤖</span>
      </div>
      <Typography.Title heading={4}>
        {t('onboarding.welcome.title', { defaultValue: '欢迎来到 OpenHub' })}
      </Typography.Title>
      <Typography.Text type="secondary">
        {t('onboarding.welcome.subtitle', {
          defaultValue: '你的 AI 工作站，一切数据留在你自己的电脑上',
        })}
      </Typography.Text>
      <div className="flex flex-col gap-8px w-full mt-8px">
        <Button type="primary" long onClick={onNext}>
          {t('onboarding.welcome.start', { defaultValue: '开始设置' })}
        </Button>
        <Button type="text" long onClick={onSkip}>
          {t('onboarding.welcome.skip', { defaultValue: '跳过，直接使用' })}
        </Button>
      </div>
    </div>
  );
};

export default WelcomeStep;
```

- [ ] **Step 3: 创建 ApiKeyStep**

```tsx
// ui/src/renderer/pages/onboarding/steps/ApiKeyStep.tsx
import React, { useState } from 'react';
import { Button, Input, Select, Typography, Message } from '@arco-design/web-react';
import { useTranslation } from 'react-i18next';

interface ApiKeyStepProps {
  onNext: () => void;
  onSkip: () => void;
}

const PROVIDER_OPTIONS = [
  { label: 'OpenAI', value: 'openai' },
  { label: 'Anthropic', value: 'anthropic' },
  { label: 'DeepSeek', value: 'deepseek' },
];

const ApiKeyStep: React.FC<ApiKeyStepProps> = ({ onNext, onSkip }) => {
  const { t } = useTranslation();
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      onSkip(); // 空 key = 跳过
      return;
    }
    setLoading(true);
    try {
      // TODO: 调用现有的 API Key 保存逻辑
      // 超时 10s 则允许跳过
      await Promise.race([
        saveApiKey(provider, apiKey),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
      ]);
      onNext();
    } catch {
      // 超时 — 允许跳过，不阻塞用户
      Message.warning(t('onboarding.apiKey.timeout', { defaultValue: '验证超时，可稍后在设置中配置' }));
      onNext();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center text-center gap-16px">
      <Typography.Title heading={4}>
        {t('onboarding.apiKey.title', { defaultValue: '连接 AI 大脑' })}
      </Typography.Title>
      <div className="w-full flex flex-col gap-12px">
        <Select
          value={provider}
          onChange={setProvider}
          options={PROVIDER_OPTIONS}
          style={{ width: '100%' }}
        />
        <Input.Password
          value={apiKey}
          onChange={setApiKey}
          placeholder={t('onboarding.apiKey.placeholder', { defaultValue: '粘贴 API Key' })}
          style={{ width: '100%' }}
        />
      </div>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {t('onboarding.apiKey.hint', {
          defaultValue: '支持 26+ 服务商，以后可在设置中随时添加或切换',
        })}
      </Typography.Text>
      <div className="flex flex-col gap-8px w-full mt-8px">
        <Button type="primary" long onClick={handleSubmit} loading={loading}>
          {t('onboarding.apiKey.next', { defaultValue: '下一步' })}
        </Button>
        <Button type="text" long onClick={onSkip}>
          {t('onboarding.apiKey.skip', { defaultValue: '跳过，稍后配置' })}
        </Button>
      </div>
    </div>
  );
};

// 占位 — 实际的 API Key 保存使用现有逻辑
async function saveApiKey(provider: string, apiKey: string): Promise<void> {
  // 调用现有的 API Key 保存 bridge
  // const { ipcBridge } = await import('@common/adapter/ipcBridge');
  // await ipcBridge.settings.saveProviderApiKey.invoke({ provider, apiKey });
  return Promise.resolve();
}

export default ApiKeyStep;
```

- [ ] **Step 4: 创建 CompanionStep**

```tsx
// ui/src/renderer/pages/onboarding/steps/CompanionStep.tsx
import React from 'react';
import { Button, Typography } from '@arco-design/web-react';
import { useTranslation } from 'react-i18next';

interface CompanionStepProps {
  onNext: () => void;
}

const CompanionStep: React.FC<CompanionStepProps> = ({ onNext }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center text-center gap-16px">
      {/* 伙伴头像 — 简约线条风，微笑圆形 */}
      <div className="size-120px rd-50% bg-fill-2 flex items-center justify-center border-2 border-solid border-primary-3">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" className="text-primary-6" />
          <circle cx="24" cy="28" r="3" fill="currentColor" className="text-primary-6" />
          <circle cx="40" cy="28" r="3" fill="currentColor" className="text-primary-6" />
          <path d="M24 40 Q32 48 40 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary-6" />
        </svg>
      </div>
      <Typography.Title heading={4}>
        {t('onboarding.companion.title', {
          defaultValue: '你好，我是 Nomi（诺米）',
        })}
      </Typography.Title>
      <Typography.Text type="secondary">
        {t('onboarding.companion.desc', {
          defaultValue: '我是你的 AI 伙伴，会陪你聊天、帮你干活、越用越懂你',
        })}
      </Typography.Text>
      <Button type="primary" long onClick={onNext} style={{ marginTop: 8 }}>
        {t('onboarding.companion.start', { defaultValue: '开始聊天' })}
      </Button>
    </div>
  );
};

export default CompanionStep;
```

- [ ] **Step 5: 注册路由和入口逻辑**

在 `Router.tsx` 中添加：
```tsx
const OnboardingWizard = React.lazy(() => import('@renderer/pages/onboarding'));

// 在 <Routes> 中添加:
<Route path="/onboarding" element={withRouteFallback(OnboardingWizard)} />
```

在 App 初始化时检查是否需要显示 Wizard（在 `AppLoader.tsx` 或 `Layout.tsx` 中）：
```tsx
import { shouldShowOnboarding } from '@renderer/pages/onboarding/OnboardingWizard';

// 在路由初始化逻辑中:
if (shouldShowOnboarding() && !pathname.startsWith('/onboarding')) {
  return <Navigate to="/onboarding" replace />;
}
```

- [ ] **Step 6: 提交**

```bash
git add ui/src/renderer/pages/onboarding/
git add ui/src/renderer/components/layout/Router.tsx
git commit -m "feat: add 3-step onboarding wizard

Welcome → API Key → Companion. Skippable, persisted via localStorage.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6: 简化会话创建流程

**Files:**
- Modify: `ui/src/renderer/pages/conversation/components/ConversationShell/index.tsx` 或会话创建相关组件
- Modify: 新建会话时的高级配置组件

**Interfaces:**
- Produces: 新建会话直接进入空白聊天，高级配置折叠

- [ ] **Step 1: 查找并修改新建会话入口**

找到新建会话的触发逻辑。将默认行为改为直接创建会话，使用默认配置：`nomi` Agent + 通用助手 + 我的知识库。

高级配置（模型/Agent/知识库/MCP）折叠在可展开的面板中。

```tsx
// 在新建会话的逻辑中，替换配置向导为直接创建:
const handleNewConversation = async () => {
  const defaultConfig = {
    agentType: 'openhub',
    assistantId: DEFAULT_ASSISTANT_ID,    // 通用助手
    knowledgeBaseIds: [DEFAULT_KB_ID],    // 我的知识库
  };
  const conversationId = await createConversation(defaultConfig);
  navigate(`/conversation/${conversationId}`);
};
```

在会话页面上方添加可折叠的「高级配置」区域：
```tsx
const [showAdvanced, setShowAdvanced] = useState(false);

// 在页面顶部:
<Collapse activeKey={showAdvanced ? ['advanced'] : []} onChange={() => setShowAdvanced(!showAdvanced)}>
  <Collapse.Item key="advanced" header="高级配置">
    {/* 模型选择、Agent 类型、知识库挂载、MCP 选择 */}
  </Collapse.Item>
</Collapse>
```

- [ ] **Step 2: 验证**

手动测试：点击「+ 新建对话」→ 确认直接进入聊天页面，可以立即打字。

- [ ] **Step 3: 提交**

```bash
git add ui/src/renderer/pages/conversation/
git commit -m "feat: simplify new conversation to direct-start with collapsed advanced config

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7: 移动端汉堡菜单抽屉

**Files:**
- Create: `ui/src/renderer/components/layout/MobileDrawer.tsx`
- Modify: `ui/src/renderer/components/layout/Layout.tsx`（如需要）

**Interfaces:**
- Produces: 移动端 `isMobile` 时，顶部栏显示汉堡图标，点击滑出左侧抽屉

- [ ] **Step 1: 创建 MobileDrawer 组件**

```tsx
// ui/src/renderer/components/layout/MobileDrawer.tsx
import React from 'react';
import { Drawer } from '@arco-design/web-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLayoutContext } from '@renderer/hooks/context/LayoutContext';

interface MobileDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const navTo = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      visible={visible}
      onCancel={onClose}
      placement="left"
      width={260}
      footer={null}
      title={null}
      mask
    >
      <div className="flex flex-col gap-4px mt-16px">
        <div className="drawer-item px-16px py-12px rd-8px hover:bg-fill-2 cursor-pointer"
             onClick={() => navTo('/guid')}>
          {t('common.sider.newConversation', { defaultValue: '+ 新建对话' })}
        </div>
        <div className="drawer-item px-16px py-12px rd-8px hover:bg-fill-2 cursor-pointer"
             onClick={() => navTo('/knowledge')}>
          {t('common.sider.knowledge', { defaultValue: '📚 知识库' })}
        </div>
        <div className="drawer-item px-16px py-12px rd-8px hover:bg-fill-2 cursor-pointer"
             onClick={() => navTo('/plugins')}>
          {t('common.sider.plugins', { defaultValue: '🔌 插件' })}
        </div>
        <div className="drawer-item px-16px py-12px rd-8px hover:bg-fill-2 cursor-pointer"
             onClick={() => navTo('/settings/system')}>
          {t('common.sider.settings', { defaultValue: '⚙️ 设置' })}
        </div>
      </div>
    </Drawer>
  );
};

export default MobileDrawer;
```

- [ ] **Step 2: 在 Layout 或 Titlebar 中集成**

在 `Titlebar/index.tsx` 中添加汉堡按钮（仅 `isMobile` 时显示）：
```tsx
const [drawerVisible, setDrawerVisible] = useState(false);

{isMobile && (
  <Button
    type="text"
    icon={<Menu />}
    onClick={() => setDrawerVisible(true)}
  />
)}
<MobileDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
```

- [ ] **Step 3: 提交**

```bash
git add ui/src/renderer/components/layout/MobileDrawer.tsx
git add ui/src/renderer/components/layout/Titlebar/index.tsx
git commit -m "feat: add mobile hamburger drawer navigation

Avoids bottom tab/chat-input mis-tap on mobile. Drawer mirrors desktop sidebar.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 8: 设置页重组

**Files:**
- Modify: `ui/src/renderer/pages/settings/components/SettingsSider.tsx`

**Interfaces:**
- Produces: 重组后的设置导航，反映新的分组

- [ ] **Step 1: 重组 BUILTIN_TAB_IDS 和菜单**

```tsx
// 更新 BUILTIN_TAB_IDS 为新的分组顺序:
export const BUILTIN_TAB_IDS = [
  'model',          // 模型 & Agent
  'companion',      // 桌面伙伴（新增）
  'requirements',   // 需求 & 自动化（定时任务 + AutoWork）
  'public-service', // 对外伙伴
  'workshop',       // 创意工坊 & 资产库
  'system',         // 系统设置
] as const;

// 更新 builtinMap:
const builtinMap: Record<string, SiderItem> = {
  model: { id: 'model', label: t('settings.modelAgent', { defaultValue: '模型 & Agent' }), icon: <Robot />, path: 'model' },
  companion: { id: 'companion', label: t('settings.companion', { defaultValue: '桌面伙伴' }), icon: <SmilingFace />, path: 'companion' },
  requirements: { id: 'requirements', label: t('settings.requirements', { defaultValue: '需求 & 自动化' }), icon: <ClockCircle />, path: 'requirements' },
  'public-service': { id: 'public-service', label: t('settings.publicService', { defaultValue: '对外伙伴' }), icon: <Earth />, path: 'public-service' },
  workshop: { id: 'workshop', label: t('settings.workshop', { defaultValue: '创意工坊 & 资产库' }), icon: <Brush />, path: 'workshop' },
  system: { id: 'system', label: t('settings.system'), icon: <System />, path: 'system' },
};
```

- [ ] **Step 2: 验证**

运行：`bun run typecheck`，确认设置页所有现有路由仍可访问。

- [ ] **Step 3: 提交**

```bash
git add ui/src/renderer/pages/settings/components/SettingsSider.tsx
git commit -m "feat: reorganize settings navigation to match simplified sidebar

Group: Model&Agent, Companion, Requirements&AutoWork, Public Service,
Creative Workshop&Assets, System.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 9: 最终验证和集成测试

**Files:** 无新建

- [ ] **Step 1: 全量 typecheck**

```bash
bun run typecheck
```

修复所有类型错误。

- [ ] **Step 2: 手动冒烟测试清单**

- [ ] 桌面端侧边栏显示 5 个入口（新建对话、知识库、插件、设置 + 底部模型入口）
- [ ] 点击「新建对话」→ 直接进入聊天页面
- [ ] 点击「插件」→ 进入 `/plugins` 页面，3 个 Tab 切换正常
- [ ] 点击「知识库」→ 进入 `/knowledge` 页面
- [ ] 点击「设置」→ 进入设置页，新分组可见
- [ ] 移动端（Chrome DevTools 模拟）→ 汉堡图标可见，抽屉滑出正常
- [ ] 首次安装（清除 localStorage）→ Wizard 弹出
- [ ] Wizard 完整走完 3 步 → 进入主界面
- [ ] Wizard 点击跳过 → 进入主界面，刷新不再弹出
- [ ] 所有旧路由直接 URL 访问仍工作（`/mcp`、`/assistants`、`/nomi` 等）

- [ ] **Step 3: 运行现有测试**

```bash
bun run test:fast
```

确保无回归。

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "chore: final integration verification for UI simplification

All routes preserved, typecheck passes, existing tests pass.

Co-Authored-By: Claude <noreply@anthropic.com>"
```
