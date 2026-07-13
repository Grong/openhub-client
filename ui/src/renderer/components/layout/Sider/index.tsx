/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Message } from '@arco-design/web-react';
import { ipcBridge } from '@/common';
import { cleanupSiderTooltips, getSiderTooltipProps } from '@renderer/utils/ui/siderTooltip';
import { useAuth } from '@renderer/hooks/context/AuthContext';
import { useLayoutContext } from '@renderer/hooks/context/LayoutContext';
import { blurActiveElement } from '@renderer/utils/ui/focus';
import { isDesktopShell } from '@renderer/utils/platform';
import { useKnowledgeInboxPending } from '@renderer/pages/knowledge/useKnowledge';
import { addRecentWorkspace } from '@renderer/components/workspace';
import WorkpathSessionList from '@renderer/pages/conversation/SessionList';
import { useSidebarDisplayPreferences } from '@renderer/pages/conversation/SessionList/hooks/useSidebarDisplayPreferences';
import { addProjectWorkpath } from '@renderer/pages/conversation/SessionList/utils/projectWorkpaths';
import SessionCreateBar from '@renderer/pages/conversation/components/ConversationShell/SessionCreateBar';
import {
  SiderKnowledgeEntry,
  SiderModelHubEntry,
  SiderPluginEntry,
  SiderSectionHeader,
} from './SiderNav';
import SiderFooter from './SiderFooter';
import ProjectGroup from './ProjectGroup';

const SettingsSider = React.lazy(() => import('@renderer/pages/settings/components/SettingsSider'));

interface SiderProps {
  onSessionClick?: () => void;
  collapsed?: boolean;
}

/**
 * Sider — the unified app-level navigation rail.
 *
 * On conversation routes, shows the session list (create, search, sessions)
 * above the navigation links. On other routes, shows only navigation links.
 * This replaces the previous dual-sidebar layout (Sider + ContentSider).
 */
