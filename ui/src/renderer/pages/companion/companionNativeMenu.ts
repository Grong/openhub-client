/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

export type CompanionMenuAction = 'open-chat' | 'open-memories' | 'open-config' | 'clear-unread' | 'hide';

export interface CompanionMenuEntry {
  action: CompanionMenuAction;
  text: string;
}

type Translate = (key: string, params?: Record<string, string>) => string;

export function buildCompanionMenuEntries(opts: { name: string; t: Translate }): CompanionMenuEntry[] {
  return [
    { action: 'open-chat', text: opts.t('openhub.companion.menuOpenChat') },
    { action: 'open-memories', text: opts.t('openhub.companion.menuOpenMemories') },
    { action: 'open-config', text: opts.t('openhub.companion.menuOpenConfig', { name: opts.name }) },
    { action: 'clear-unread', text: opts.t('openhub.companion.menuClearUnread') },
    { action: 'hide', text: opts.t('openhub.companion.menuHide') },
  ];
}
