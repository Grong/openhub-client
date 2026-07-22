/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import { Button, Result } from '@arco-design/web-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

type LoadErrorResultProps = {
  /** Result 标题（如「加载失败」），由调用方按页面语境提供 */
  title: string;
  /** 原始错误文本（端点、状态码等）— 折叠进「技术详情」，不直接抛给用户 */
  error: string;
  onRetry: () => void | Promise<void>;
};

/**
 * LoadErrorResult — 统一的加载失败态：人话优先，技术细节折叠。
 * 用户默认只看到一句可操作的说明和重试按钮；原始错误收进
 * <details> 里，供排查或反馈时查看。
 */
const LoadErrorResult: React.FC<LoadErrorResultProps> = ({ title, error, onRetry }) => {
  const { t } = useTranslation();

  return (
    <Result
      status='error'
      title={title}
      subTitle={
        <div className='flex flex-col items-center gap-8px'>
          <span className='text-13px text-t-secondary'>{t('common.loadFailedHint')}</span>
          <details className='text-12px text-t-secondary max-w-520px'>
            <summary className='cursor-pointer select-none text-t-tertiary hover:text-t-secondary'>
              {t('common.technical_details')}
            </summary>
            <code className='block mt-6px p-8px rd-6px bg-fill-2 text-left break-all whitespace-pre-wrap'>{error}</code>
          </details>
        </div>
      }
      extra={<Button onClick={() => void onRetry()}>{t('common.retry')}</Button>}
    />
  );
};

export default LoadErrorResult;
