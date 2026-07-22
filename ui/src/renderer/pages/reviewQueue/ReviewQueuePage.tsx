/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import type { IRequirement } from '@/common/adapter/ipcBridge';
import LoadErrorResult from '@renderer/components/base/LoadErrorResult';
import { Message } from '@arco-design/web-react';
import { Down } from '@icon-park/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useReviewQueue } from './useReviewQueue';

const HOUR_MS = 3_600_000;

/** 等待时长：<24h 显示小时，>=24h 显示天数并标黄（等待过久）。 */
const waitingLabel = (item: IRequirement, t: (key: string, opts?: Record<string, unknown>) => string) => {
  const hours = Math.max(0, Math.floor((Date.now() - item.created_at) / HOUR_MS));
  if (hours >= 24) return { text: t('requirements.reviewQueue.waitingDays', { days: Math.floor(hours / 24) }), overdue: true };
  return { text: t('requirements.reviewQueue.waitingHours', { hours }), overdue: false };
};

/**
 * 待验收队列页（spec 11.3）：NeedsReview 需求按项目分组，
 * 行内通过/打回，页头支持全部通过。
 */
const ReviewQueuePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { groups, total, loading, error, refresh, approve, reject, approveAll } = useReviewQueue();

  const handleApprove = async (id: number) => {
    await approve(id);
    Message.success(t('requirements.reviewQueue.approveSuccess'));
  };

  const handleReject = async (id: number) => {
    await reject(id);
    Message.success(t('requirements.reviewQueue.rejectSuccess'));
  };

  const handleApproveAll = async () => {
    await approveAll();
    Message.success(t('requirements.reviewQueue.approveSuccess'));
  };

  if (error) {
    return (
      <div data-testid='review-queue-page' className='size-full bg-[var(--el-canvas)]'>
        <LoadErrorResult title={t('requirements.reviewQueue.loadError')} error={error} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div data-testid='review-queue-page' className='size-full overflow-y-auto bg-[var(--el-canvas)]'>
      <div className='mx-auto max-w-860px px-24px py-20px flex flex-col gap-16px'>
        <div className='flex items-center justify-between'>
          <div className='text-18px font-semibold text-t-primary'>{t('requirements.reviewQueue.title')}</div>
          {total > 0 && (
            <button
              type='button'
              data-testid='review-queue-batch-approve'
              disabled={loading}
              onClick={() => void handleApproveAll()}
              className='flex items-center gap-6px px-14px py-8px rd-[var(--radius-md)] bg-[rgb(var(--primary-6))] text-white text-13px cursor-pointer disabled:opacity-60 b-none'
            >
              {t('requirements.reviewQueue.batchApprove')}
              <Down theme='outline' size='14' fill='currentColor' />
            </button>
          )}
        </div>

        {!loading && total === 0 && (
          <div className='flex flex-col items-center gap-12px py-60px'>
            <div className='text-16px text-t-primary'>
              {t('requirements.reviewQueue.empty')} 🎉
            </div>
            <button
              type='button'
              onClick={() => void navigate('/guid')}
              className='px-16px py-9px rd-[var(--radius-md)] bg-[var(--el-elevated)] text-t-primary text-13px cursor-pointer b-none'
            >
              {t('requirements.reviewQueue.emptyAction')}
            </button>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.project || '__default__'} className='flex flex-col gap-8px'>
            <div className='flex items-center gap-8px text-13px text-t-secondary'>
              <span className='font-medium text-t-primary'>{group.project || t('requirements.reviewQueue.title')}</span>
              <span>{group.items.length}</span>
            </div>
            <div className='flex flex-col gap-6px'>
              {group.items.map((item) => {
                const waiting = waitingLabel(item, t);
                return (
                  <div
                    key={item.id}
                    className='flex items-center gap-12px px-14px py-10px rd-[var(--radius-md)] bg-[var(--el-surface)]'
                  >
                    <span className='flex-1 min-w-0 truncate text-14px text-t-primary'>{item.title}</span>
                    <span className={`shrink-0 text-12px ${waiting.overdue ? 'text-warning' : 'text-t-tertiary'}`}>
                      {waiting.text}
                    </span>
                    <button
                      type='button'
                      data-testid='review-queue-approve'
                      onClick={() => void handleApprove(item.id)}
                      className='shrink-0 px-12px py-6px rd-[var(--radius-md)] bg-[rgb(var(--primary-6))] text-white text-12px cursor-pointer b-none'
                    >
                      {t('requirements.reviewQueue.approve')}
                    </button>
                    <button
                      type='button'
                      data-testid='review-queue-reject'
                      onClick={() => void handleReject(item.id)}
                      className='shrink-0 px-12px py-6px rd-[var(--radius-md)] bg-[var(--el-elevated)] text-t-primary text-12px cursor-pointer b-none'
                    >
                      {t('requirements.reviewQueue.reject')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewQueuePage;
