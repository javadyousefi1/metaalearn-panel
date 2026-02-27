import React, { useEffect } from 'react';
import { Modal, Form, Input, Alert } from 'antd';
import { RotateCcw } from 'lucide-react';
import type { PaymentListItem } from '@/types/payment.types';
import { formatAmount } from '@/types/payment.types';

interface RefundModalProps {
  open: boolean;
  payment: PaymentListItem | null;
  onClose: () => void;
  onRefund: (paymentId: string, refundedMessage: string) => Promise<void>;
  loading: boolean;
}

export const RefundModal: React.FC<RefundModalProps> = ({
  open,
  payment,
  onClose,
  onRefund,
  loading,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async () => {
    if (!payment) return;
    try {
      const values = await form.validateFields();
      await onRefund(payment.id, values.refundedMessage);
      onClose();
    } catch {
      // validation or API error — keep modal open
    }
  };

  if (!payment) return null;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <RotateCcw size={20} className="text-orange-500" />
          <span>استرداد وجه</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="تایید استرداد"
      cancelText="انصراف"
      confirmLoading={loading}
      okButtonProps={{ danger: true }}
      width={520}
    >
      <div className="space-y-4 py-2">
        <Alert
          message={
            <div className="space-y-1">
              <div className="font-medium">{payment.user.fullNameFa}</div>
              <div className="text-sm text-gray-600">{payment.user.phoneNumber}</div>
              <div className="text-sm">
                <span className="font-medium">مبلغ: </span>
                {formatAmount(payment.amount)}
              </div>
            </div>
          }
          type="warning"
          showIcon
        />

        <Form form={form} layout="vertical">
          <Form.Item
            name="refundedMessage"
            label="دلیل استرداد"
            rules={[
              { required: true, message: 'لطفاً دلیل استرداد را وارد کنید' },
              { min: 5, message: 'دلیل باید حداقل ۵ کاراکتر باشد' },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="دلیل استرداد وجه را شرح دهید..."
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
