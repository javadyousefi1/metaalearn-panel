import React, { useState } from 'react';
import { Modal, Input, Checkbox, Button, message, Form } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { managementService } from '@/services';

interface SwapPhoneNumberModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  currentPhoneNumber: string;
}

/**
 * SwapPhoneNumberModal Component
 * Modal for swapping a user's phone number
 */
export const SwapPhoneNumberModal: React.FC<SwapPhoneNumberModalProps> = ({
  open,
  onClose,
  userId,
  userName,
  currentPhoneNumber,
}) => {
  const [form] = Form.useForm();
  const [forceExchange, setForceExchange] = useState(false);

  const { mutate: swapPhone, isPending } = useMutation({
    mutationFn: managementService.swapPhoneNumber,
    onSuccess: () => {
      message.success('شماره تلفن کاربر با موفقیت تغییر یافت');
      handleClose();
    },
    onError: (error: any) => {
      message.error(error?.response?.data?.message || 'خطا در تغییر شماره تلفن');
    },
  });

  const handleClose = () => {
    form.resetFields();
    setForceExchange(false);
    onClose();
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      swapPhone({
        userId,
        targetPhoneNumber: values.targetPhoneNumber,
        forceExchange,
      });
    });
  };

  return (
    <Modal
      title={
        <div className="text-lg font-semibold">
          تغییر شماره تلفن {userName}
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose} disabled={isPending}>
          انصراف
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={isPending}
          danger={forceExchange}
        >
          تغییر شماره
        </Button>,
      ]}
      width={480}
      centered
    >
      <div className="py-4">
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <span className="text-gray-500 text-sm">شماره فعلی: </span>
          <span className="font-medium">{currentPhoneNumber}</span>
        </div>

        <Form form={form} layout="vertical">
          <Form.Item
            name="targetPhoneNumber"
            label="شماره تلفن جدید"
            rules={[
              { required: true, message: 'شماره تلفن جدید را وارد کنید' },
              {
                pattern: /^09\d{9}$/,
                message: 'شماره تلفن باید با 09 شروع شده و ۱۱ رقم باشد',
              },
            ]}
          >
            <Input
              placeholder="09xxxxxxxxx"
              maxLength={11}
              dir="ltr"
              style={{ textAlign: 'left' }}
            />
          </Form.Item>

          <Form.Item>
            <div
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => setForceExchange(!forceExchange)}
            >
              <div>
                <span className="text-base block">اجبار در تعویض</span>
                <span className="text-gray-400 text-xs">
                  در صورت فعال بودن، شماره بدون بررسی تداخل تغییر می‌یابد
                </span>
              </div>
              <Checkbox checked={forceExchange} onChange={(e) => setForceExchange(e.target.checked)} />
            </div>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
