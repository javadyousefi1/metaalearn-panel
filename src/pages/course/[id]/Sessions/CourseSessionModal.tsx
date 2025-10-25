import React, { useEffect } from 'react';
import { Modal, Form, Input, Switch, DatePicker } from 'antd';
import dayjs from 'dayjs';
import type { CourseSession } from '@/types/session.types';

interface CourseSessionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<CourseSession>) => Promise<void>;
  loading?: boolean;
  session?: CourseSession | null;
  parentId?: string | null;
  nextIndex?: number;
}

export const CourseSessionModal: React.FC<CourseSessionModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
  session = null,
  parentId = null,
  nextIndex = 0,
}) => {
  const [form] = Form.useForm();

  // Initialize form with session data when editing
  useEffect(() => {
    if (open && session) {
      form.setFieldsValue({
        ...session,
        occurrenceTime: session.occurrenceTime ? dayjs(session.occurrenceTime) : null,
        practiceDueTime: session.practiceDueTime ? dayjs(session.practiceDueTime) : null,
      });
    } else if (open) {
      form.setFieldsValue({
        index: nextIndex,
        isPracticeAvailable: false,
      });
    }
  }, [open, session, form, nextIndex]);

  const handleSubmit = async () => {
    const values = await form.validateFields();

    // Format dates to ISO string
    const formattedValues = {
      ...values,
      occurrenceTime: values.occurrenceTime ? values.occurrenceTime.toISOString() : '',
      practiceDueTime: values.practiceDueTime ? values.practiceDueTime.toISOString() : '',
      parentId: parentId || values.parentId || '',
      index: values.index ?? nextIndex,
    };

    await onSubmit(formattedValues);
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
          {session ? 'ویرایش جلسه' : 'افزودن جلسه جدید'}
        </span>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={session ? 'به‌روزرسانی' : 'افزودن'}
      cancelText="انصراف"
      confirmLoading={loading}
      width={800}
      centered
      destroyOnClose
    >
      <div className="py-4 max-h-[70vh] overflow-y-auto">
        <Form
          form={form}
          layout="vertical"
          size="large"
          requiredMark={false}
          disabled={loading}
        >
          {/* Session Name */}
          <Form.Item
            name="name"
            label="عنوان جلسه"
            rules={[
              { required: true, message: 'لطفاً عنوان جلسه را وارد کنید' },
              { min: 3, message: 'عنوان باید حداقل ۳ کاراکتر باشد' },
            ]}
          >
            <Input placeholder="عنوان جلسه را وارد کنید" />
          </Form.Item>

          {/* Description */}
          <Form.Item
            name="description"
            label="توضیحات"
            rules={[
              { required: true, message: 'لطفاً توضیحات را وارد کنید' },
              { min: 10, message: 'توضیحات باید حداقل ۱۰ کاراکتر باشد' },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="توضیحات جلسه را وارد کنید"
            />
          </Form.Item>

          {/* Index */}
          <Form.Item
            name="index"
            label="ترتیب نمایش"
            rules={[
              { required: true, message: 'لطفاً ترتیب نمایش را وارد کنید' },
            ]}
          >
            <Input type="number" placeholder="ترتیب نمایش" disabled />
          </Form.Item>

          {/* Occurrence Time */}
          <Form.Item
            name="occurrenceTime"
            label="زمان برگزاری"
            rules={[
              { required: true, message: 'لطفاً زمان برگزاری را انتخاب کنید' },
            ]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              placeholder="زمان برگزاری را انتخاب کنید"
              className="w-full"
            />
          </Form.Item>

          {/* Practice Due Time */}
          <Form.Item
            name="practiceDueTime"
            label="مهلت تمرین"
            rules={[
              { required: true, message: 'لطفاً مهلت تمرین را انتخاب کنید' },
            ]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              placeholder="مهلت تمرین را انتخاب کنید"
              className="w-full"
            />
          </Form.Item>

          {/* Video URL */}
          <Form.Item
            name="videoUrl"
            label="لینک ویدیو"
            rules={[
              { type: 'url', message: 'لطفاً یک آدرس معتبر وارد کنید' },
            ]}
          >
            <Input placeholder="https://example.com/video.mp4" />
          </Form.Item>

          {/* File URL */}
          <Form.Item
            name="fileUrl"
            label="لینک فایل"
            rules={[
              { type: 'url', message: 'لطفاً یک آدرس معتبر وارد کنید' },
            ]}
          >
            <Input placeholder="https://example.com/file.pdf" />
          </Form.Item>

          {/* Online Meeting URL */}
          <Form.Item
            name="onlineMeetingUrl"
            label="لینک جلسه آنلاین"
            rules={[
              { type: 'url', message: 'لطفاً یک آدرس معتبر وارد کنید' },
            ]}
          >
            <Input placeholder="https://meet.google.com/..." />
          </Form.Item>

          {/* Practice Available */}
          <Form.Item
            name="isPracticeAvailable"
            label="تمرین در دسترس است"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
