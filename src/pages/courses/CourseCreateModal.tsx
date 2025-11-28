import React, { useMemo, useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Switch } from 'antd';
import { useCategories, useCourses, useGetCourseById } from '@/hooks';
import { CourseType, CourseStatus, CoursePaymentType, DaysOfWeek, InstallmentType, InstallmentTypeEnum } from '@/enums';
import { SubCategory } from '@/types';
import { Course, CourseInstallment } from '@/types/course.types';
import DatePicker from '@/components/datePicker/DatePicker';
import moment from 'moment-jalaali';

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

// Payment type value for installment
const INSTALLMENT_PAYMENT_TYPE = 2;

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

  // Fetch full course details when editing
  const { data: fullCourseData, isLoading: isFetchingCourse } = useGetCourseById(
    course?.id || '',
    isEditMode && open
  );

  const isLoading = isCreating || isUpdating || isFetchingCourse;

  // Watch form values for conditional rendering
  const paymentTypes = Form.useWatch('paymentTypes', form) || [];
  const installmentType = Form.useWatch('installmentType', form);
  const installmentCount = Form.useWatch('installmentCount', form) || 0;

  // Check if installment payment type is selected
  const showInstallmentSection = paymentTypes.includes(INSTALLMENT_PAYMENT_TYPE);

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
    if (open && isEditMode && fullCourseData) {
      // Use fetched course data for editing
      form.setFieldsValue({
        categoryId: fullCourseData.category?.id,
        name: fullCourseData.name,
        type: fullCourseData.type,
        status: fullCourseData.status,
        paymentTypes: fullCourseData.paymentTypes || [],
        price: fullCourseData.price,
        isCertificateAvailable: fullCourseData.isCertificateAvailable,
        isDraft: fullCourseData.isDraft ?? false,
        preRequisites: fullCourseData.preRequisites,
        intervalTime: fullCourseData.intervalTime,
        durationTime: fullCourseData.durationTime,
        daysOfWeeks: fullCourseData.daysOfWeeks,
        progressPercentage: fullCourseData.progressPercentage || 0,
        installmentType: fullCourseData.installmentType ?? InstallmentTypeEnum.Auto,
        installmentCount: fullCourseData.installmentCount || fullCourseData.installments?.length || 0,
        minimumInstallmentToPay: fullCourseData.minimumInstallmentToPay || 0,
        installmentInterval: fullCourseData.installmentInterval || 0,
        installments: fullCourseData.installments?.map(inst => ({
          ...inst,
          dueTime: inst.dueTime ? moment(inst.dueTime).format('YYYY-MM-DD') : '',
        })) || [],
        discountPercentage: fullCourseData.discountPercentage || 0,
        requiresIdentityVerification: fullCourseData.requiresIdentityVerification ?? false,
        defaultScheduleAsReserveHolder: fullCourseData.defaultScheduleAsReserveHolder ?? false,
      });
    } else if (open && !isEditMode) {
      form.resetFields();
    }
  }, [open, isEditMode, fullCourseData, form]);

  // Auto-generate installments when count changes in Custom mode
  useEffect(() => {
    if (installmentType === InstallmentTypeEnum.Custom && installmentCount > 0) {
      const currentInstallments = form.getFieldValue('installments') || [];
      const newInstallments: any[] = [];

      for (let i = 0; i < installmentCount; i++) {
        if (currentInstallments[i]) {
          newInstallments.push(currentInstallments[i]);
        } else {
          newInstallments.push({
            step: i + 1,
            amount: 0,
            dueTime: '',
          });
        }
      }

      form.setFieldValue('installments', newInstallments);
    }
  }, [installmentCount, installmentType, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();

    // Build installments array for Custom mode
    let installments: CourseInstallment[] | undefined;
    if (values.installmentType === InstallmentTypeEnum.Custom && values.installments) {
      installments = values.installments.map((inst: any) => ({
        step: inst.step,
        amount: inst.amount,
        dueTime: inst.dueTime ? moment(inst.dueTime, 'YYYY-MM-DD').toISOString() : '',
      }));
    }

    const payload = {
      categoryId: values.categoryId,
      name: values.name,
      type: values.type,
      status: values.status,
      paymentTypes: values.paymentTypes || [],
      price: values.price || 0,
      isCertificateAvailable: values.isCertificateAvailable ?? false,
      isDraft: values.isDraft ?? false,
      preRequisites: values.preRequisites || '',
      intervalTime: values.intervalTime || '',
      durationTime: values.durationTime || '',
      daysOfWeeks: values.daysOfWeeks || [],
      progressPercentage: values.progressPercentage || 0,
      installmentType: showInstallmentSection ? values.installmentType : InstallmentTypeEnum.None,
      installmentCount: values.installmentCount || null,
      minimumInstallmentToPay: values.minimumInstallmentToPay || null,
      installmentInterval: values.installmentInterval || null,
      installments,
      discountPercentage: values.discountPercentage || 0,
      requiresIdentityVerification: values.requiresIdentityVerification ?? false,
      defaultScheduleAsReserveHolder: values.defaultScheduleAsReserveHolder ?? false,
    };

    if (isEditMode && course) {
      await updateCourse({ id: course.id, ...payload });
    } else {
      await createCourse(payload);
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

  // Get installment type options without "بدون قسط" (None = 0)
  const getInstallmentTypeOptions = () => {
    return Object.entries(InstallmentType)
      .filter(([key]) => parseInt(key) !== InstallmentTypeEnum.None)
      .map(([key, value]) => ({
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
      width={900}
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
            paymentTypes: [],
            isCertificateAvailable: false,
            isDraft: false,
            price: 0,
            progressPercentage: 0,
            installmentType: InstallmentTypeEnum.Auto,
            installmentCount: 0,
            minimumInstallmentToPay: 0,
            installmentInterval: 0,
            discountPercentage: 0,
            requiresIdentityVerification: false,
            defaultScheduleAsReserveHolder: false,
            installments: [],
          }}
        >
          {/* Basic Info Section */}
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

            {/* Payment Types - Multi Select */}
            <Form.Item
              name="paymentTypes"
              label="روش‌های پرداخت"
              rules={[{ required: true, message: 'لطفاً روش پرداخت را انتخاب کنید' }]}
              className="md:col-span-2"
            >
              <Select
                mode="multiple"
                placeholder="انتخاب روش‌های پرداخت"
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

          {/* Installment Section - Only shown when قسطی is selected */}
          {showInstallmentSection && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-base font-semibold mb-4">تنظیمات اقساط</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Installment Type */}
                <Form.Item
                  name="installmentType"
                  label="نوع قسط‌بندی"
                  rules={[{ required: showInstallmentSection, message: 'نوع قسط‌بندی را انتخاب کنید' }]}
                >
                  <Select
                    placeholder="انتخاب نوع"
                    options={getInstallmentTypeOptions()}
                  />
                </Form.Item>

                {/* Minimum Installment To Pay - Always visible in installment mode */}
                <Form.Item
                  name="minimumInstallmentToPay"
                  label="حداقل پیش پرداخت"
                  rules={[{ required: true, message: 'حداقل پیش پرداخت را وارد کنید' }]}
                >
                  <InputNumber
                    className="w-full"
                    min={0}
                    placeholder="مبلغ به تومان"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, '')) as any}
                  />
                </Form.Item>

                {/* Auto Mode Fields */}
                {installmentType === InstallmentTypeEnum.Auto && (
                  <>
                    <Form.Item
                      name="installmentInterval"
                      label="فاصله اقساط (روز)"
                      rules={[{ required: true, message: 'فاصله اقساط را وارد کنید' }]}
                    >
                      <InputNumber
                        className="w-full"
                        min={1}
                        placeholder="مثال: 30"
                      />
                    </Form.Item>

                    <Form.Item
                      name="installmentCount"
                      label="تعداد اقساط"
                      rules={[{ required: true, message: 'تعداد اقساط را وارد کنید' }]}
                    >
                      <InputNumber
                        className="w-full"
                        min={1}
                        placeholder="مثال: 6"
                      />
                    </Form.Item>
                  </>
                )}

                {/* Custom Mode Fields */}
                {installmentType === InstallmentTypeEnum.Custom && (
                  <Form.Item
                    name="installmentCount"
                    label="تعداد اقساط"
                    rules={[{ required: true, message: 'تعداد اقساط را وارد کنید' }]}
                  >
                    <InputNumber
                      className="w-full"
                      min={1}
                      max={24}
                      placeholder="مثال: 6"
                    />
                  </Form.Item>
                )}
              </div>

              {/* Custom Installments List */}
              {installmentType === InstallmentTypeEnum.Custom && installmentCount > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-3">جزئیات اقساط</h4>
                  <Form.List name="installments">
                    {(fields) => (
                      <div className="space-y-3">
                        {fields.map((field, index) => (
                          <div key={field.key} className="grid grid-cols-12 gap-2 items-start bg-white p-3 rounded border">
                            <div className="col-span-2">
                              <Form.Item
                                {...field}
                                name={[field.name, 'step']}
                                label={index === 0 ? 'مرحله' : undefined}
                                className="mb-0"
                              >
                                <InputNumber className="w-full" disabled value={index + 1} />
                              </Form.Item>
                            </div>
                            <div className="col-span-5">
                              <Form.Item
                                {...field}
                                name={[field.name, 'amount']}
                                label={index === 0 ? 'مبلغ (تومان)' : undefined}
                                rules={[{ required: true, message: 'مبلغ الزامی است' }]}
                                className="mb-0"
                              >
                                <InputNumber
                                  className="w-full"
                                  min={0}
                                  placeholder="مبلغ"
                                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                  parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, '')) as any}
                                />
                              </Form.Item>
                            </div>
                            <div className="col-span-5">
                              <DatePicker
                                placeholder="انتخاب تاریخ"
                                format="jYYYY/jMM/jDD"
                                label={index === 0 ? 'تاریخ سررسید' : undefined}
                                isFormItem
                                name={[field.name, 'dueTime']}
                                isRequired
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Form.List>
                </div>
              )}
            </div>
          )}

          {/* Additional Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Certificate */}
            <Form.Item
              name="isCertificateAvailable"
              label="گواهینامه"
              valuePropName="checked"
            >
              <Switch checkedChildren="دارد" unCheckedChildren="ندارد" />
            </Form.Item>

            {/* Is Draft */}
            <Form.Item
              name="isDraft"
              label="پیش‌نویس"
              valuePropName="checked"
            >
              <Switch checkedChildren="بله" unCheckedChildren="خیر" />
            </Form.Item>

            {/* Requires Identity Verification */}
            <Form.Item
              name="requiresIdentityVerification"
              label="نیاز به احراز هویت"
              valuePropName="checked"
            >
              <Switch checkedChildren="بله" unCheckedChildren="خیر" />
            </Form.Item>

            {/* Default Schedule As Reserve Holder */}
            <Form.Item
              name="defaultScheduleAsReserveHolder"
              label="زمان‌بندی پیش‌فرض به عنوان رزرو"
              valuePropName="checked"
            >
              <Switch checkedChildren="بله" unCheckedChildren="خیر" />
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
          </div>
        </Form>
      </div>
    </Modal>
  );
};
