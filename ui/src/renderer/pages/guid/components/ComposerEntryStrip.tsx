/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import { EveryUser, Robot } from '@icon-park/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from '../index.module.css';

export type GuidActiveSkill = {
  name: string;
  description?: string;
  isAuto?: boolean;
};

export interface ComposerEntryStripProps {
  isPresetAgent: boolean;
  assistantLabel?: string;
  assistantAvatar?: { kind: 'image' | 'emoji' | 'icon'; value?: string };
  onFree: () => void;
  /** 「agent 集群」toggle 是否选中。选中时在 composer 顶部显示状态 chip。 */
  clusterActive?: boolean;
  /** 关闭「agent 集群」chip 时调用。 */
  onToggleCluster?: () => void;
}

/**
 * ComposerEntryStrip — composer 顶部的「激活状态」展示区。
 *
 * 做减法后的定位：配置入口（召唤助手 / 使用 Skills / agent 集群开关）都收进
 * 操作区 [+] 菜单，这里只显示「当前已激活」的状态 token——召唤的助手人格、
 * 打开的 agent 集群——让用户一眼看到会话处于什么模式，并可一键退出。
 * 没有激活状态时整体不渲染，composer 保持干净。
 */
const ComposerEntryStrip: React.FC<ComposerEntryStripProps> = ({
  isPresetAgent,
  assistantLabel,
  assistantAvatar,
  onFree,
  clusterActive = false,
  onToggleCluster,
}) => {
  const { t } = useTranslation();

  // --- Avatar renderer (mirrors GuidPage selectedAssistantAvatar pattern) ---
  const renderAvatar = () => {
    if (!assistantAvatar) return <Robot theme='outline' size={16} fill='currentColor' />;
    switch (assistantAvatar.kind) {
      case 'image':
        return (
          <img
            src={assistantAvatar.value}
            alt=''
            className='w-20px h-20px rounded-6px object-contain'
          />
        );
      case 'emoji':
        return <span className='text-14px leading-none'>{assistantAvatar.value}</span>;
      case 'icon':
      default:
        return <Robot theme='outline' size={16} fill='currentColor' />;
    }
  };

  if (!isPresetAgent && !clusterActive) return null;

  return (
    <div className={styles.entryStrip}>
      {/* agent 集群激活态 chip */}
      {clusterActive && (
        <span className={`${styles.entryButton} ${styles.entryButtonActive}`}>
          <EveryUser theme='outline' size={15} strokeWidth={3} />
          <span className={styles.entryButtonText}>{t('guid.entry.cluster', { defaultValue: 'agent 集群' })}</span>
          {onToggleCluster && (
            <button
              type='button'
              className={styles.entryDismiss}
              onClick={onToggleCluster}
              aria-label={t('guid.entry.clusterOffAria', { defaultValue: '关闭 agent 集群模式' })}
            >
              ✕
            </button>
          )}
        </span>
      )}

      {/* 召唤的助手人格 token */}
      {isPresetAgent && (
        <>
          <span className={`${styles.entryButton} ${styles.entryButtonActive} ${styles.entryPersonaButton}`}>
            <span className={styles.entryAvatar}>
              {renderAvatar()}
            </span>
            <span className={styles.entryButtonText}>{assistantLabel || t('guid.entry.summon', { defaultValue: '召唤助手' })}</span>
            <button
              type='button'
              className={styles.entryDismiss}
              onClick={onFree}
              aria-label={t('guid.entry.backToFree', { defaultValue: '自由发挥' })}
            >
              ✕
            </button>
          </span>

          {/* Right: back to free */}
          <button
            type='button'
            className={styles.entryBackButton}
            onClick={onFree}
          >
            <span>↩</span>
            <span>{t('guid.entry.backToFree', { defaultValue: '自由发挥' })}</span>
          </button>
        </>
      )}
    </div>
  );
};

export default ComposerEntryStrip;
