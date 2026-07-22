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
          className='flex items-center gap-8px px-18px py-10px rd-[var(--radius-md)] bg-[rgb(var(--primary-6))] text-white text-14px cursor-pointer b-none'
        >
          <FolderPlus theme='outline' size='16' fill='currentColor' />
          {t('guid.onboardingProject.create')}
        </button>
        <button
          type='button'
          data-testid='onboarding-open-project'
          onClick={() => void mountProject()}
          className='flex items-center gap-8px px-18px py-10px rd-[var(--radius-md)] bg-[var(--el-elevated)] text-t-primary text-14px cursor-pointer b-none'
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
