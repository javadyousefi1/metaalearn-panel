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
  const [allUsers, setAllUsers] = useState(false);

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

  // Handle allUsers toggle
  const handleAllUsersChange = (checked: boolean) => {
    setAllUsers(checked);
    if (checked) {
      // Clear all selection fields when allUsers is enabled
      form.setFieldsValue({
        courseId: undefined,
        courseScheduleId: undefined,
        userIds: undefined,
      });
      setSelectedCourseId(undefined);
    }
  };

  // Handle form submission - show confirmation modal
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload: CreateNotificationPayload = {
        userIds: allUsers ? [] : (values.userIds || []),
        courseId: allUsers ? undefined : (values.courseId || undefined),
        courseScheduleId: allUsers ? undefined : (values.courseScheduleId || undefined),
        title: values.title,
        message: values.message,
        type: values.type,
        isForce: values.isForce ?? false,
        allUsers: allUsers,
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
        const payload = {...formValues}
        // if (payload.userIds.length === 0 && payload.) {}
      await createNotification(formValues);
      setConfirmModalOpen(false);
      form.resetFields();
      setSelectedCourseId(undefined);
      setFormValues(null);
      setAllUsers(false);
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
            type: NotificationType.General,
            isForce: false,
            allUsers: false,
          }}
        >
          {/* All Users Toggle */}
          <Form.Item
            name="allUsers"
            label="ارسال به همه کاربران"
            valuePropName="checked"
            extra="با فعال‌سازی این گزینه، اعلان به تمام کاربران موجود در سایت ارسال می‌شود"
          >
            <Switch
              checkedChildren="بله"
              unCheckedChildren="خیر"
              onChange={handleAllUsersChange}
            />
          </Form.Item>

          <Row gutter={16}>
            {/* Course Selection */}
            <Col xs={24} md={12}>
              <Form.Item
                name="courseId"
                label="انتخاب دوره (اختیاری)"
                extra={
                  allUsers
                    ? 'در حالت ارسال به همه کاربران، امکان انتخاب دوره وجود ندارد'
                    : 'با انتخاب دوره، می‌توانید گروه‌بندی مربوط به آن را نیز انتخاب کنید'
                }
              >
                <Select
                  placeholder="انتخاب دوره"
                  showSearch
                  allowClear
                  disabled={allUsers}
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
                  allUsers
                    ? 'در حالت ارسال به همه کاربران، امکان انتخاب گروه‌بندی وجود ندارد'
                    : !selectedCourseId
                    ? 'ابتدا یک دوره را انتخاب کنید'
                    : `${schedules.length} گروه‌بندی در دسترس`
                }
              >
                <Select
                  placeholder={
                    allUsers
                      ? 'ارسال به همه کاربران فعال است'
                      : selectedCourseId
                      ? 'انتخاب گروه‌بندی'
                      : 'ابتدا دوره را انتخاب کنید'
                  }
                  disabled={allUsers || !selectedCourseId}
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
                required: !selectedCourseId && !allUsers,
                message: 'لطفاً حداقل یک کاربر را انتخاب کنید یا یک دوره انتخاب نمایید',
              },
            ]}
            extra={
              allUsers
                ? 'در حالت ارسال به همه کاربران، امکان انتخاب کاربر خاص وجود ندارد'
                : selectedCourseId
                ? 'با انتخاب دوره، اعلان به تمام کاربران دوره ارسال می‌شود (اختیاری)'
                : `${users.length} کاربر در دسترس`
            }
          >
            <Select
              mode="multiple"
              placeholder={
                allUsers
                  ? 'ارسال به همه کاربران فعال است'
                  : 'جستجو و انتخاب کاربران'
              }
              showSearch
              disabled={allUsers}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={users.map(user => ({
                label: `${user.fullNameFa} - ${user.phoneNumber}`,
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
                  <span className="font-semibold text-gray-700">مخاطبان:</span>
                  <p className="text-gray-900 mt-1">
                    {allUsers
                      ? 'همه کاربران موجود در سایت'
                      : formValues?.courseId
                      ? `کاربران دوره (${getCourseName(formValues.courseId)})${formValues?.courseScheduleId ? ` - گروه‌بندی: ${getScheduleName(formValues.courseScheduleId)}` : ''}`
                      : `${getUsersCount(formValues?.userIds || [])} کاربر انتخاب شده`
                    }
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-gray-700">ارسال اجباری:</span>
                  <p className="text-gray-900 mt-1">{formValues?.isForce ? 'بله' : 'خیر'}</p>
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
