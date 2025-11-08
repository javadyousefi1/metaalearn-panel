import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';

const { Content } = Layout;

/**
 * AuthLayout Component
 * Layout for authentication pages (login, register, etc.)
 */
export const AuthLayout: React.FC = () => {
  return (
    <Layout className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <Content className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img
              src="/images/metaaLearn-logo.png"
              alt="MetaaLearn Logo"
              className="h-20 mx-auto mb-4"
            />
            <p className="text-gray-600 text-lg font-medium">پنل مدیریت متالرن</p>
          </div>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};
