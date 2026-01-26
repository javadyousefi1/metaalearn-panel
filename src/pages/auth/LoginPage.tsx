import { Card, Form, Input, Button, Segmented } from 'antd';
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
  const [usePassword, setUsePassword] = useState(false);

  // Timer countdown
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const onFinish = async (values: OtpLoginCredentials & { code?: string; password?: string }) => {
    try {
      if (!otpSent) {
        // Step 1: Password login OR send OTP
        const response = await login({
          phoneNumber: values.phoneNumber,
          password: usePassword ? values.password : undefined,
        });

        if (response?.token) {
          return;
        }

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
          {otpSent ? 'تأیید کد' : 'ورود'}
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
                <div className="mb-4">
                  <Segmented
                    block
                    value={usePassword ? 'password' : 'otp'}
                    onChange={(value) => {
                      const isPwd = value === 'password';
                      setUsePassword(isPwd);
                      if (!isPwd) {
                        form.setFieldsValue({ password: '' });
                      }
                    }}
                    options={[
                      { label: 'کد پیامکی', value: 'otp' },
                      { label: 'رمز عبور', value: 'password' },
                    ]}
                  />
                </div>

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

                {usePassword && (
                  <Form.Item
                    name="password"
                    label="رمز عبور"
                    rules={[
                      { required: true, message: 'لطفا رمز عبور را وارد کنید!' },
                    ]}
                  >
                    <Input.Password placeholder="رمز عبور را وارد کنید" />
                  </Form.Item>
                )}

                {usePassword && (
                  <div className="text-left mb-2">
                    <Link to={ROUTES.AUTH.RESET_PASSWORD} className="text-sm text-primary-600">
                      فراموشی رمز عبور
                    </Link>
                  </div>
                )}

                <Form.Item>
                  <Button type="primary" htmlType="submit" block loading={isLoading}>
                    {usePassword ? 'ورود' : 'ارسال کد'}
                  </Button>
                </Form.Item>

              </>
          ) : (
              <>
                <Form.Item
                    name="code"
                    label="کد تأیید را وارد کنید"
                    rules={[
                      { required: true, message: 'لطفاً کد تأیید را وارد کنید!' },
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
                    تأیید کد
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
