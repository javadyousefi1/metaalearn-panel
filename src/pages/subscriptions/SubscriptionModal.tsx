import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Switch, Select } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { courseService } from '@/services';
import {
  SubscriptionListItem,
  SubscriptionValueIdType,
  CreateSubscriptionPayload,
  UpdateSubscriptionPayload,
} from '@/types/subscription.types';

interface SubscriptionModalProps {
  open: boolean;
  subscription: SubscriptionListItem | null;
  onClose: () => void;
  onCreate: (payload: CreateSubscriptionPayload) => Promise<void>;
  onUpdate: (payload: UpdateSubscriptionPayload) => Promise<void>;
  loading: boolean;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  open,
  subscription,
  onClose,
  onCreate,
  onUpdate,
  loading,
}) => {
  const [form] = Form.useForm();
  const isEditMode = !!subscription;

  const { data: coursesData } = useQuery({
    queryKey: ['courses-for-subscription-select'],
    queryFn: () => courseService.getAll({ PageIndex: 1, PageSize: 500 }),
    enabled: open,
    select: (data) => data.items,
  });

  const courseOptions = (coursesData ?? []).map((c) => ({ value: c.id, label: c.name }));

  useEffect(() => {
    if (open && subscription) {
      form.setFieldsValue({
        name: subscription.name,
        description: subscription.description,
        price: subscription.price,
        periodDays: subscription.periodDays,
        isActive: subscription.isActive,
        valueIds: subscription.valueInfo?.courses?.map((c) => c.id) ?? [],
      });
    } else if (open) {
      form.resetFields();
      form.setFieldsValue({ isActive: true, valueIds: [] });
    }
  }, [open, subscription, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        description: values.description || null,
        price: values.price,
        periodDays: values.periodDays,
        isActive: values.isActive ?? true,
        valueIdType: SubscriptionValueIdType.Course,
        valueIds: values.valueIds ?? [],
      };

      if (isEditMode && subscription) {
        await onUpdate({ id: subscription.id, ...payload });
      } else {
        await onCreate(payload);
      }
      onClose();
    } catch {
      // validation error
    }
  };

  return (
    <Modal
      title={isEditMode ? 'ویرایش اشتراک' : 'اشتراک جدید'}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={isEditMode ? 'ذخیره تغییرات' : 'ایجاد'}
      cancelText="انصراف"
      confirmLoading={loading}
      width={600}
      centered
      destroyOnClose
    >
      <Form form={form} layout="vertical" size="large" className="pt-3">
        <Form.Item
          name="name"
          label="نام اشتراک"
          rules={[
            { required: true, message: 'نام اشتراک الزامی است' },
            { max: 256, message: 'حداکثر ۲۵۶ کاراکتر' },
          ]}
        >
          <Input placeholder="مثال: اشتراک طلایی" />
        </Form.Item>

        <Form.Item
          name="description"
          label="توضیحات"
          rules={[{ max: 4000, message: 'حداکثر ۴۰۰۰ کاراکتر' }]}
        >
          <Input.TextArea rows={3} placeholder="توضیح مختصر درباره این اشتراک..." />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item
            name="price"
            label="قیمت (تومان)"
            rules={[
              { required: true, message: 'قیمت الزامی است' },
              { type: 'number', min: 0, message: 'قیمت نمی‌تواند منفی باشد' },
            ]}
          >
            <InputNumber
              className="w-full"
              min={0}
              formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(v) => Number(v!.replace(/,/g, '')) as any}
              placeholder="۰"
            />
          </Form.Item>

          <Form.Item
            name="periodDays"
            label="مدت اعتبار (روز)"
            rules={[
              { required: true, message: 'مدت اعتبار الزامی است' },
              { type: 'number', min: 1, message: 'حداقل ۱ روز' },
            ]}
          >
            <InputNumber className="w-full" min={1} placeholder="مثال: ۳۰" />
          </Form.Item>
        </div>

        <Form.Item name="isActive" label="وضعیت" valuePropName="checked">
          <Switch checkedChildren="فعال" unCheckedChildren="غیرفعال" />
        </Form.Item>

        <Form.Item
          name="valueIds"
          label="دوره‌های شامل اشتراک"
          rules={[{ required: true, message: 'حداقل یک دوره انتخاب کنید' }]}
        >
          <Select
            mode="multiple"
            placeholder="انتخاب دوره‌ها..."
            options={courseOptions}
            showSearch
            filterOption={(input, option) =>
              String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            maxTagCount="responsive"
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
