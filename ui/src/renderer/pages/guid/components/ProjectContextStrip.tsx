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
