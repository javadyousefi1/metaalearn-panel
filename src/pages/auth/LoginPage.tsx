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
        {otpSent ? 'تایید کد' : 'ورود'}
      </h2>

      {otpSent && (
        <div className="mb-4 p-3 bg-primary-50 rounded-md text-center">
          <p className="text-sm text-gray-600">
            کد برای <strong>{userPhone}</strong> ارسال شد
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
              label="شماره تلفن"
              rules={[
                { required: true, message: 'لطفا شماره تلفن خود را وارد کنید!' },
                { pattern: /^[0-9]+$/, message: 'لطفا یک شماره تلفن معتبر وارد کنید!' },
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="شماره تلفن را وارد کنید" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={isLoading}>
                ارسال کد
              </Button>
            </Form.Item>

            <div className="text-center text-gray-600">
              حساب کاربری ندارید؟{' '}
              <Link to={ROUTES.AUTH.REGISTER} className="text-primary-600 hover:text-primary-700 font-medium">
                ثبت نام
              </Link>
            </div>
          </>
        ) : (
          <>
            <Form.Item
              name="code"
              label="کد تایید را وارد کنید"
              rules={[
                { required: true, message: 'لطفا کد تایید را وارد کنید!' },
              ]}
            >
              <Input
                prefix={<SafetyOutlined />}
                placeholder="کد را وارد کنید"
                className="text-center text-2xl tracking-widest"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={isLoading}>
                تایید کد
              </Button>
            </Form.Item>

            <div className="text-center space-y-2">
              {timer > 0 ? (
                <p className="text-gray-600">
                  ارسال مجدد کد در <strong className="text-primary-600">{timer} ثانیه</strong>
                </p>
              ) : (
                <Button type="link" onClick={handleResendOtp} loading={isLoading}>
                  ارسال مجدد کد
                </Button>
              )}

              <div>
                <Button type="link" onClick={handleBackToLogin}>
                  بازگشت به ورود
                </Button>
              </div>
            </div>
          </>
        )}
      </Form>
    </Card>
  );
};
