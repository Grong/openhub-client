/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card, Tag, Typography } from '@arco-design/web-react';
import { useTranslation } from 'react-i18next';

// Static recommendation list — fallback when network requests fail.
const STATIC_RECOMMENDATIONS = [
  { id: 'filesystem', name: '文件系统', desc: '读写本地文件', tags: ['内置'] },
  { id: 'web-search', name: '网页搜索', desc: '搜索互联网内容', tags: ['内置'] },
  { id: 'image-gen', name: '图片生成', desc: 'AI 生成图片', tags: ['MCP'] },
];

const PluginRecommendations: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div style={{ marginBottom: 8 }}>
      <Typography.Title heading={6}>
        {t('plugins.recommendations', { defaultValue: '推荐插件' })}
      </Typography.Title>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {STATIC_RECOMMENDATIONS.map((plugin) => (
          <Card key={plugin.id} hoverable size='small'>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Typography.Text bold>{plugin.name}</Typography.Text>
              {plugin.tags.map((tag) => (
                <Tag key={tag} size='small' color='arcoblue'>{tag}</Tag>
              ))}
            </div>
            <Typography.Text type='secondary' style={{ fontSize: 13 }}>
              {plugin.desc}
            </Typography.Text>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PluginRecommendations;
