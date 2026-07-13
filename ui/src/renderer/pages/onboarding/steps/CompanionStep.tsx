/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Button, Typography } from '@arco-design/web-react';
import { useTranslation } from 'react-i18next';

interface CompanionStepProps {
  onNext: () => void;
}

const CompanionStep: React.FC<CompanionStepProps> = ({ onNext }) => {
  const { t } = useTranslation();

  return (
    <div className='flex flex-col items-center text-center gap-16px'>
      {/* Companion avatar — simple line-art smiling circle */}
      <div className='size-120px rd-50% bg-fill-2 flex items-center justify-center border-2 border-solid border-primary-3'>
        <svg width='64' height='64' viewBox='0 0 64 64' fill='none'>
          <circle cx='32' cy='32' r='28' stroke='currentColor' strokeWidth='2' className='text-primary-6' />
          <circle cx='24' cy='28' r='3' fill='currentColor' className='text-primary-6' />
          <circle cx='40' cy='28' r='3' fill='currentColor' className='text-primary-6' />
          <path d='M24 40 Q32 48 40 40' stroke='currentColor' strokeWidth='2' strokeLinecap='round' className='text-primary-6' />
        </svg>
      </div>
      <Typography.Title heading={4}>
        {t('onboarding.companion.title', {
          defaultValue: '你好，我是 OpenHub（诺米）',
        })}
      </Typography.Title>
      <Typography.Text type='secondary'>
        {t('onboarding.companion.desc', {
          defaultValue: '我是你的 AI 伙伴，会陪你聊天、帮你干活、越用越懂你',
        })}
      </Typography.Text>
      <Button type='primary' long onClick={onNext} style={{ marginTop: 8 }}>
        {t('onboarding.companion.start', { defaultValue: '开始聊天' })}
      </Button>
    </div>
  );
};

export default CompanionStep;
