import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, Switch } from 'antd';
import { Users } from 'lucide-react';
import { useGetUsersByRole, useGetPurchasedCourseUsers } from '@/hooks';
import { CourseScheduleStatus } from '@/enums';
import type { CourseSchedule } from '@/types';

interface CourseScheduleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  loading?: boolean;
  schedule?: CourseSchedule | null;
  courseId: string;
}

export const CourseScheduleModal: React.FC<CourseScheduleModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
  schedule,
                                                                            courseId,
}) => {
  const [form] = Form.useForm();

  // Fetch users by different roles
  const { data: instructors = [] } = useGetUsersByRole({
    role: '1',
    PageIndex: 1,
    PageSize: 1000,
    IncludeProfile: false,
    IncludeIdentity: false,
  });

  const { data: operators = [] } = useGetUsersByRole({
    role: '2',
    PageIndex: 1,
    PageSize: 1000,
    IncludeProfile: false,
    IncludeIdentity: false,
  });

  // Fetch students who purchased this course
  const { data: students = [] } = useGetPurchasedCourseUsers(
    {
      CourseId: courseId,
      PageIndex: 1,
      PageSize: 10000
    },
    !!courseId && open
  );

  // Initialize form with existing schedule data
  useEffect(() => {
    if (schedule) {
      form.setFieldsValue({
        name: schedule.name,
        description: schedule.description,
        isVisible: schedule.isVisible,
        status: schedule.status,
        typeId: schedule.typeId ?? 0,
        instructorIds: schedule.instructors?.map(i => i.id) || [],
        operatorIds: schedule.operators?.map(o => o.id) || [],
        studentIds: schedule.students?.map(s => s.id) || [],
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        isVisible: true,
        status: 0,
        typeId: 0,
        instructorIds: [],
        operatorIds: [],
        studentIds: [],
      });
    }
  }, [schedule, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
    form.resetFields();
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
        <div className="flex items-center gap-2">
          <Users size={20} className="text-primary" />
          <span className="text-xl font-bold">
            {schedule ? 'ویرایش گروه‌بندی' : 'افزودن گروه‌بندی جدید'}
          </span>
        </div>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={schedule ? 'به‌روزرسانی' : 'افزودن'}
      cancelText="انصراف"
      confirmLoading={loading}
      width={800}
      centered
      destroyOnClose
    >
      <div className="py-4 max-h-[70svh] overflow-y-auto">
        <Form
          form={form}
          layout="vertical"
          size="large"
          requiredMark={false}
          disabled={loading}
        >
          {/* Name */}
          <Form.Item
            name="name"
            label="نام گروه‌بندی"
            rules={[
              { required: true, message: 'لطفاً نام گروه‌بندی را وارد کنید' },
              { min: 3, message: 'نام باید حداقل ۳ کاراکتر باشد' },
            ]}
          >
            <Input placeholder="مثال: گروه صبح - دوشنبه و چهارشنبه" />
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
              placeholder="توضیحات کامل درباره این گروه‌بندی را وارد کنید"
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Type ID */}
            <Form.Item
              name="typeId"
              label="شناسه نوع"
              rules={[
                { required: true, message: 'لطفاً شناسه نوع را وارد کنید' },
              ]}
              className="mb-0"
            >
              <InputNumber
                className="w-full"
                placeholder="0"
                min={0}
                disabled={schedule?.typeId === 1}
              />
            </Form.Item>

            {/* IsVisible */}
            <Form.Item
              name="isVisible"
              label="قابل مشاهده"
              valuePropName="checked"
              className="mb-0"
            >
              <Switch checkedChildren="بله" unCheckedChildren="خیر" />
            </Form.Item>

            {/* Status */}
            <Form.Item
              name="status"
              label="وضعیت"
              rules={[
                { required: true, message: 'لطفاً وضعیت را انتخاب کنید' },
              ]}
              className="mb-0"
            >
              <Select
                placeholder="انتخاب وضعیت"
                options={getEnumOptions(CourseScheduleStatus)}
              />
            </Form.Item>
          </div>

          {/* Instructors */}
          <Form.Item
            name="instructorIds"
            label="اساتید"
            // rules={[
            //   { required: true, message: 'لطفاً حداقل یک استاد را انتخاب کنید' },
            // ]}
            extra={`${instructors.length} استاد در دسترس`}
          >
            <Select
              mode="multiple"
              placeholder="اساتید این گروه را انتخاب کنید"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={instructors.map(instructor => ({
                label: instructor.fullNameFa,
                value: instructor.id,
              }))}
            />
          </Form.Item>

          {/* Operators */}
          <Form.Item
            name="operatorIds"
            label="اپراتورها"
            extra={`${operators.length} اپراتور در دسترس`}
          >
            <Select
              mode="multiple"
              placeholder="اپراتورهای این گروه را انتخاب کنید"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={operators.map(operator => ({
                label: operator.fullNameFa,
                value: operator.id,
              }))}
            />
          </Form.Item>

          {/* Students */}
          <Form.Item
            name="studentIds"
            label="دانشجویان (خریداران دوره)"
            // rules={[
            //   { required: true, message: 'لطفاً حداقل یک دانشجو را انتخاب کنید' },
            // ]}
            extra={`${students.length} دانشجو در دسترس`}
          >
            <Select
              mode="multiple"
              placeholder="دانشجویان این گروه را انتخاب کنید"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={students.map(student => ({
                label: student.fullNameFa,
                value: student.id,
              }))}
            />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
