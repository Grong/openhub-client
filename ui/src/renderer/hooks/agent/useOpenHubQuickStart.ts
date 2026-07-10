/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import { ipcBridge } from '@/common';
import { Message } from '@arco-design/web-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { emitter } from '@/renderer/utils/emitter';
import { seedConversationCache } from '@/renderer/pages/conversation/utils/conversationCache';
import { useGuidModelSelection } from '@/renderer/pages/guid/hooks/useGuidModelSelection';

export interface OpenHubQuickStartOptions {
  /** Conversation title. */
  name: string;
  /** First user message — auto-sent by OpenHubSendBox once the model is ready. */
  prompt: string;
}

/**
 * Spin up a fresh Nomi conversation seeded with an initial prompt, then jump to
 * it. Mirrors the Nomi branch of `useGuidSend`: create → refresh history →
 * stash the initial message in sessionStorage (consumed by `OpenHubSendBox`) →
 * navigate. Used by the "one-click install" / "set up with Nomi" buttons so a
 * single click hands the task to the built-in Nomi agent.
 */
export const useOpenHubQuickStart = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { current_model } = useGuidModelSelection('openhub');

  const start = useCallback(
    async ({ name, prompt }: OpenHubQuickStartOptions): Promise<boolean> => {
      if (!current_model) {
        Message.warning(t('conversation.noModelConfigured'));
        return false;
      }
      try {
        const conversation = await ipcBridge.conversation.create.invoke({
          type: 'openhub',
          name,
          model: current_model,
          extra: { workspace: '', custom_workspace: false, default_files: [] },
        });
        if (!conversation || !conversation.id) {
          Message.error(t('conversation.createFailed'));
          return false;
        }
        emitter.emit('chat.history.refresh');
        sessionStorage.setItem(`openhub_initial_message_${conversation.id}`, JSON.stringify({ input: prompt }));
        seedConversationCache(conversation);
        await navigate(`/conversation/${conversation.id}`);
        return true;
      } catch (error) {
        console.error('Nomi quick start failed:', error);
        Message.error(t('conversation.createFailed'));
        return false;
      }
    },
    [current_model, navigate, t]
  );

  return { start, canStart: Boolean(current_model) };
};
