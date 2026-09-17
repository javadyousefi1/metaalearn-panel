import React from 'react';
import { Modal, Form, Input, Avatar, Rate, Tag } from 'antd';
import { UserCircle } from 'lucide-react';
import type { CourseComment } from '@/types/courseComment.types';

interface CourseCommentReplyModalProps {
  open: boolean;
  comment: CourseComment | null;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void>;
  loading?: boolean;
}

export const CourseCommentReplyModal: React.FC<CourseCommentReplyModalProps> = ({
  open,
  comment,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [form] = Form.useForm<{ content: string }>();

  const handleSubmit = async () => {
    const values = await form.validateFields();
    await onSubmit(values.content);
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
          پاسخ به نظر
        </span>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="ارسال پاسخ"
      cancelText="انصراف"
      confirmLoading={loading}
      width={700}
      centered
      destroyOnClose
    >
      <div className="py-4">
        {comment && (
          <div className="mb-6 rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-3">
              {comment.user.imageUrl ? (
                <Avatar size={40} src={comment.user.imageUrl} />
              ) : (
                <Avatar size={40} icon={<UserCircle />} />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{comment.user.fullNameFa}</span>
                  <Rate disabled defaultValue={comment.score} allowHalf className="text-sm" />
                </div>
                <Tag color={comment.isApproved ? 'green' : 'orange'} className="mt-1">
                  {comment.isApproved ? 'تایید شده' : 'در انتظار تایید'}
                </Tag>
              </div>
            </div>
            <p className="m-0 leading-relaxed text-gray-700">{comment.content}</p>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          size="large"
          requiredMark={false}
          disabled={loading}
        >
          <Form.Item
            name="content"
            label="پاسخ شما"
            rules={[
              { required: true, message: 'لطفاً پاسخ را وارد کنید' },
              { min: 2, message: 'پاسخ باید حداقل ۲ کاراکتر باشد' },
              { max: 1000, message: 'پاسخ نمی‌تواند از ۱۰۰۰ کاراکتر بیشتر باشد' },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="پاسخ خود را بنویسید..."
              showCount
              maxLength={1000}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
