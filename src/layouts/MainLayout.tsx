import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, theme } from 'antd';
import type { MenuProps } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks';
import { MENU_ITEMS } from '@/constants';
import { getInitials, getFullName } from '@/utils';

const { Header, Sider, Content } = Layout;

/**
 * MainLayout Component
 * Main application layout with sidebar navigation
 */
export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Map menu items without permission filtering
  const menuItems = MENU_ITEMS.map((item) => {
    if (item.divider) {
      return { type: 'divider' as const, key: item.key };
    }

    const Icon = item.icon;
    const menuItem: {
      key: string;
      icon: React.ReactNode;
      label: string;
      onClick?: () => void;
      children?: Array<{ key: string; label: string; onClick: () => void }>;
    } = {
      key: item.key,
      icon: Icon ? <Icon size={18} /> : null,
      label: item.label,
    };

    // Handle children
    if (item.children) {
      menuItem.children = item.children.map((child) => ({
        key: child.key,
        label: child.label,
        onClick: () => navigate(child.path),
      }));
    } else {
      // Only add onClick if there are no children
      menuItem.onClick = () => navigate(item.path);
    }

    return menuItem;
  });

  // User dropdown menu
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: 'پروفایل',
      onClick: () => navigate('/settings/profile'),
    },
    {
      key: 'settings',
      icon: <Settings size={16} />,
      label: 'تنظیمات',
      onClick: () => navigate('/settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: 'خروج',
      onClick: logout,
      danger: true,
    },
  ];

  // Get current selected menu key from location
  const selectedKey = MENU_ITEMS.find((item) => {
    if (item.path === location.pathname) return true;
    if (item.children) {
      return item.children.some((child) => child.path === location.pathname);
    }
    return false;
  })?.key || '';

  return (
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="!bg-white border-l border-gray-200 !fixed !right-0 !top-0 !bottom-0 !h-screen overflow-auto"
        width={250}
        style={{ position: 'fixed', height: '100vh', right: 0, top: 0 }}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4">
          {collapsed ? (
            <img
              src="/images/metaaLearn-logo.png"
              alt="MetaaLearn"
              className="h-10 w-auto"
            />
          ) : (
            <img
              src="/images/metaaLearn-logo.png"
              alt="MetaaLearn"
              className="h-12 w-auto"
            />
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          className="border-r-0"
        />
      </Sider>
      <Layout style={{ marginRight: collapsed ? 80 : 250, transition: 'margin-right 0.2s' }}>
        <Header
          style={{ background: colorBgContainer, position: 'fixed', top: 0, right: collapsed ? 80 : 250, left: 0, zIndex: 999, transition: 'right 0.2s' }}
          className="flex items-center justify-between px-6 border-b border-gray-200 !h-16"
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <div id="breadcrumb-portal" className="flex-1 px-6 items-center flex" />

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user ? getFullName(user.firstName, user.lastName) : 'User'}
                </div>
                <div className="text-xs text-gray-500">{user?.role || 'Role'}</div>
              </div>
              <Avatar size={40} className="bg-primary-500">
                {user ? getInitials(getFullName(user.firstName, user.lastName)) : 'U'}
              </Avatar>
            </div>
          </Dropdown>
        </Header>
        <Content className="p-6 overflow-auto min-h-screen" style={{ marginTop: 64 }}>
          <div
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
            className="p-6 min-h-full"
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
