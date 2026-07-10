/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { extensions as extensionsIpc, type IExtensionSettingsTab } from '@/common/adapter/ipcBridge';
import { useExtI18n } from '@/renderer/hooks/system/useExtI18n';
import { useExtensionSettingsTabs } from '@/renderer/hooks/system/useExtensionSettingsTabs';
import WebviewHost from '@/renderer/components/media/WebviewHost';
import { resolveExtensionAssetUrl } from '@/renderer/utils/platform';
import SettingsPageWrapper from './components/SettingsPageWrapper';

const isExternalSettingsUrl = (url?: string): boolean => /^https?:\/\//i.test(url || '');

/**
 * Route-based page for rendering extension-contributed settings tabs.
 * Loaded at `/settings/ext/:tabId` in the router.
 */
const ExtensionSettingsPage: React.FC = () => {
  const { tabId } = useParams<{ tabId: string }>();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const { resolveExtTabName } = useExtI18n();
  const extensionTabs = useExtensionSettingsTabs();
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { tab, error } = useMemo<{ tab: IExtensionSettingsTab | null; error: string | null }>(() => {
    // When no tabId is provided (e.g. embedded in Plugins page), show the list
    // view instead of an error.
    if (!tabId) {
      return { tab: null, error: null };
    }
    // While shared cache is still warming up (empty on first mount), defer
    // the "not found" error so a freshly-loaded tab list can resolve it.
    if (extensionTabs.length === 0) {
      return { tab: null, error: null };
    }
    const found = extensionTabs.find((t) => t.id === tabId);
    if (found) {
      return { tab: found, error: null };
    }
    return { tab: null, error: `Settings tab "${tabId}" not found` };
  }, [tabId, extensionTabs]);

  const resolvedUrl = resolveExtensionAssetUrl(tab?.url) ?? tab?.url;
  const isExternalTab = isExternalSettingsUrl(resolvedUrl);

  useEffect(() => {
    setLoading(true);
  }, [tab?.id, resolvedUrl]);

  const postLocaleInit = useCallback(async () => {
    if (!tab || isExternalTab) return;

    const frameWindow = iframeRef.current?.contentWindow;
    if (!frameWindow) return;

    try {
      const mergedI18n = await extensionsIpc.getExtI18nForLocale.invoke({ locale: i18n.language });
      const translations = (mergedI18n?.[tab.extensionName] as Record<string, unknown> | undefined) ?? {};

      frameWindow.postMessage(
        {
          type: 'openhub:init',
          locale: i18n.language,
          extensionName: tab.extensionName,
          translations,
        },
        '*'
      );
    } catch (err) {
      console.error('[ExtensionSettingsPage] Failed to post locale init:', err);
    }
  }, [i18n.language, isExternalTab, tab]);

  useEffect(() => {
    if (!tab || isExternalTab) return;

    const onMessage = async (event: MessageEvent) => {
      const frameWindow = iframeRef.current?.contentWindow;
      if (!frameWindow || event.source !== frameWindow) return;

      const data = event.data as { type?: string; reqId?: string } | undefined;
      if (!data) return;

      if (data.type === 'openhub:get-locale') {
        void postLocaleInit();
        return;
      }

      if (data.type !== 'star-office:request-snapshot') return;

      try {
        const snapshot = await extensionsIpc.getAgentActivitySnapshot.invoke();
        frameWindow.postMessage(
          {
            type: 'star-office:activity-snapshot',
            reqId: data.reqId,
            snapshot,
          },
          '*'
        );
      } catch (err) {
        console.error('[ExtensionSettingsPage] Failed to get activity snapshot:', err);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [isExternalTab, postLocaleInit, tab]);

  useEffect(() => {
    if (!loading) {
      void postLocaleInit();
    }
  }, [loading, postLocaleInit]);

  return (
    <SettingsPageWrapper>
      <div className='relative w-full h-full min-h-400px'>
        {/* List view — when embedded without a specific tabId (e.g. Plugins page). */}
        {!tabId && extensionTabs.length > 0 && (
          <div className='flex flex-col gap-8px'>
            {extensionTabs.map((ext) => (
              <div
                key={ext.id}
                className='flex items-center gap-8px px-16px py-12px rd-8px cursor-pointer hover:bg-fill-2 transition-colors'
                onClick={() => navigate(`/settings/ext/${ext.id}`)}
              >
                <span className='text-14px font-500 text-t-primary'>{ext.label}</span>
                <span className='text-12px text-t-tertiary ml-auto'>{ext.extensionName}</span>
              </div>
            ))}
          </div>
        )}
        {!tabId && extensionTabs.length === 0 && (
          <div className='flex items-center justify-center h-full text-t-secondary text-14px'>
            {t('plugins.extensions.empty', { defaultValue: '暂无已安装的扩展' })}
          </div>
        )}
        {tabId && !tab && !error && (
          <div className='absolute inset-0 flex items-center justify-center text-t-secondary text-14px'>
            <span className='animate-pulse'>Loading…</span>
          </div>
        )}
        {error && <div className='flex items-center justify-center h-full text-t-secondary text-14px'>{error}</div>}
        {tab &&
          (isExternalTab ? (
            <WebviewHost
              key={tab.id}
              url={resolvedUrl || ''}
              id={tab.id}
              partition={`persist:ext-settings-${tab.id}`}
              style={{
                minHeight: '400px',
                height: 'calc(100vh - 200px)',
              }}
            />
          ) : (
            <>
              {loading && (
                <div className='absolute inset-0 flex items-center justify-center text-t-secondary text-14px'>
                  <span className='animate-pulse'>Loading…</span>
                </div>
              )}
              <iframe
                ref={iframeRef}
                key={tab.id}
                src={resolvedUrl}
                onLoad={() => setLoading(false)}
                sandbox='allow-scripts allow-same-origin'
                className='w-full border-none'
                style={{
                  minHeight: '400px',
                  height: 'calc(100vh - 200px)',
                  opacity: loading ? 0 : 1,
                  transition: 'opacity 150ms ease-in',
                }}
                title={`Extension settings: ${resolveExtTabName(tab)}`}
              />
            </>
          ))}
      </div>
    </SettingsPageWrapper>
  );
};

export default ExtensionSettingsPage;
