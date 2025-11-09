import React, { useEffect } from 'react';
import { Modal, Form, Select, Input } from 'antd';
import { ShieldCheck } from 'lucide-react';
import { useUpdateUserIdentity } from '@/hooks';
import { IdentityStatusType } from '@/types/user.types';

interface UserIdentityModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export const UserIdentityModal: React.FC<UserIdentityModalProps> = ({
  open,
  onClose,
  userId,
  userName,
}) => {
  const [form] = Form.useForm();
  const { updateUserIdentity, isUpdating } = useUpdateUserIdentity();

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Don't send message if status is Verified
      const payload: any = {
        actionType: values.actionType,
        userId,
      };

      if (values.actionType !== IdentityStatusType.Verified && values.message) {
        payload.message = values.message;
      }

      await updateUserIdentity(payload);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('Identity update error:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  // Watch the actionType field to determine if message is required
  const actionType = Form.useWatch('actionType', form);
  const isMessageRequired = actionType !== IdentityStatusType.Verified && actionType !== undefined;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-primary" />
          <span className="text-xl font-bold">مدیریت هویت کاربر</span>
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
            <strong>کاربر:</strong> {userName}
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          size="large"
          requiredMark={false}
          disabled={isUpdating}
        >
          {/* Status Selection */}
          <Form.Item
            name="actionType"
            label="وضعیت هویت"
            rules={[
              { required: true, message: 'لطفاً وضعیت هویت را انتخاب کنید' },
            ]}
            extra="وضعیت جدید هویت کاربر را انتخاب کنید"
          >
            <Select
              placeholder="انتخاب وضعیت"
              options={[
                {
                  label: 'بدون وضعیت (کاربر تازه ایجاد شده)',
                  value: IdentityStatusType.None,
                },
                {
                  label: 'درخواست شده',
                  value: IdentityStatusType.Requested,
                },
                {
                  label: 'در انتظار بررسی',
                  value: IdentityStatusType.Pending,
                },
                {
                  label: 'تایید شده',
                  value: IdentityStatusType.Verified,
                },
                {
                  label: 'رد شده',
                  value: IdentityStatusType.Rejected,
                },
                {
                  label: 'لغو شده',
                  value: IdentityStatusType.Revoked,
                },
              ]}
            />
          </Form.Item>

          {/* Message field - only show if not Verified */}
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
                actionType === IdentityStatusType.Verified
                  ? 'برای وضعیت تایید شده، پیام اختیاری است'
                  : 'پیام برای کاربر (در صورت رد یا لغو، دلیل را ذکر کنید)'
              }
            >
              <Input.TextArea
                rows={4}
                placeholder="پیام خود را وارد کنید..."
                disabled={actionType === IdentityStatusType.Verified}
              />
            </Form.Item>
          )}
        </Form>
      </div>
    </Modal>
  );
};
