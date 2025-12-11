import React, { useState } from 'react';
import { Card, Form, Input, Select, Switch, Button, Modal, Space, Row, Col } from 'antd';
import { Bell, Send, AlertCircle } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { PageHeader } from '@/components/common';
import { useNotifications, useTable, useGetAllSchedules, useGetAllUsers } from '@/hooks';
import { courseService } from '@/services';
import { Course } from '@/types/course.types';
import { NotificationType, NotificationTypeLabels, CreateNotificationPayload } from '@/types/notification.types';

/**
 * NotificationsPage Component
 * Allows sending notifications to users with course and schedule filtering
 */
export const NotificationsPage: React.FC = () => {
  const [form] = Form.useForm();
  const { createNotification, isCreating } = useNotifications();
  const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>();
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [formValues, setFormValues] = useState<CreateNotificationPayload | null>(null);

  // Fetch courses using the table hook (same pattern as CourseListPage)
  const {
    data: courses,
  } = useTable<Course>({
    queryKey: 'courses',
    fetchFn: courseService.getAll,
    initialPageSize: 1000,
    initialPageIndex: 1,
  });

  // Fetch course schedules when a course is selected
  const { data: schedules = [] } = useGetAllSchedules(
    { CourseId: selectedCourseId, PageIndex: 1, PageSize: 1000 },
    !!selectedCourseId
  );

  // Fetch all users
  const { data: usersResponse } = useGetAllUsers(
    { PageIndex: 1, PageSize: 10000, IncludeProfile: false, IncludeIdentity: false },
    true
  );

  const users = usersResponse?.items || [];

  // Handle course selection
  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    // Reset schedule selection when course changes
    form.setFieldValue('courseScheduleId', undefined);
  };

  // Handle form submission - show confirmation modal
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload: CreateNotificationPayload = {
        userIds: values.userIds || [],
        courseId: values.courseId || undefined,
        courseScheduleId: values.courseScheduleId || undefined,
        title: values.title,
        message: values.message,
        type: values.type,
        isForce: values.isForce ?? false,
      };

      setFormValues(payload);
      setConfirmModalOpen(true);
    } catch (error) {
      console.error('Form validation error:', error);
    }
  };

  // Handle confirmation and actual submission
  const handleConfirm = async () => {
    if (!formValues) return;

    try {
      await createNotification(formValues);
      setConfirmModalOpen(false);
      form.resetFields();
      setSelectedCourseId(undefined);
      setFormValues(null);
    } catch (error) {
      console.error('Notification send error:', error);
    }
  };

  // Get selected course name for confirmation modal
  const getCourseName = (courseId?: string) => {
    if (!courseId) return '-';
    return courses?.find(c => c.id === courseId)?.name || '-';
  };

  // Get selected schedule name for confirmation modal
  const getScheduleName = (scheduleId?: string) => {
    if (!scheduleId) return '-';
    return schedules?.find(s => s.id === scheduleId)?.name || '-';
  };

  // Get selected users count
  const getUsersCount = (userIds: string[]) => {
    return userIds?.length || 0;
  };

  return (
    <div>
      <PageHeader title="اعلانات" icon={<Bell size={24} />} />

      <Card>
        <Form
          form={form}
          layout="vertical"
          size="large"
          requiredMark={false}
          initialValues={{
            type: NotificationType.Financial,
            isForce: false,
          }}
        >
          <Row gutter={16}>
            {/* Course Selection */}
            <Col xs={24} md={12}>
              <Form.Item
                name="courseId"
                label="انتخاب دوره (اختیاری)"
                extra="با انتخاب دوره، می‌توانید گروه‌بندی مربوط به آن را نیز انتخاب کنید"
              >
                <Select
                  placeholder="انتخاب دوره"
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={courses?.map(course => ({
                    label: course.name,
                    value: course.id,
                  }))}
                  onChange={handleCourseChange}
                />
              </Form.Item>
            </Col>

            {/* Course Schedule Selection */}
            <Col xs={24} md={12}>
              <Form.Item
                name="courseScheduleId"
                label="انتخاب گروه‌بندی (اختیاری)"
                extra={
                  !selectedCourseId
                    ? 'ابتدا یک دوره را انتخاب کنید'
                    : `${schedules.length} گروه‌بندی در دسترس`
                }
              >
                <Select
                  placeholder={
                    selectedCourseId
                      ? 'انتخاب گروه‌بندی'
                      : 'ابتدا دوره را انتخاب کنید'
                  }
                  disabled={!selectedCourseId}
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={schedules.map(schedule => ({
                    label: schedule.name,
                    value: schedule.id,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Users Selection */}
          <Form.Item
            name="userIds"
            label="انتخاب کاربران"
            rules={[
              {
                required: !selectedCourseId,
                message: 'لطفاً حداقل یک کاربر را انتخاب کنید یا یک دوره انتخاب نمایید',
              },
            ]}
            extra={
              selectedCourseId
                ? 'با انتخاب دوره، اعلان به تمام کاربران دوره ارسال می‌شود (اختیاری)'
                : `${users.length} کاربر در دسترس`
            }
          >
            <Select
              mode="multiple"
              placeholder="جستجو و انتخاب کاربران"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={users.map(user => ({
                label: user.fullNameFa || user.mobileNumber,
                value: user.id,
              }))}
            />
          </Form.Item>

          <Row gutter={16}>
            {/* Notification Type */}
            <Col xs={24} md={12}>
              <Form.Item
                name="type"
                label="نوع اعلان"
                rules={[{ required: true, message: 'لطفاً نوع اعلان را انتخاب کنید' }]}
              >
                <Select
                  placeholder="انتخاب نوع اعلان"
                  options={Object.entries(NotificationTypeLabels).map(([value, label]) => ({
                    label,
                    value: parseInt(value),
                  }))}
                />
              </Form.Item>
            </Col>

            {/* Is Force */}
            <Col xs={24} md={12}>
              <Form.Item
                name="isForce"
                label="ارسال اجباری"
                valuePropName="checked"
                extra="اعلان به صورت اجباری به کاربران ارسال شود"
              >
                <Switch checkedChildren="بله" unCheckedChildren="خیر" />
              </Form.Item>
            </Col>
          </Row>

          {/* Title */}
          <Form.Item
            name="title"
            label="عنوان اعلان"
            rules={[
              { required: true, message: 'لطفاً عنوان اعلان را وارد کنید' },
              { min: 3, message: 'عنوان باید حداقل ۳ کاراکتر باشد' },
            ]}
          >
            <Input placeholder="عنوان اعلان را وارد کنید" />
          </Form.Item>

          {/* Message */}
          <Form.Item
            name="message"
            label="متن اعلان"
            rules={[
              { required: true, message: 'لطفاً متن اعلان را وارد کنید' },
              { min: 10, message: 'متن باید حداقل ۱۰ کاراکتر باشد' },
            ]}
          >
            <ReactQuill
              theme="snow"
              placeholder="متن اعلان را وارد کنید..."
              style={{ background: 'white' }}
            />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              size="large"
              icon={<Send size={18} />}
              onClick={handleSubmit}
              loading={isCreating}
              block
            >
              ارسال اعلان
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <AlertCircle size={20} className="text-warning" />
            <span className="text-xl font-bold">تأیید ارسال اعلان</span>
          </div>
        }
        open={confirmModalOpen}
        onOk={handleConfirm}
        onCancel={() => setConfirmModalOpen(false)}
        okText="تأیید و ارسال"
        cancelText="انصراف"
        confirmLoading={isCreating}
        width={600}
        centered
      >
        <div className="py-4">
          <p className="mb-4 text-gray-600">
            لطفاً اطلاعات اعلان را بررسی کنید و سپس تأیید نمایید:
          </p>

          <Space direction="vertical" className="w-full" size="middle">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-semibold text-gray-700">عنوان:</span>
                  <p className="text-gray-900 mt-1">{formValues?.title}</p>
                </div>

                <div>
                  <span className="font-semibold text-gray-700">نوع:</span>
                  <p className="text-gray-900 mt-1">
                    {formValues?.type !== undefined && NotificationTypeLabels[formValues.type]}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-gray-700">تعداد کاربران:</span>
                  <p className="text-gray-900 mt-1">{getUsersCount(formValues?.userIds || [])}</p>
                </div>

                <div>
                  <span className="font-semibold text-gray-700">ارسال اجباری:</span>
                  <p className="text-gray-900 mt-1">{formValues?.isForce ? 'بله' : 'خیر'}</p>
                </div>

                <div>
                  <span className="font-semibold text-gray-700">دوره:</span>
                  <p className="text-gray-900 mt-1">{getCourseName(formValues?.courseId)}</p>
                </div>

                <div>
                  <span className="font-semibold text-gray-700">گروه‌بندی:</span>
                  <p className="text-gray-900 mt-1">{getScheduleName(formValues?.courseScheduleId)}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="font-semibold text-gray-700">متن اعلان:</span>
                <div
                  className="text-gray-900 mt-2 p-3 bg-white rounded border border-gray-200"
                  dangerouslySetInnerHTML={{ __html: formValues?.message || '' }}
                />
              </div>
            </div>
          </Space>
        </div>
      </Modal>
    </div>
  );
};
