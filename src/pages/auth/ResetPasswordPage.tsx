import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button } from 'antd';
import { PhoneOutlined, SafetyOutlined, LockOutlined, EditOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { authService } from '@/services';
import { ResetPasswordRqType } from '@/types';

type Step = 'phone' | 'reset';

type PhoneStepValues = {
  phoneNumber: string;
};

type ResetStepValues = {
  code: string;
  newPassword: string;
  confirmNewPassword: string;
};

const LEFT_TIME = 120;

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('phone');
  const [userPhone, setUserPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(LEFT_TIME);
  const [phoneForm] = Form.useForm<PhoneStepValues>();
  const [resetForm] = Form.useForm<ResetStepValues>();

  useEffect(() => {
    if (step !== 'reset') return;
    if (timeLeft === 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const requestOtp = async (values: PhoneStepValues) => {
    setIsLoading(true);
    try {
      await authService.resetPasswordRequestOtp({
        rqType: ResetPasswordRqType.RqOtp,
        phoneNumber: values.phoneNumber,
      });
      setUserPhone(values.phoneNumber);
      setTimeLeft(LEFT_TIME);
      resetForm.resetFields();
      setStep('reset');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    setIsResending(true);
    try {
      await authService.resetPasswordRequestOtp({
        rqType: ResetPasswordRqType.RqOtp,
        phoneNumber: userPhone,
      });
      resetForm.resetFields(['code']);
      setTimeLeft(LEFT_TIME);
    } finally {
      setIsResending(false);
    }
  };

  const submitReset = async (values: ResetStepValues) => {
    setIsLoading(true);
    try {
      await authService.resetPassword({
        rqType: ResetPasswordRqType.Reset,
        phoneNumber: userPhone,
        code: values.code,
        newPassword: values.newPassword,
      });
      navigate(ROUTES.AUTH.LOGIN);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-xl">
      <h2 className="text-2xl font-bold text-center mb-6">
        بازیابی رمز عبور
      </h2>

      {step === 'phone' ? (
        <Form
          form={phoneForm}
          name="reset-password-request"
          onFinish={requestOtp}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          <Form.Item
            name="phoneNumber"
            label="شماره تلفن"
            rules={[
              { required: true, message: 'لطفاً شماره تلفن خود را وارد کنید!' },
              { pattern: /^[0-9]+$/, message: 'لطفاً یک شماره تلفن معتبر وارد کنید!' },
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="شماره تلفن را وارد کنید" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={isLoading}>
              ارسال کد بازیابی
            </Button>
          </Form.Item>

          <div className="text-center">
            <Link to={ROUTES.AUTH.LOGIN} className="text-sm text-primary-600">
              بازگشت به ورود
            </Link>
          </div>
        </Form>
      ) : (
        <Form
          form={resetForm}
          name="reset-password"
          onFinish={submitReset}
          layout="vertical"
          size="large"
          requiredMark={false}
        >
          <div className="mb-4 p-3 bg-primary-50 rounded-md text-center">
            <p className="text-sm text-gray-600">
              کد برای <strong>{userPhone}</strong> ارسال شد
            </p>
          </div>

          <div className="flex items-center justify-between mb-2">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                setStep('phone');
                setTimeLeft(LEFT_TIME);
                resetForm.resetFields();
              }}
            >
              ویرایش شماره همراه
            </Button>

            {timeLeft === 0 ? (
              <Button type="link" loading={isResending} onClick={resendOtp}>
                ارسال مجدد کد
              </Button>
            ) : (
              <span className="text-gray-600">
                <strong className="text-primary-600">{formatTime(timeLeft)}</strong> تا ارسال مجدد کد
              </span>
            )}
          </div>

          <Form.Item
            name="code"
            label="کد تأیید"
            rules={[
              { required: true, message: 'لطفاً کد تأیید را وارد کنید!' },
            ]}
          >
            <Input
              size="large"
              prefix={<SafetyOutlined />}
              placeholder="کد را وارد کنید"
              className="text-center text-lg tracking-widest"
              style={{ direction: 'ltr' }}
              inputMode="numeric"
              maxLength={5}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, '').slice(0, 5);
                resetForm.setFieldsValue({ code: onlyNumbers });
              }}
            />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="رمز عبور جدید"
            rules={[
              { required: true, message: 'لطفاً رمز عبور جدید را وارد کنید!' },
              { min: 8, message: 'رمز عبور باید حداقل ۸ کاراکتر باشد' },
            ]}
          >
            <Input.Password size="large" prefix={<LockOutlined />} placeholder="رمز عبور جدید" />
          </Form.Item>

          <Form.Item
            name="confirmNewPassword"
            label="تکرار رمز عبور جدید"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'لطفاً تکرار رمز عبور را وارد کنید!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('رمز عبور و تکرار آن یکسان نیستند'));
                },
              }),
            ]}
          >
            <Input.Password size="large" prefix={<LockOutlined />} placeholder="تکرار رمز عبور جدید" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={isLoading}>
              تغییر رمز عبور
            </Button>
          </Form.Item>
        </Form>
      )}
    </Card>
  );
};

