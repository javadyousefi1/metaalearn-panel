import { Card, Form, Input, Button, Checkbox } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/constants';
import type { LoginCredentials } from '@/types';

/**
 * LoginPage Component
 */
export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [form] = Form.useForm();

  const onFinish = async (values: LoginCredentials) => {
    try {
      await login(values);
    } catch (error) {
      // Error handled in useAuth hook
    }
  };

  return (
    <Card className="shadow-xl">
      <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
      <Form
        form={form}
        name="login"
        onFinish={onFinish}
        layout="vertical"
        size="large"
        requiredMark={false}
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="email@example.com" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Form.Item>

        <Form.Item>
          <div className="flex items-center justify-between">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <Link to={ROUTES.AUTH.FORGOT_PASSWORD} className="text-primary-600 hover:text-primary-700">
              Forgot password?
            </Link>
          </div>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={isLoading}>
            Sign In
          </Button>
        </Form.Item>

        <div className="text-center text-gray-600">
          Don't have an account?{' '}
          <Link to={ROUTES.AUTH.REGISTER} className="text-primary-600 hover:text-primary-700 font-medium">
            Sign Up
          </Link>
        </div>
      </Form>
    </Card>
  );
};
