/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import { PendingConversationProvider } from './PendingConversationContext';
import PendingConversationOverlay from './PendingConversationOverlay';

/**
 * ConversationShell — the layout route wrapping the session section
 * (`/guid`, `/conversation/:id`, `/terminal-new`, `/terminal/:id`).
 *
 * Session list has been integrated into the main app Sider, so this
 * component only provides the conversation context and renders the
 * matched child route in `<Outlet/>`.
 */
const ConversationShell: React.FC = () => {
  return (
    <PendingConversationProvider>
      <div className='relative flex size-full min-h-0'>
        <div className='relative flex-1 min-w-0 min-h-0 flex flex-col'>
          <Outlet />
          <PendingConversationOverlay />
        </div>
      </div>
    </PendingConversationProvider>
  );
};

export default ConversationShell;
