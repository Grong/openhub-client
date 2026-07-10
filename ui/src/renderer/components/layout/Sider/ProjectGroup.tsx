/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from '@arco-design/web-react';
import { Folder } from '@icon-park/react';
import classNames from 'classnames';
import type { SiderTooltipProps } from '@renderer/utils/ui/siderTooltip';
import {
  getProjectWorkpaths,
  subscribeProjectWorkpaths,
} from '@renderer/pages/conversation/SessionList/utils/projectWorkpaths';
import SiderSectionHeader from './SiderNav/SiderSectionHeader';

interface ProjectGroupProps {
  isMobile: boolean;
  collapsed: boolean;
  siderTooltipProps: SiderTooltipProps;
}

const ProjectGroup: React.FC<ProjectGroupProps> = ({ isMobile, collapsed, siderTooltipProps }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<string[]>(() => getProjectWorkpaths());

  useEffect(() => {
    return subscribeProjectWorkpaths(() => {
      setProjects(getProjectWorkpaths());
    });
  }, []);

  const handleProjectClick = useCallback(
    (projectPath: string) => {
      navigate('/guid', { state: { workspace: projectPath } });
    },
    [navigate],
  );

  const sectionLabel = t('common.siderSection.project', { defaultValue: '项目' });

  if (projects.length === 0) {
    return null;
  }

  return (
    <>
      <SiderSectionHeader label={sectionLabel} collapsed={collapsed} />
      {projects.map((project) => {
        const displayName = project.split('/').pop() || project;

        if (collapsed) {
          return (
            <Tooltip key={project} {...siderTooltipProps} content={displayName} position='right'>
              <div
                className={classNames(
                  'w-full h-34px flex items-center justify-center cursor-pointer transition-colors rd-8px text-t-primary hover:bg-fill-2 active:bg-fill-3'
                )}
                onClick={() => handleProjectClick(project)}
              >
                <Folder
                  theme='outline'
                  size='20'
                  fill='currentColor'
                  className='block leading-none shrink-0'
                  style={{ lineHeight: 0 }}
                />
              </div>
            </Tooltip>
          );
        }

        return (
          <Tooltip key={project} {...siderTooltipProps} content={displayName} position='right'>
            <div
              className={classNames(
                'box-border group h-34px w-full flex items-center justify-start gap-8px pl-10px pr-8px rd-0.5rem cursor-pointer shrink-0 transition-all text-t-primary hover:bg-fill-2 active:bg-fill-3',
                isMobile && 'sider-action-btn-mobile'
              )}
              onClick={() => handleProjectClick(project)}
            >
              <span className='size-22px flex items-center justify-center shrink-0'>
                <Folder
                  theme='outline'
                  size='16'
                  fill='currentColor'
                  className='block leading-none'
                  style={{ lineHeight: 0 }}
                />
              </span>
              <span className='collapsed-hidden text-14px font-[500] leading-24px truncate'>{displayName}</span>
            </div>
          </Tooltip>
        );
      })}
    </>
  );
};

export default ProjectGroup;
