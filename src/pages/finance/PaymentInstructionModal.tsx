import React, { useEffect } from 'react';
import { Modal, Form, Input, Switch } from 'antd';
import { CreditCard } from 'lucide-react';
import { usePaymentInstructions } from '@/hooks/usePaymentInstructions';
import DatePicker from '@/components/datePicker/DatePicker';
import moment from 'moment-jalaali';
import type { PaymentInstruction } from '@/types/paymentInstruction.types';

interface PaymentInstructionModalProps {
  open: boolean;
  paymentInstruction?: PaymentInstruction | null;
  onClose: () => void;
}

export const PaymentInstructionModal: React.FC<PaymentInstructionModalProps> = ({
  open,
  paymentInstruction,
  onClose,
}) => {
  const [form] = Form.useForm();
  const {
    createPaymentInstruction,
    updatePaymentInstruction,
    isCreating,
    isUpdating,
  } = usePaymentInstructions();

  const isEditMode = !!paymentInstruction;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open && paymentInstruction) {
      // For editing
      form.setFieldsValue({
        shaba: paymentInstruction.shaba,
        cardNumber: paymentInstruction.cardNumber,
        ownerName: paymentInstruction.ownerName,
        bankName: paymentInstruction.bankName,
        cardExpireTime: paymentInstruction.cardExpireTime
          ? moment(paymentInstruction.cardExpireTime).format('jYYYY/jMM/jDD')
          : null,
        isActive: paymentInstruction.isActive ?? true,
      });
    } else if (open) {
      // For creating
      form.resetFields();
      form.setFieldsValue({
        isActive: true,
      });
    }
  }, [open, paymentInstruction, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        shaba: values.shaba,
        cardNumber: values.cardNumber,
        ownerName: values.ownerName,
        bankName: values.bankName,
        cardExpireTime: values.cardExpireTime
          ? moment(values.cardExpireTime, 'jYYYY/jMM/jDD').toISOString()
          : moment().toISOString(),
      };

      if (isEditMode && paymentInstruction) {
        await updatePaymentInstruction({
          ...payload,
          isActive: values.isActive ?? true,
          id: paymentInstruction.id,
        });
      } else {
        await createPaymentInstruction(payload);
      }

      form.resetFields();
      onClose();
    } catch (error) {
      // Form validation error or API error
      console.error('Submit error:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <CreditCard size={20} className="text-primary" />
          <span className="text-xl font-bold">
            {isEditMode ? 'ویرایش کارت' : 'افزودن کارت جدید'}
          </span>
        </div>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={isEditMode ? 'ذخیره تغییرات' : 'ایجاد کارت'}
      cancelText="انصراف"
      confirmLoading={isLoading}
      width={600}
      centered
      destroyOnClose
    >
      <div className="py-4">
        <Form
          form={form}
          layout="vertical"
          size="large"
          requiredMark={false}
          disabled={isLoading}
        >
          {/* Owner Name */}
          <Form.Item
            name="ownerName"
            label="نام صاحب کارت"
            rules={[
              { required: true, message: 'لطفاً نام صاحب کارت را وارد کنید' },
              {
                min: 3,
                message: 'نام صاحب کارت باید حداقل ۳ کاراکتر باشد',
              },
            ]}
          >
            <Input placeholder="مثال: علی احمدی" />
          </Form.Item>

          {/* Bank Name */}
          <Form.Item
            name="bankName"
            label="نام بانک"
            rules={[
              { required: true, message: 'لطفاً نام بانک را وارد کنید' },
              { min: 2, message: 'نام بانک باید حداقل ۲ کاراکتر باشد' },
            ]}
          >
            <Input placeholder="مثال: ملی، ملت، صادرات" />
          </Form.Item>

          {/* Card Number */}
          <Form.Item
            name="cardNumber"
            label="شماره کارت"
            rules={[
              { required: true, message: 'لطفاً شماره کارت را وارد کنید' },
              {
                pattern: /^[\d\s]{16,19}$/,
                message: 'شماره کارت باید ۱۶ رقم باشد',
              },
            ]}
          >
            <Input
              placeholder="۱۲۳۴ ۵۶۷۸ ۹۰۱۲ ۳۴۵۶"
              maxLength={19}
              onChange={(e) => {
                // Auto-format card number with spaces
                const value = e.target.value.replace(/\s/g, '');
                const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                form.setFieldValue('cardNumber', formatted);
              }}
            />
          </Form.Item>

          {/* SHABA Number */}
          <Form.Item
            name="shaba"
            label="شماره شبا"
            rules={[
              { required: true, message: 'لطفاً شماره شبا را وارد کنید' },
              {
                pattern: /^(IR)?[\d\s]{24,30}$/i,
                message: 'شماره شبا باید ۲۴ رقم باشد',
              },
            ]}
          >
            <Input
              placeholder="IR ۱۲۳۴ ۵۶۷۸ ۹۰۱۲ ۳۴۵۶ ۷۸۹۰ ۱۲۳۴"
              maxLength={30}
              onChange={(e) => {
                // Auto-format SHABA with spaces
                let value = e.target.value.replace(/\s/g, '');
                // Add IR prefix if not present
                if (!value.toLowerCase().startsWith('ir')) {
                  value = 'IR' + value;
                }
                // Format with spaces
                const formatted = value
                  .replace(/^IR/i, 'IR ')
                  .replace(/(\d{4})(?=\d)/g, '$1 ');
                form.setFieldValue('shaba', formatted);
              }}
            />
          </Form.Item>

          {/* Card Expire Time */}

            <DatePicker
              placeholder="انتخاب تاریخ"
              format="jYYYY/jMM/jDD"
              isFormItem
              name="cardExpireTime"
              isRequired
              label="تاریخ انقضای کارت"
              disabled={false}
              showTime={false}
            />


          {/* IsActive - Only show in edit mode */}
          {isEditMode && (
            <Form.Item
              name="isActive"
              label="وضعیت"
              valuePropName="checked"
              extra="آیا این کارت فعال باشد؟"
            >
              <Switch checkedChildren="فعال" unCheckedChildren="غیرفعال" />
            </Form.Item>
          )}
        </Form>
      </div>
    </Modal>
  );
};
