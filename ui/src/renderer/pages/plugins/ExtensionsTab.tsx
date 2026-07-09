/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Empty, Typography } from '@arco-design/web-react';
import { useExtensionSettingsTabs } from '@renderer/hooks/system/useExtensionSettingsTabs';

/**
 * Lightweight extensions listing for the Plugins page.
 * ExtensionSettingsPage requires a :tabId route param and cannot render
 * standalone. This component lists all installed extensions and links
 * to their full settings page.
 */
const ExtensionsTab: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const extensionTabs = useExtensionSettingsTabs();

  if (extensionTabs.length === 0) {
    return (
      <Empty
        description={t('plugins.extensions.empty', { defaultValue: '暂无已安装的扩展' })}
      />
    );
  }

  return (
    <div className='flex flex-col gap-8px'>
      <Typography.Text type='secondary' style={{ fontSize: 13 }}>
        {t('plugins.extensions.hint', { defaultValue: '点击扩展名称进入详细设置' })}
      </Typography.Text>
      {extensionTabs.map((tab) => (
        <div
          key={tab.id}
          className='flex items-center gap-8px px-16px py-12px rd-8px cursor-pointer hover:bg-fill-2 transition-colors'
          onClick={() => navigate(`/settings/ext/${tab.id}`)}
        >
          <span className='text-14px font-500 text-t-primary'>{tab.label}</span>
          <span className='text-12px text-t-tertiary ml-auto'>{tab.extensionName}</span>
        </div>
      ))}
    </div>
  );
};

export default ExtensionsTab;
