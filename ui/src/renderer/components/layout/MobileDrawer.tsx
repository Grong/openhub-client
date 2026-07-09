/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Drawer } from '@arco-design/web-react';

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
      placement='left'
      width={260}
      footer={null}
      title={null}
      mask
    >
      <div className='flex flex-col gap-4px mt-16px'>
        <div
          className='drawer-item px-16px py-12px rd-8px hover:bg-fill-2 cursor-pointer text-14px font-500'
          onClick={() => navTo('/guid')}
        >
          {t('common.siderSection.common', { defaultValue: '+ 新建对话' })}
        </div>
        <div
          className='drawer-item px-16px py-12px rd-8px hover:bg-fill-2 cursor-pointer text-14px font-500'
          onClick={() => navTo('/knowledge')}
        >
          {t('knowledge.title')}
        </div>
        <div
          className='drawer-item px-16px py-12px rd-8px hover:bg-fill-2 cursor-pointer text-14px font-500'
          onClick={() => navTo('/plugins')}
        >
          {t('common.siderSection.plugins', { defaultValue: '插件' })}
        </div>
        <div
          className='drawer-item px-16px py-12px rd-8px hover:bg-fill-2 cursor-pointer text-14px font-500'
          onClick={() => navTo('/models')}
        >
          {t('modelHub.title')}
        </div>
        <div
          className='drawer-item px-16px py-12px rd-8px hover:bg-fill-2 cursor-pointer text-14px font-500'
          onClick={() => navTo('/settings/system')}
        >
          {t('common.settings')}
        </div>
      </div>
    </Drawer>
  );
};

export default MobileDrawer;
