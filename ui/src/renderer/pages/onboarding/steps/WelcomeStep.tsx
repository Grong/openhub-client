/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Button, Typography } from '@arco-design/web-react';
import { useTranslation } from 'react-i18next';

interface WelcomeStepProps {
  onNext: () => void;
  onSkip: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext, onSkip }) => {
  const { t } = useTranslation();

  return (
    <div className='flex flex-col items-center text-center gap-16px'>
      {/* Companion illustration — replace with actual companion SVG later */}
      <div className='size-120px rd-50% bg-fill-2 flex items-center justify-center'>
        <span className='text-48px'>🤖</span>
      </div>
      <Typography.Title heading={4}>
        {t('onboarding.welcome.title', { defaultValue: '欢迎来到 NomiFun' })}
      </Typography.Title>
      <Typography.Text type='secondary'>
        {t('onboarding.welcome.subtitle', {
          defaultValue: '你的 AI 工作站，一切数据留在你自己的电脑上',
        })}
      </Typography.Text>
      <div className='flex flex-col gap-8px w-full mt-8px'>
        <Button type='primary' long onClick={onNext}>
          {t('onboarding.welcome.start', { defaultValue: '开始设置' })}
        </Button>
        <Button type='text' long onClick={onSkip}>
          {t('onboarding.welcome.skip', { defaultValue: '跳过，直接使用' })}
        </Button>
      </div>
    </div>
  );
};

export default WelcomeStep;
