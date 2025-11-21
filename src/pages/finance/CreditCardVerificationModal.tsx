import React, { useEffect } from 'react';
import { Modal, Form, Select, Input } from 'antd';
import { CreditCard } from 'lucide-react';
import { useUpdateCreditCardIdentity } from '@/hooks';
import { CreditCardIdentityActionType, getCreditCardActionName } from '@/types/user.types';

interface CreditCardVerificationModalProps {
  open: boolean;
  onClose: () => void;
  creditCardId: string;
  cardNumber: string;
}

export const CreditCardVerificationModal: React.FC<CreditCardVerificationModalProps> = ({
  open,
  onClose,
  creditCardId,
  cardNumber,
}) => {
  const [form] = Form.useForm();
  const { updateCreditCardIdentity, isUpdating } = useUpdateCreditCardIdentity();

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Don't send message if action is Verify
      const payload: any = {
        actionType: values.actionType,
        creditCardId,
      };

      if (values.actionType !== CreditCardIdentityActionType.Verify && values.message) {
        payload.message = values.message;
      }

      await updateCreditCardIdentity(payload);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('Credit card verification error:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  // Watch the actionType field to determine if message is required
  const actionType = Form.useWatch('actionType', form);
  const isMessageRequired = actionType === CreditCardIdentityActionType.Reject;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <CreditCard size={20} className="text-primary" />
          <span className="text-xl font-bold">تایید کارت بانکی</span>
        </div>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="ذخیره"
      cancelText="انصراف"
      confirmLoading={isUpdating}
      width={600}
      centered
      destroyOnClose
    >
      <div className="py-4">
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>شماره کارت:</strong>{' '}
            <span className="font-mono" dir="ltr">
              {cardNumber ? cardNumber.replace(/(\d{4})(?=\d)/g, '$1-') : '-'}
            </span>
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          size="large"
          requiredMark={false}
          disabled={isUpdating}
        >
          {/* Action Selection */}
          <Form.Item
            name="actionType"
            label="اقدام مورد نظر"
            rules={[
              { required: true, message: 'لطفاً اقدام مورد نظر را انتخاب کنید' },
            ]}
            extra="اقدامی که می‌خواهید برای کارت بانکی انجام دهید"
          >
            <Select
              placeholder="انتخاب اقدام"
              options={[
                {
                  label: getCreditCardActionName(CreditCardIdentityActionType.Verify),
                  value: CreditCardIdentityActionType.Verify,
                },
                {
                  label: getCreditCardActionName(CreditCardIdentityActionType.Reject),
                  value: CreditCardIdentityActionType.Reject,
                },
              ]}
            />
          </Form.Item>

          {/* Message field - only show if Reject */}
          {actionType !== undefined && (
            <Form.Item
              name="message"
              label="پیام"
              rules={[
                {
                  required: isMessageRequired,
                  message: 'لطفاً پیام را وارد کنید',
                },
              ]}
              extra={
                actionType === CreditCardIdentityActionType.Verify
                  ? 'برای تایید کارت، پیام اختیاری است'
                  : 'پیام برای کاربر (در صورت رد، دلیل را ذکر کنید)'
              }
            >
              <Input.TextArea
                rows={4}
                placeholder="پیام خود را وارد کنید..."
                disabled={actionType === CreditCardIdentityActionType.Verify}
              />
            </Form.Item>
          )}
        </Form>
      </div>
    </Modal>
  );
};
