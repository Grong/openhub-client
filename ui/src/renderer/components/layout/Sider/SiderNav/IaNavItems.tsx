/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import { AlarmClock, BookOne, CheckCorrect, EveryUser, Plus, SettingTwo } from '@icon-park/react';
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
  { key: 'scheduled', path: '/scheduled', labelKey: 'common.iaNav.scheduled', icon: <AlarmClock theme='outline' size='16' /> },
  { key: 'roster', path: '/roster', labelKey: 'common.iaNav.roster', icon: <EveryUser theme='outline' size='16' /> },
  { key: 'knowledge', path: '/knowledge', labelKey: 'knowledge.title', icon: <BookOne theme='outline' size='16' /> },
  { key: 'settings', path: '/settings/system', labelKey: 'settings.title', icon: <SettingTwo theme='outline' size='16' /> },
];
