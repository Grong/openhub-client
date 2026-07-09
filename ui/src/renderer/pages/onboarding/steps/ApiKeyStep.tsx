/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Button, Input, Message, Select, Typography } from '@arco-design/web-react';
import { useTranslation } from 'react-i18next';

interface ApiKeyStepProps {
  onNext: () => void;
  onSkip: () => void;
}

const PROVIDER_OPTIONS = [
  { label: 'OpenAI', value: 'openai' },
  { label: 'Anthropic', value: 'anthropic' },
  { label: 'DeepSeek', value: 'deepseek' },
];

// Placeholder — integrate with the real API Key save bridge in a follow-up.
async function saveApiKey(_provider: string, _apiKey: string): Promise<void> {
  // const { ipcBridge } = await import('@common/adapter/ipcBridge');
  // await ipcBridge.settings.saveProviderApiKey.invoke({ provider, apiKey });
  return Promise.resolve();
}

const ApiKeyStep: React.FC<ApiKeyStepProps> = ({ onNext, onSkip }) => {
  const { t } = useTranslation();
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!apiKey.trim()) {
      onSkip();
      return;
    }
    setLoading(true);
    try {
      await Promise.race([
        saveApiKey(provider, apiKey),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000)),
      ]);
      onNext();
    } catch {
      Message.warning(t('onboarding.apiKey.timeout', { defaultValue: '验证超时，可稍后在设置中配置' }));
      onNext();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-center text-center gap-16px'>
      <Typography.Title heading={4}>
        {t('onboarding.apiKey.title', { defaultValue: '连接 AI 大脑' })}
      </Typography.Title>
      <div className='w-full flex flex-col gap-12px'>
        <Select
          value={provider}
          onChange={setProvider}
          options={PROVIDER_OPTIONS}
          style={{ width: '100%' }}
        />
        <Input.Password
          value={apiKey}
          onChange={setApiKey}
          placeholder={t('onboarding.apiKey.placeholder', { defaultValue: '粘贴 API Key' })}
          style={{ width: '100%' }}
        />
      </div>
      <Typography.Text type='secondary' style={{ fontSize: 12 }}>
        {t('onboarding.apiKey.hint', {
          defaultValue: '支持 26+ 服务商，以后可在设置中随时添加或切换',
        })}
      </Typography.Text>
      <div className='flex flex-col gap-8px w-full mt-8px'>
        <Button type='primary' long onClick={handleSubmit} loading={loading}>
          {t('onboarding.apiKey.next', { defaultValue: '下一步' })}
        </Button>
        <Button type='text' long onClick={onSkip}>
          {t('onboarding.apiKey.skip', { defaultValue: '跳过，稍后配置' })}
        </Button>
      </div>
    </div>
  );
};

export default ApiKeyStep;
