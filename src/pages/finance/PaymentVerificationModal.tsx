import React, { useState, useEffect } from 'react';
import { Modal, Form, Radio, Input, Image, Space, Alert } from 'antd';
import { CheckCircle, XCircle, CreditCard } from 'lucide-react';
import type { PaymentListItem } from '@/types/payment.types';

interface PaymentVerificationModalProps {
  open: boolean;
  payment: PaymentListItem | null;
  onClose: () => void;
  onVerify: (paymentId: string) => Promise<void>;
  onReject: (paymentId: string, reason: string) => Promise<void>;
  loading: boolean;
}

type ActionType = 'verify' | 'reject';

export const PaymentVerificationModal: React.FC<PaymentVerificationModalProps> = ({
  open,
  payment,
  onClose,
  onVerify,
  onReject,
  loading,
}) => {
  const [form] = Form.useForm();
  const [action, setAction] = useState<ActionType>('verify');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      form.resetFields();
      setAction('verify');
    }
  }, [open, form]);

  const handleSubmit = async () => {
    if (!payment) return;

    try {
      if (action === 'verify') {
        await onVerify(payment.id);
      } else {
        const values = await form.validateFields();
        await onReject(payment.id, values.reason);
      }
      onClose();
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  if (!payment) return null;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <CreditCard size={20} className="text-primary" />
          <span>بررسی پرداخت کارت به کارت</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={action === 'verify' ? 'تایید پرداخت' : 'رد پرداخت'}
      cancelText="انصراف"
      confirmLoading={loading}
      width={600}
      okButtonProps={{
        danger: action === 'reject',
      }}
    >
      <div className="space-y-4">
        {/* User Info */}
        <Alert
          message={
            <div>
              <div className="font-medium">اطلاعات کاربر</div>
              <div className="text-sm mt-1">
                <span className="font-medium">{payment.user.fullNameFa}</span> - {payment.user.phoneNumber}
              </div>
              <div className="text-sm mt-1">
                <span className="font-medium">شماره تراکنش:</span> {payment.cardToCard?.transactionNumber || '-'}
              </div>
            </div>
          }
          type="info"
          showIcon
        />

        {/* Card to Card Image Preview */}
        {payment.cardToCard?.imageUrl && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="text-sm font-medium text-gray-700 mb-3">تصویر رسید کارت به کارت:</div>
            <div className="flex justify-center">
              <Image
                src={payment.cardToCard.imageUrl}
                alt="تصویر رسید"
                className="rounded-lg"
                style={{ maxHeight: '300px', objectFit: 'contain' }}
                preview={{
                  mask: 'مشاهده تصویر بزرگتر',
                }}
              />
            </div>
          </div>
        )}

        {/* Action Selection */}
        <Form form={form} layout="vertical">
          <Form.Item
            label="اقدام"
            required
          >
            <Radio.Group
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full"
            >
              <Space direction="vertical" className="w-full">
                <Radio value="verify" className="w-full p-3 border rounded-lg hover:border-green-400 transition-colors">
                  <Space>
                    <CheckCircle size={18} className="text-green-600" />
                    <span className="font-medium">تایید پرداخت</span>
                  </Space>
                </Radio>
                <Radio value="reject" className="w-full p-3 border rounded-lg hover:border-red-400 transition-colors">
                  <Space>
                    <XCircle size={18} className="text-red-600" />
                    <span className="font-medium">رد پرداخت</span>
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          {/* Reject Reason */}
          {action === 'reject' && (
            <Form.Item
              name="reason"
              label="دلیل رد پرداخت"
              rules={[
                { required: true, message: 'لطفاً دلیل رد پرداخت را وارد کنید' },
                { min: 5, message: 'دلیل باید حداقل ۵ کاراکتر باشد' },
              ]}
            >
              <Input.TextArea
                rows={4}
                placeholder="دلیل رد پرداخت را به طور واضح شرح دهید..."
                showCount
                maxLength={500}
              />
            </Form.Item>
          )}
        </Form>
      </div>
    </Modal>
  );
};
