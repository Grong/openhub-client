/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import { ipcBridge } from '@/common';
import LoadErrorResult from '@renderer/components/base/LoadErrorResult';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

type RosterItem = {
  id: string;
  name: string;
  kind: 'agent' | 'assistant';
  /** 在线/启用状态点：agent 取 enabled && available，assistant 取 enabled。 */
  active: boolean;
};

/**
 * 员工名册页（一期 · 壳，聚合只读）：并发拉取 agent 后端与助手，
 * 合并为卡片网格（名称 + 类型徽标 + 状态点）。编辑入口二期再接。
 */
const RosterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState<RosterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // GET /api/agents 的真实 bridge 方法是 acpConversation.getAvailableAgents
      // （计划中的 ipcBridge.agents.list 命名空间不存在）。
      const [agents, assistants] = await Promise.all([
        ipcBridge.acpConversation.getAvailableAgents.invoke(),
        ipcBridge.assistants.list.invoke(),
      ]);
      const next: RosterItem[] = [
        ...(Array.isArray(agents) ? agents : []).map((a) => ({
          id: `agent:${a.id}`,
          name: a.name,
          kind: 'agent' as const,
          active: a.enabled && a.available,
        })),
        ...(Array.isArray(assistants) ? assistants : []).map((s) => ({
          id: `assistant:${s.id}`,
          name: s.name,
          kind: 'assistant' as const,
          active: s.enabled,
        })),
      ];
      setItems(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return (
      <div data-testid='roster-page' className='size-full bg-[var(--el-canvas)]'>
        <LoadErrorResult title={t('common.roster.loadError')} error={error} onRetry={load} />
      </div>
    );
  }

  return (
    <div data-testid='roster-page' className='size-full overflow-y-auto bg-[var(--el-canvas)]'>
      <div className='mx-auto max-w-860px px-24px py-20px flex flex-col gap-16px'>
        <div className='text-18px font-semibold text-t-primary'>{t('common.roster.title')}</div>

        {!loading && items.length === 0 && (
          <div data-testid='roster-empty' className='flex flex-col items-center gap-12px py-60px'>
            <div className='text-16px text-t-primary'>{t('common.roster.empty')}</div>
            <button
              type='button'
              onClick={() => void navigate('/models')}
              className='px-16px py-9px rd-[var(--radius-md)] bg-[rgb(var(--primary-6))] text-white text-13px cursor-pointer b-none'
            >
              {t('common.roster.emptyAction')}
            </button>
          </div>
        )}

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12px'>
          {items.map((item) => (
            <div
              key={item.id}
              className='flex items-center gap-10px px-14px py-12px rd-[var(--radius-md)] bg-[var(--el-surface)]'
            >
              <span
                aria-hidden='true'
                className={`shrink-0 w-8px h-8px rd-full ${item.active ? 'bg-[rgb(var(--success-6))]' : 'bg-fill-3'}`}
              />
              <span className='flex-1 min-w-0 truncate text-14px text-t-primary'>{item.name}</span>
              <span className='shrink-0 px-8px py-3px rd-[var(--radius-md)] bg-[var(--el-elevated)] text-12px text-t-secondary'>
                {item.kind === 'agent' ? t('common.roster.typeAgent') : t('common.roster.typeAssistant')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RosterPage;
