import React from 'react';
import { Modal, Form, Input } from 'antd';

interface CourseFaqModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (question: string, answer: string) => Promise<void>;
  loading?: boolean;
}

export const CourseFaqModal: React.FC<CourseFaqModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    const values = await form.validateFields();
    await onSubmit(values.question, values.answer);
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <span className="text-xl font-bold">
          افزودن سوال متداول جدید
        </span>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="افزودن"
      cancelText="انصراف"
      confirmLoading={loading}
      width={700}
      centered
      destroyOnClose
    >
      <div className="py-4">
        <Form
          form={form}
          layout="vertical"
          size="large"
          requiredMark={false}
          disabled={loading}
        >
          {/* Question */}
          <Form.Item
            name="question"
            label="سوال"
            rules={[
              { required: true, message: 'لطفاً سوال را وارد کنید' },
              { min: 5, message: 'سوال باید حداقل ۵ کاراکتر باشد' },
            ]}
          >
            <Input.TextArea
              rows={2}
              placeholder="سوال متداول خود را وارد کنید"
            />
          </Form.Item>

          {/* Answer */}
          <Form.Item
            name="answer"
            label="پاسخ"
            rules={[
              { required: true, message: 'لطفاً پاسخ را وارد کنید' },
              { min: 10, message: 'پاسخ باید حداقل ۱۰ کاراکتر باشد' },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="پاسخ سوال را وارد کنید"
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
