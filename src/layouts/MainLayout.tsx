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
      onClick: () => navigate(item.path),
    };

    // Handle children
    if (item.children) {
      menuItem.children = item.children.map((child) => ({
        key: child.key,
        label: child.label,
        onClick: () => navigate(child.path),
      }));
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
        className="!bg-white border-r border-gray-200"
        width={250}
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary-600">
            {collapsed ? 'ML' : 'MetaaLearn'}
          </h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          className="border-r-0"
        />
      </Sider>
      <Layout>
        <Header
          style={{ background: colorBgContainer }}
          className="flex items-center justify-between px-6 border-b border-gray-200 !h-16"
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

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
        <Content className="p-6 overflow-auto">
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
