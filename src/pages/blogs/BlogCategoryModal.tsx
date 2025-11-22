import React, { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';
import { useBlogCategories } from '@/hooks';
import { BlogCategory } from '@/types/blogCategory.types';

interface BlogCategoryModalProps {
  open: boolean;
  category?: BlogCategory | null;
  parentId?: string;
  onClose: () => void;
}

export const BlogCategoryModal: React.FC<BlogCategoryModalProps> = ({
  open,
  category,
  parentId,
  onClose,
}) => {
  const [form] = Form.useForm();
  const { createBlogCategory, updateBlogCategory, isCreating, isUpdating } =
    useBlogCategories();

  const isEditMode = !!category;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (open && category) {
      // For editing
      form.setFieldsValue({
        name: category.name,
        parentId: category.parentId,
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
        await updateBlogCategory({
          id: category.id,
          name: values.name,
          parentId: values.parentId || null,
        });
      } else {
        await createBlogCategory({
          name: values.name,
          parentId: parentId || null,
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

  return (
    <Modal
      title={
        <span className="text-xl font-bold">
          {isEditMode ? 'ویرایش دسته‌بندی مقاله' : 'ایجاد دسته‌بندی جدید'}
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
              placeholder="مثال: فناوری، سلامت، هنر، ..."
              className="text-lg"
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
