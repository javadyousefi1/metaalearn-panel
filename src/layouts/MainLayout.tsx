import { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Drawer, theme, Button, Modal } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ChevronLeft, ChevronRight, Menu as MenuIcon, X } from 'lucide-react';
import { useAuth } from '@/hooks';
import { MENU_ITEMS } from '@/constants';
import { getInitials } from '@/utils';

const { Header, Sider, Content } = Layout;

/**
 * Custom hook for detecting mobile screen
 */
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};

/**
 * MainLayout Component
 * Main application layout with sidebar navigation
 */
export const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
    console.log(user ,"user")
  // Close drawer when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  }, [location.pathname, isMobile]);

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

  // Get user full name safely
  const getUserFullName = () => {
    if (!user) return 'کاربر';
    return user.info?.fullNameFa || user.info?.username || 'کاربر';
  };

  // Get user phone number
  const getUserPhone = () => {
    if (!user) return '';
    return user.info?.phoneNumber || '';
  };

  // Handle logout with confirmation
  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setLogoutModalOpen(false);
    logout();
  };

  // Get current selected menu key from location
  const selectedKey = MENU_ITEMS.find((item) => {
    if (item.path === location.pathname) return true;
    if (item.children) {
      return item.children.some((child) => child.path === location.pathname);
    }
    return false;
  })?.key || '';

  // Menu content for desktop sidebar
  const desktopMenuContent = (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center justify-center border-b border-gray-200 px-4">
        {!collapsed && (
          <img
            src="/images/metaaLearn-logo.png"
            alt="MetaaLearn"
            className="h-10 w-auto"
          />
        )}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        className="border-r-0 flex-1"
      />
      <div className="border-t border-gray-200 p-4">
        {collapsed ? (
          <Button
            type="primary"
            danger
            icon={<LogOut size={18} />}
            onClick={handleLogout}
            block
            size="large"
            className="!px-0"
          />
        ) : (
          <Button
            type="primary"
            danger
            icon={<LogOut size={16} />}
            onClick={handleLogout}
            block
            size="large"
          >
            خروج از حساب
          </Button>
        )}
      </div>
    </div>
  );

  // Menu content for mobile drawer
  const mobileMenuContent = (
    <div className="flex flex-col h-full">
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        className="border-r-0 flex-1"
      />
      <div className="border-t border-gray-200 p-4">
        <Button
          type="primary"
          danger
          icon={<LogOut size={16} />}
          onClick={handleLogout}
          block
          size="large"
        >
          خروج از حساب
        </Button>
      </div>
    </div>
  );

  return (
    <Layout className="min-h-screen">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          className="!bg-white border-l border-gray-200 !fixed !right-0 !top-0 !bottom-0 !h-screen overflow-auto"
          width={250}
          style={{ position: 'fixed', height: '100vh', right: 0, top: 0 }}
        >
          {desktopMenuContent}
        </Sider>
      )}

      {/* Mobile Drawer */}
      <Drawer
        placement="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={280}
        styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
        closable={false}
        className="md:hidden"
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <img
            src="/images/metaaLearn-logo.png"
            alt="MetaaLearn"
            className="h-10 w-auto"
          />
          <button
            onClick={() => setDrawerOpen(false)}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {mobileMenuContent}
      </Drawer>

      {/* Logout Confirmation Modal */}
      <Modal
        title="خروج از حساب کاربری"
        open={logoutModalOpen}
        onOk={confirmLogout}
        onCancel={() => setLogoutModalOpen(false)}
        okText="بله، خروج"
        cancelText="انصراف"
        okButtonProps={{ danger: true }}
      >
        <p>آیا از خروج از حساب کاربری خود اطمینان دارید؟</p>
      </Modal>

      <Layout
        style={{
          marginRight: isMobile ? 0 : (collapsed ? 80 : 250),
          transition: 'margin-right 0.2s'
        }}
      >
        <Header
          style={{
            background: colorBgContainer,
            position: 'fixed',
            top: 0,
            right: isMobile ? 0 : (collapsed ? 80 : 250),
            left: 0,
            zIndex: 999,
            transition: 'right 0.2s'
          }}
          className="flex items-center justify-between px-3 md:px-6 border-b border-gray-200 !h-16"
        >
          {/* Mobile menu button */}
          {isMobile ? (
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <MenuIcon size={20} />
            </button>
          ) : (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          )}

          <div id="breadcrumb-portal" className="flex-1 px-2 md:px-6 items-center flex hidden md:flex" />

          <div className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-900">
                {getUserFullName()}
              </div>
              <div className="text-xs text-gray-500">{getUserPhone()}</div>
            </div>
            <Avatar size={36} className="bg-primary-500">
              {getInitials(getUserFullName())}
            </Avatar>
          </div>
        </Header>
        <Content
          className="p-3 md:p-6 overflow-x-hidden"
          style={{ marginTop: 64, minHeight: "calc(100svh - 64px)" }}
        >
          <div
            style={{
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
            className="p-3 md:p-6 min-h-full overflow-x-auto"
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
