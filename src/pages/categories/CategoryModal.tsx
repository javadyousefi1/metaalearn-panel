import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Alert } from 'antd';
import { useCategories } from '@/hooks';
import { CategoryListItem, SubCategory } from '@/types';

interface CategoryModalProps {
  open: boolean;
  category?: CategoryListItem | SubCategory | null;
  parentId?: string;
  onClose: () => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  open,
  category,
  parentId,
  onClose,
}) => {
  const [form] = Form.useForm();
  const { categories, createCategory, updateCategory, isCreating, isUpdating } =
    useCategories();

  const isEditMode = !!category;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open && category) {
      // For editing
      form.setFieldsValue({
        name: category.name,
        parentId: 'parent' in category ? category.parent?.id : undefined,
      });
    } else if (open && parentId) {
      // For creating subcategory
      form.setFieldsValue({
        name: '',
        parentId: parentId,
      });
    } else if (open) {
      // For creating new parent category
      form.resetFields();
    }
  }, [open, category, parentId, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (isEditMode && category) {
        await updateCategory({
          id: category.id,
          name: values.name,
          parentId: values.parentId,
        });
      } else {
        await createCategory({
          name: values.name,
          parentId: values.parentId,
        });
      }

      form.resetFields();
      onClose();
    } catch (error) {
      // Form validation error or API error
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  // Get parent categories for selection
  const parentCategories = categories.filter((cat) => !cat.subCategories);

  // When editing, exclude the current category from parent options
  const availableParentCategories = isEditMode
    ? parentCategories.filter((cat) => cat.id !== category?.id)
    : parentCategories;

  return (
    <Modal
      title={
        <span className="text-xl font-bold">
          {isEditMode ? 'ویرایش دسته‌بندی' : 'ایجاد دسته‌بندی جدید'}
        </span>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={isEditMode ? 'ذخیره تغییرات' : 'ایجاد دسته‌بندی'}
      cancelText="انصراف"
      confirmLoading={isLoading}
      width={600}
      centered
      destroyOnClose
    >
      <div className="py-4">
        {!isEditMode && (
          <Alert
            message="راهنما"
            description="برای ایجاد دسته اصلی، فیلد دسته والد را خالی بگذارید. برای ایجاد زیردسته، یک دسته والد انتخاب کنید."
            type="info"
            showIcon
            className="mb-6"
          />
        )}

        <Form
          form={form}
          layout="vertical"
          size="large"
          requiredMark={false}
          disabled={isLoading}
        >
          <Form.Item
            name="name"
            label="نام دسته‌بندی"
            rules={[
              { required: true, message: 'لطفاً نام دسته‌بندی را وارد کنید' },
              {
                min: 2,
                message: 'نام دسته‌بندی باید حداقل ۲ کاراکتر باشد',
              },
              {
                max: 100,
                message: 'نام دسته‌بندی نباید بیشتر از ۱۰۰ کاراکتر باشد',
              },
            ]}
          >
            <Input
              placeholder="مثال: برنامه‌نویسی، زبان‌های خارجی، ..."
              className="text-lg"
            />
          </Form.Item>

          <Form.Item
            name="parentId"
            label="دسته والد (اختیاری)"
            help="برای ایجاد زیردسته، دسته والد را انتخاب کنید"
          >
            <Select
              placeholder="انتخاب دسته والد"
              allowClear
              showSearch
              optionFilterProp="children"
              disabled={!!parentId}
              options={availableParentCategories.map((cat) => ({
                label: cat.name,
                value: cat.id,
              }))}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
