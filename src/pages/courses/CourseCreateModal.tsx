import React, { useMemo, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Switch } from 'antd';
import { useCategories, useCourses } from '@/hooks';
import { CourseType, CourseStatus, CoursePaymentType, DaysOfWeek } from '@/enums';
import { SubCategory } from '@/types';
import { Course } from '@/types/course.types';

interface CourseCreateModalProps {
  open: boolean;
  course?: Course | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FlattenedCategory {
  value: string;
  label: string;
}

export const CourseCreateModal: React.FC<CourseCreateModalProps> = ({
  open,
  course,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();

  const isEditMode = !!course;

  // Use custom hooks
  const { categories: rawCategories, isLoading: isFetchingCategories } = useCategories();
  const { createCourse, updateCourse, isCreating, isUpdating } = useCourses();

  const isLoading = isCreating || isUpdating;

  // Flatten categories using useMemo
  const flattenedCategories = useMemo((): FlattenedCategory[] => {
    const result: FlattenedCategory[] = [];

    rawCategories.forEach((item) => {
      if (item.subCategories && item.subCategories.length > 0) {
        item.subCategories.forEach((sub: SubCategory) => {
          result.push({
            value: sub.id,
            label: `${item.name} - ${sub.name}`,
          });
        });
      }
    });

    return result;
  }, [rawCategories]);

  // Populate form when editing
  useEffect(() => {
    if (open && course) {
      form.setFieldsValue({
        categoryId: course.category.id,
        name: course.name,
        type: course.type,
        status: course.status,
        paymentMethod: course.paymentMethod,
        price: course.price,
        isCertificateAvailable: course.isCertificateAvailable,
        preRequisites: course.preRequisites,
        intervalTime: course.intervalTime,
        durationTime: course.durationTime,
        daysOfWeeks: course.daysOfWeeks,
        progressPercentage: 0, // Not in Course interface, using default
        installmentCount: 0, // Not in Course interface, using default
        minimumInstallmentCount: 0, // Not in Course interface, using default
        discountPercentage: 0, // Not in Course interface, using default
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, course, form]);

  const handleSubmit = async () => {
      const values = await form.validateFields();

      if (isEditMode && course) {
        // Update existing course
        await updateCourse({
          id: course.id,
          categoryId: values.categoryId,
          name: values.name,
          type: values.type,
          status: values.status,
          paymentMethod: values.paymentMethod,
          price: values.price,
          isCertificateAvailable: values.isCertificateAvailable,
          preRequisites: values.preRequisites,
          intervalTime: values.intervalTime,
          durationTime: values.durationTime,
          daysOfWeeks: values.daysOfWeeks,
          progressPercentage: values.progressPercentage,
          installmentCount: values.installmentCount || null,
          minimumInstallmentCount: values.minimumInstallmentCount || null,
          discountPercentage: values.discountPercentage,
        });
      } else {
        // Create new course
        await createCourse({
          categoryId: values.categoryId,
          name: values.name,
          type: values.type,
          status: values.status,
          paymentMethod: values.paymentMethod,
          price: values.price || 0,
          isCertificateAvailable: values.isCertificateAvailable ?? false,
          preRequisites: values.preRequisites || '',
          intervalTime: values.intervalTime || '',
          durationTime: values.durationTime || '',
          daysOfWeeks: values.daysOfWeeks || [],
          progressPercentage: values.progressPercentage || 0,
          installmentCount: values.installmentCount || null,
          minimumInstallmentCount: values.minimumInstallmentCount || null,
          discountPercentage: values.discountPercentage || 0,
        });
      }

      form.resetFields();
      onSuccess();
      onClose();
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  // Convert enum objects to select options
  const getEnumOptions = (enumObj: Record<number, string>) => {
    return Object.entries(enumObj).map(([key, value]) => ({
      label: value,
      value: parseInt(key),
    }));
  };

  return (
    <Modal
      title={
        <span className="text-xl font-bold">
          {isEditMode ? 'ویرایش دوره' : 'ایجاد دوره جدید'}
        </span>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={isEditMode ? 'ذخیره تغییرات' : 'ایجاد دوره'}
      cancelText="انصراف"
      confirmLoading={isLoading}
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
          disabled={isLoading}
          initialValues={{
            type: 0,
            status: 0,
            paymentMethod: 0,
            isCertificateAvailable: false,
            price: 0,
            progressPercentage: 0,
            installmentCount: 0,
            minimumInstallmentCount: 0,
            discountPercentage: 0,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <Form.Item
              name="categoryId"
              label="دسته‌بندی"
              rules={[{ required: true, message: 'لطفاً دسته‌بندی را انتخاب کنید' }]}
              className="md:col-span-2"
            >
              <Select
                placeholder="انتخاب دسته‌بندی"
                options={flattenedCategories}
                loading={isFetchingCategories}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>

            {/* Name */}
            <Form.Item
              name="name"
              label="نام دوره"
              rules={[
                { required: true, message: 'لطفاً نام دوره را وارد کنید' },
                { min: 3, message: 'نام دوره باید حداقل ۳ کاراکتر باشد' },
              ]}
              className="md:col-span-2"
            >
              <Input placeholder="مثال: دوره جامع React" />
            </Form.Item>

            {/* Type */}
            <Form.Item
              name="type"
              label="نوع دوره"
              rules={[{ required: true, message: 'لطفاً نوع دوره را انتخاب کنید' }]}
            >
              <Select
                placeholder="انتخاب نوع"
                options={getEnumOptions(CourseType)}
              />
            </Form.Item>

            {/* Status */}
            <Form.Item
              name="status"
              label="وضعیت"
              rules={[{ required: true, message: 'لطفاً وضعیت را انتخاب کنید' }]}
            >
              <Select
                placeholder="انتخاب وضعیت"
                options={getEnumOptions(CourseStatus)}
              />
            </Form.Item>

            {/* Payment Method */}
            <Form.Item
              name="paymentMethod"
              label="روش پرداخت"
              rules={[{ required: true, message: 'لطفاً روش پرداخت را انتخاب کنید' }]}
            >
              <Select
                placeholder="انتخاب روش پرداخت"
                options={getEnumOptions(CoursePaymentType)}
              />
            </Form.Item>

            {/* Price */}
            <Form.Item
              name="price"
              label="قیمت (تومان)"
            >
              <InputNumber
                className="w-full"
                placeholder="0"
                min={0}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, '')) as any}
              />
            </Form.Item>

            {/* Certificate */}
            <Form.Item
              name="isCertificateAvailable"
              label="گواهینامه"
              valuePropName="checked"
            >
              <Switch checkedChildren="دارد" unCheckedChildren="ندارد" />
            </Form.Item>

            {/* Days of Week */}
            <Form.Item
              name="daysOfWeeks"
              label="روزهای برگزاری"
              className="md:col-span-2"
            >
              <Select
                mode="multiple"
                placeholder="انتخاب روزها"
                options={getEnumOptions(DaysOfWeek)}
              />
            </Form.Item>

            {/* Interval Time */}
            <Form.Item
              name="intervalTime"
              label="فاصله زمانی"
            >
              <Input placeholder="مثال: هر هفته" />
            </Form.Item>

            {/* Duration Time */}
            <Form.Item
              name="durationTime"
              label="مدت زمان"
            >
              <Input placeholder="مثال: ۳ ماه" />
            </Form.Item>

            {/* Prerequisites */}
            <Form.Item
              name="preRequisites"
              label="پیش‌نیازها"
              className="md:col-span-2"
            >
              <Input.TextArea
                rows={3}
                placeholder="پیش‌نیازهای دوره را وارد کنید"
              />
            </Form.Item>

            {/* Progress Percentage */}
            <Form.Item
              name="progressPercentage"
              label="درصد پیشرفت"
            >
              <InputNumber
                className="w-full"
                min={0}
                max={100}
                formatter={(value) => `${value}%`}
                parser={(value) => Number(value!.replace('%', '')) as any}
              />
            </Form.Item>

            {/* Installment Count */}
            <Form.Item
              name="installmentCount"
              label="تعداد اقساط"
            >
              <InputNumber
                className="w-full"
                min={0}
                placeholder="0"
              />
            </Form.Item>

            {/* Minimum Installment Count */}
            <Form.Item
              name="minimumInstallmentCount"
              label="حداقل تعداد اقساط"
            >
              <InputNumber
                className="w-full"
                min={0}
                placeholder="0"
              />
            </Form.Item>

            {/* Discount Percentage */}
            <Form.Item
              name="discountPercentage"
              label="درصد تخفیف"
            >
              <InputNumber
                className="w-full"
                min={0}
                max={100}
                formatter={(value) => `${value}%`}
                parser={(value) => Number(value!.replace('%', '')) as any}
              />
            </Form.Item>
          </div>
        </Form>
      </div>
    </Modal>
  );
};
