/**
 * @license
 * Copyright 2025-2026 OpenHub (openhub.dev)
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tooltip } from '@arco-design/web-react';
import classNames from 'classnames';
import { cleanupSiderTooltips, getSiderTooltipProps } from '@renderer/utils/ui/siderTooltip';
import { useAuth } from '@renderer/hooks/context/AuthContext';
import { useLayoutContext } from '@renderer/hooks/context/LayoutContext';
import { blurActiveElement } from '@renderer/utils/ui/focus';
import { isDesktopShell } from '@renderer/utils/platform';
import { IA_NAV_ITEMS, type IaNavItem } from './SiderNav/IaNavItems';
import { useNeedsReviewCount } from './useNeedsReviewCount';
import { SiderSectionHeader } from './SiderNav';
import SiderFooter from './SiderFooter';
import ProjectGroup from './ProjectGroup';

const SettingsSider = React.lazy(() => import('@renderer/pages/settings/components/SettingsSider'));

interface SiderProps {
  onSessionClick?: () => void;
  collapsed?: boolean;
}

/** 品牌紫角标（spec §4：品牌紫只做交互强调，待验收角标其一）。>99 显示 99+。 */
const ReviewBadge: React.FC<{ count: number }> = ({ count }) => {
  if (count <= 0) return null;
  return (
    <span className='shrink-0 min-w-18px h-16px px-5px rd-full bg-primary-6 text-white text-10px font-[600] leading-16px text-center'>
      {count > 99 ? '99+' : count}
    </span>
  );
};

const isItemActive = (item: IaNavItem, pathname: string): boolean => {
  if (item.key === 'settings') return pathname.startsWith('/settings');
  return pathname === item.path || pathname.startsWith(`${item.path}/`);
};

/**
 * Sider — the unified app-level navigation rail (new IA, spec §3).
 *
 * Top-down: brand header, IA nav (派活 / 待验收+badge / 定时任务 / 员工名册 /
 * 知识库 / 设置), projects section (ProjectGroup), bottom settings footer.
 * On settings routes the settings sub-navigation is embedded above the nav.
 */
