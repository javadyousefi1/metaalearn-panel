import { Card, Form, Input, Button } from 'antd';
import { PhoneOutlined, SafetyOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { ROUTES } from '@/constants';
import { useState, useEffect } from 'react';
import type { OtpLoginCredentials } from '@/types';

/**
 * LoginPage Component with OTP
 */
export const LoginPage: React.FC = () => {
  const { login, verifyOtp, resendOtp, isLoading } = useAuth();
  const [form] = Form.useForm();
  const [otpSent, setOtpSent] = useState(false);
  const [userPhone, setUserPhone] = useState('');
  const [timer, setTimer] = useState(0);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const onFinish = async (values: OtpLoginCredentials & { code?: string }) => {
    try {
      if (!otpSent) {
        // Step 1: Send OTP
        await login({ phoneNumber: values.phoneNumber });
        setUserPhone(values.phoneNumber);
        setOtpSent(true);
        setTimer(120); // 120 seconds timer
      } else {
        // Step 2: Verify OTP
        if (values.code) {
          await verifyOtp({ phoneNumber: userPhone, code: values.code });
        }
      }
    } catch (error) {
      // Error handled in useAuth hook
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp({ phoneNumber: userPhone });
      setTimer(120); // Reset timer
    } catch (error) {
      // Error handled in useAuth hook
    }
  };

  const handleBackToLogin = () => {
    setOtpSent(false);
    setUserPhone('');
    setTimer(0);
    form.resetFields();
  };

  return (
    <Card className="shadow-xl">
      <h2 className="text-2xl font-bold text-center mb-6">
        {otpSent ? 'Verify Code' : 'Sign In'}
      </h2>

      {otpSent && (
        <div className="mb-4 p-3 bg-blue-50 rounded-md text-center">
          <p className="text-sm text-gray-600">
            Code sent to <strong>{userPhone}</strong>
          </p>
        </div>
      )}

      <Form
        form={form}
        name="login"
        onFinish={onFinish}
        layout="vertical"
        size="large"
        requiredMark={false}
      >
        {!otpSent ? (
          <>
            <Form.Item
              name="phoneNumber"
              label="Phone Number"
              rules={[
                { required: true, message: 'Please input your phone number!' },
                { pattern: /^[0-9]+$/, message: 'Please enter a valid phone number!' },
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={isLoading}>
                Send Code
              </Button>
            </Form.Item>

            <div className="text-center text-gray-600">
              Don't have an account?{' '}
              <Link to={ROUTES.AUTH.REGISTER} className="text-primary-600 hover:text-primary-700 font-medium">
                Sign Up
              </Link>
            </div>
          </>
        ) : (
          <>
            <Form.Item
              name="code"
              label="Enter Verification Code"
              rules={[
                { required: true, message: 'Please input the verification code!' },
              ]}
            >
              <Input
                prefix={<SafetyOutlined />}
                placeholder="Enter code"
                className="text-center text-2xl tracking-widest"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={isLoading}>
                Verify Code
              </Button>
            </Form.Item>

            <div className="text-center space-y-2">
              {timer > 0 ? (
                <p className="text-gray-600">
                  Resend code in <strong className="text-primary-600">{timer}s</strong>
                </p>
              ) : (
                <Button type="link" onClick={handleResendOtp} loading={isLoading}>
                  Resend Code
                </Button>
              )}

              <div>
                <Button type="link" onClick={handleBackToLogin}>
                  Back to Login
                </Button>
              </div>
            </div>
          </>
        )}
      </Form>
    </Card>
  );
};
