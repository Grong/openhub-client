/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs } from '@arco-design/web-react';
import HubPageShell from '@renderer/components/layout/HubPageShell';
import AppLoader from '@renderer/components/layout/AppLoader';
import PluginRecommendations from './PluginRecommendations';

const McpPage = React.lazy(() => import('@renderer/pages/mcp'));
const SkillsHubSettings = React.lazy(() => import('@renderer/pages/settings/SkillsHubSettings'));
const ExtensionsTab = React.lazy(() => import('./ExtensionsTab'));

const TabPane = Tabs.TabPane;

const PLUGIN_TABS = [
  { key: 'mcp' },
  { key: 'skills' },
  { key: 'extensions' },
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
          <TabPane
            key={tab.key}
            title={
              tab.key === 'mcp'
                ? t('settings.mcpHub.title', { defaultValue: 'MCP 服务器' })
                : tab.key === 'skills'
                  ? t('settings.skillsHub.title', { defaultValue: 'Skill 包' })
                  : t('settings.extensions.title', { defaultValue: '扩展市场' })
            }
          />
        ))}
      </Tabs>
      <Suspense fallback={<AppLoader />}>
        {activeTab === 'mcp' && <McpPage />}
        {activeTab === 'skills' && <SkillsHubSettings />}
        {activeTab === 'extensions' && <ExtensionsTab />}
      </Suspense>
    </HubPageShell>
  );
};

export default PluginsPage;