const Sider: React.FC<SiderProps> = ({ onSessionClick, collapsed = false }) => {
  const { t } = useTranslation();
  const layout = useLayoutContext();
  const isMobile = layout?.isMobile ?? false;
  const location = useLocation();
  const { pathname, search, hash } = location;
  const { count: needsReviewCount } = useNeedsReviewCount();

  const navigate = useNavigate();
  const { logout, status } = useAuth();
  const isSettings = pathname.startsWith('/settings');

  const lastNonSettingsPathRef = useRef('/guid');
  const showLogout = !isDesktopShell() && status === 'authenticated';

  useEffect(() => {
    if (!pathname.startsWith('/settings')) {
      lastNonSettingsPathRef.current = `${pathname}${search}${hash}`;
    }
  }, [pathname, search, hash]);

  const navTo = useCallback(
    (target: string) => {
      cleanupSiderTooltips();
      blurActiveElement();
      Promise.resolve(navigate(target)).catch((error) => {
        console.error('Navigation failed:', error);
      });
      if (onSessionClick) {
        onSessionClick();
      }
    },
    [navigate, onSessionClick]
  );

  const handleSettingsClick = () => {
    cleanupSiderTooltips();
    blurActiveElement();
    if (isSettings) {
      const target = lastNonSettingsPathRef.current || '/guid';
      Promise.resolve(navigate(target)).catch((error) => {
        console.error('Navigation failed:', error);
      });
    } else {
      Promise.resolve(navigate('/settings/system')).catch((error) => {
        console.error('Navigation failed:', error);
      });
    }
    if (onSessionClick) {
      onSessionClick();
    }
  };

  const handleLogout = useCallback(async () => {
    cleanupSiderTooltips();
    blurActiveElement();
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      return;
    }
    if (onSessionClick) {
      onSessionClick();
    }
  }, [logout, onSessionClick]);

  useEffect(() => {
    if (!showLogout) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'l') {
        event.preventDefault();
        handleLogout();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleLogout, showLogout]);

  const tooltipEnabled = collapsed && !isMobile;
  const siderTooltipProps = getSiderTooltipProps(tooltipEnabled);

  const renderNavItem = (item: IaNavItem) => {
    const isActive = isItemActive(item, pathname);
    const badge = item.key === 'review' ? needsReviewCount : 0;
    const label = t(item.labelKey);

    if (collapsed) {
      return (
        <Tooltip key={item.key} {...siderTooltipProps} content={label} position='right'>
          <div
            className={classNames(
              'w-full h-34px flex items-center justify-center cursor-pointer transition-colors rd-8px text-t-primary',
              isActive ? '!bg-primary-1 !text-primary-6' : 'hover:bg-fill-2 active:bg-fill-3'
            )}
            onClick={() => navTo(item.path)}
          >
            <span className='relative block leading-none shrink-0' style={{ lineHeight: 0 }}>
              {item.icon}
              {badge > 0 && (
                <span className='absolute rounded-full bg-primary-6' style={{ width: 7, height: 7, top: -1, right: -1 }} />
              )}
            </span>
          </div>
        </Tooltip>
      );
    }

    return (
      <Tooltip key={item.key} {...siderTooltipProps} content={label} position='right'>
        <div
          className={classNames(
            'box-border group h-34px w-full flex items-center justify-start gap-8px pl-10px pr-8px rd-0.5rem cursor-pointer shrink-0 transition-all text-t-primary',
            isMobile && 'sider-action-btn-mobile',
            isActive ? '!bg-primary-1 !text-primary-6' : 'hover:bg-fill-2 active:bg-fill-3'
          )}
          onClick={() => navTo(item.path)}
        >
          <span className='size-22px flex items-center justify-center shrink-0'>{item.icon}</span>
          <span className='collapsed-hidden flex-1 min-w-0 truncate text-14px font-[500] leading-24px'>{label}</span>
          <ReviewBadge count={badge} />
        </div>
      </Tooltip>
    );
  };

  return (
    <div className='size-full flex flex-col'>
      <div className='flex-1 min-h-0 overflow-hidden'>
        <div className='size-full flex flex-col min-h-0'>
          {/* 品牌头 / Brand header */}
          {!collapsed && (
            <div className='shrink-0 px-12px h-40px flex items-center text-15px font-[600] leading-none text-t-primary select-none'>
              OpenHub
            </div>
          )}

          {/* Settings sub-navigation — only on settings routes */}
          {isSettings && (
            <div className='shrink-0 max-h-45p overflow-y-auto'>
              <Suspense fallback={<div className='size-full' />}>
                <SettingsSider collapsed={collapsed} tooltipEnabled={tooltipEnabled} />
              </Suspense>
              <div className='px-12px pt-4px pb-4px'>
                <div className='border-t border-solid border-[var(--color-border-2)]' />
              </div>
            </div>
          )}

          {/* Primary IA nav (spec §3) */}
          <div className='shrink-0 flex flex-col gap-2px'>{IA_NAV_ITEMS.map(renderNavItem)}</div>

          {/* Projects section */}
          <div className='flex-1 min-h-0 overflow-y-auto flex flex-col gap-2px'>
            <ProjectGroup
              isMobile={isMobile}
              collapsed={collapsed}
              siderTooltipProps={siderTooltipProps}
            />
          </div>
        </div>
      </div>
      {/* Bottom pinned group — Settings footer */}
      <div className='shrink-0 mt-auto pt-8px flex flex-col gap-2px border-t border-solid border-[var(--color-border-2)] border-l-0 border-r-0 border-b-0'>
        <SiderSectionHeader label={t('common.siderSection.settings')} collapsed={collapsed} collapsedRule={false} />
        <SiderFooter
          isMobile={isMobile}
          isSettings={isSettings}
          collapsed={collapsed}
          siderTooltipProps={siderTooltipProps}
          onSettingsClick={handleSettingsClick}
          showLogout={showLogout}
          onLogoutClick={handleLogout}
        />
      </div>
    </div>
  );
};

export default Sider;