const Sider: React.FC<SiderProps> = ({ onSessionClick, collapsed = false }) => {
  const { t } = useTranslation();
  const layout = useLayoutContext();
  const isMobile = layout?.isMobile ?? false;
  const location = useLocation();
  const { pathname, search, hash } = location;
  const { count: pendingInboxCount } = useKnowledgeInboxPending();

  const navigate = useNavigate();
  const { logout, status } = useAuth();
  const isSettings = pathname.startsWith('/settings');

  // Session routes
  const isSessionRoute =
    pathname === '/guid' ||
    pathname.startsWith('/conversation/') ||
    pathname === '/terminal-new' ||
    pathname.startsWith('/terminal/');

  const lastNonSettingsPathRef = useRef('/guid');
  const showLogout = !isDesktopShell() && status === 'authenticated';

  // Session-related state (moved from ConversationShell)
  const [batchMode, setBatchMode] = useState(false);
  const {
    preferences: displayPreferences,
    applyPreset: applyDisplayPreset,
    updatePreference: updateDisplayPreference,
  } = useSidebarDisplayPreferences();

  useEffect(() => {
    if (!pathname.startsWith('/settings')) {
      lastNonSettingsPathRef.current = `${pathname}${search}${hash}`;
    }
  }, [pathname, search, hash]);

  const navTo = useCallback(
    (target: string) => {
      cleanupSiderTooltips();
      blurActiveElement();
      Promise.resolve(navigate(target)).catch((error) => {
        console.error('Navigation failed:', error);
      });
      if (onSessionClick) {
        onSessionClick();
      }
    },
    [navigate, onSessionClick]
  );

  const handleNewChat = useCallback(() => {
    setBatchMode(false);
    if (isMobile && onSessionClick) onSessionClick();
    void navigate('/guid', { state: { resetAssistant: true } });
  }, [isMobile, navigate, onSessionClick]);

  const handleNewTerminal = useCallback(() => {
    setBatchMode(false);
    if (isMobile && onSessionClick) onSessionClick();
    void navigate('/terminal-new');
  }, [isMobile, navigate, onSessionClick]);

  const handleCreateProject = useCallback(async () => {
    setBatchMode(false);
    try {
      const paths = await ipcBridge.dialog.showOpen.invoke({ properties: ['openDirectory', 'createDirectory'] });
      const projectPath = paths?.[0]?.trim();
      if (!projectPath) return;
      addProjectWorkpath(projectPath);
      addRecentWorkspace(projectPath);
      void navigate('/guid', { state: { workspace: projectPath } });
      if (isMobile && onSessionClick) onSessionClick();
      Message.success(t('sessionList.createProjectSuccess'));
    } catch (error) {
      console.error('[Sider] Failed to create project:', error);
      Message.error(t('sessionList.createProjectFailed'));
    }
  }, [isMobile, navigate, onSessionClick, t]);

  const handleConversationSelect = useCallback(() => {
    setBatchMode(false);
  }, []);

  const handleSessionClick = useCallback(() => {
    if (isMobile && onSessionClick) onSessionClick();
  }, [isMobile, onSessionClick]);

  const handleKnowledgeClick = () => navTo('/knowledge');
  const handlePluginsClick = () => navTo('/plugins');
  const handleModelHubClick = () => navTo('/models');

  const handleSettingsClick = () => {
    cleanupSiderTooltips();
    blurActiveElement();
    if (isSettings) {
      const target = lastNonSettingsPathRef.current || '/guid';
      Promise.resolve(navigate(target)).catch((error) => {
        console.error('Navigation failed:', error);
      });
    } else {
      Promise.resolve(navigate('/settings/system')).catch((error) => {
        console.error('Navigation failed:', error);
      });
    }
    if (onSessionClick) {
      onSessionClick();
    }
  };

  const handleLogout = useCallback(async () => {
    cleanupSiderTooltips();
    blurActiveElement();
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      return;
    }
    if (onSessionClick) {
      onSessionClick();
    }
  }, [logout, onSessionClick]);

  useEffect(() => {
    if (!showLogout) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        handleLogout();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleLogout, showLogout]);

  const tooltipEnabled = collapsed && !isMobile;
  const siderTooltipProps = getSiderTooltipProps(tooltipEnabled);

  return (
    <div className='size-full flex flex-col'>
      <div className='flex-1 min-h-0 overflow-hidden'>
        <div className='size-full flex flex-col min-h-0'>
          {/* Settings sub-navigation — only on settings routes */}
          {isSettings && (
            <div className='shrink-0 max-h-45p overflow-y-auto'>
              <Suspense fallback={<div className='size-full' />}>
                <SettingsSider collapsed={collapsed} tooltipEnabled={tooltipEnabled} />
              </Suspense>
              <div className='px-12px pt-4px pb-4px'>
                <div className='border-t border-solid border-[var(--color-border-2)]' />
              </div>
            </div>
          )}

          {/* Create actions — always visible */}
          <div className='shrink-0 flex flex-col'>
            <SessionCreateBar
              batchMode={batchMode}
              onToggleBatchMode={() => setBatchMode((prev) => !prev)}
              onNewChat={handleNewChat}
              onNewTerminal={handleNewTerminal}
              onCreateProject={handleCreateProject}
              displayPreferences={displayPreferences}
              onDisplayPresetChange={applyDisplayPreset}
              onDisplayPreferenceChange={updateDisplayPreference}
              onSessionClick={isMobile ? handleSessionClick : undefined}
              onConversationSelect={handleConversationSelect}
            />
          </div>

          {/* Session list — scrollable, on conversation routes */}
          {isSessionRoute && (
            <div className='flex-1 min-h-0 overflow-y-auto px-8px'>
              <WorkpathSessionList
                collapsed={collapsed}
                tooltipEnabled={!isMobile && collapsed}
                batchMode={batchMode}
                displayPreferences={displayPreferences}
                onBatchModeChange={setBatchMode}
                onSessionClick={isMobile ? handleSessionClick : undefined}
              />
            </div>
          )}

          {/* Divider between sessions and nav */}
          {isSessionRoute && (
            <div className='shrink-0 px-12px pt-4px pb-4px'>
              <div className='border-t border-solid border-[var(--color-border-2)]' />
            </div>
          )}

          {/* Navigation links section */}
          <div className={isSessionRoute || isSettings ? 'shrink-0' : 'flex-1'} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {!isSessionRoute && !isSettings && (
              <SiderSectionHeader label={t('common.siderSection.common')} collapsed={collapsed} />
            )}
            {/* Knowledge */}
            <SiderKnowledgeEntry
              isMobile={isMobile}
              isActive={pathname.startsWith('/knowledge')}
              collapsed={collapsed}
              siderTooltipProps={siderTooltipProps}
              onClick={handleKnowledgeClick}
              dot={pendingInboxCount > 0}
            />
            {/* Plugins */}
            <SiderPluginEntry
              isMobile={isMobile}
              isActive={pathname.startsWith('/plugins')}
              collapsed={collapsed}
              siderTooltipProps={siderTooltipProps}
              onClick={handlePluginsClick}
            />
            {/* Projects */}
            <ProjectGroup
              isMobile={isMobile}
              collapsed={collapsed}
              siderTooltipProps={siderTooltipProps}
            />
          </div>
        </div>
      </div>
      {/* Bottom pinned group — ModelHub + Settings footer */}
      <div className='shrink-0 mt-auto pt-8px flex flex-col gap-2px border-t border-solid border-[var(--color-border-2)] border-l-0 border-r-0 border-b-0'>
        <SiderSectionHeader label={t('common.siderSection.settings')} collapsed={collapsed} collapsedRule={false} />
        <SiderModelHubEntry
          isMobile={isMobile}
          isActive={pathname.startsWith('/models')}
          collapsed={collapsed}
          siderTooltipProps={siderTooltipProps}
          onClick={handleModelHubClick}
        />
        <SiderFooter
          isMobile={isMobile}
          isSettings={isSettings}
          collapsed={collapsed}
          siderTooltipProps={siderTooltipProps}
          onSettingsClick={handleSettingsClick}
          showLogout={showLogout}
          onLogoutClick={handleLogout}
        />
      </div>
    </div>
  );
};

export default Sider;
