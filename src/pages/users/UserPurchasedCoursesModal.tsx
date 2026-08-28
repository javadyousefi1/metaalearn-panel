import React, { useEffect, useState } from 'react';
import { Modal, Spin, Tag, Empty, Button, Form, Input, Popconfirm, Space, Alert } from 'antd';
import { BookOpen, ShieldCheck, ShieldOff, Settings } from 'lucide-react';
import { useAuth, useGetUserPurchasedCourses, useUpdateUserInvoice } from '@/hooks';
import { isSuperAdminUser } from '@/utils';
import { UpdateUserInvoiceActionType } from '@/types/user.types';

interface UserPurchasedCoursesModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

/**
 * UserPurchasedCoursesModal Component - Display user's purchased courses in a modal
 */
export const UserPurchasedCoursesModal: React.FC<UserPurchasedCoursesModalProps> = ({
  open,
  onClose,
  userId,
  userName,
}) => {
  const { user } = useAuth();
  const superAdmin = isSuperAdminUser(user ?? null);
  const { updateUserInvoice, isUpdating } = useUpdateUserInvoice();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectForm] = Form.useForm();

  const { data: purchasedCourses = [], isLoading } = useGetUserPurchasedCourses(
    {
      UserId: userId,
      PageIndex: 1,
      PageSize: 100
    },
    open && !!userId
  );

  const selectedCourse = purchasedCourses.find((course) => course.id === selectedCourseId) ?? null;

  useEffect(() => {
    if (showRejectForm && selectedCourse?.invoice?.rejectedByAdminMessage) {
      rejectForm.setFieldValue('reason', selectedCourse.invoice.rejectedByAdminMessage);
    }
  }, [showRejectForm, selectedCourse, rejectForm]);

  const handleClose = () => {
    setSelectedCourseId(null);
    setShowRejectForm(false);
    rejectForm.resetFields();
    onClose();
  };

  const handleCloseAccessModal = () => {
    setSelectedCourseId(null);
    setShowRejectForm(false);
    rejectForm.resetFields();
  };

  const handleActivate = async () => {
    if (!selectedCourse?.invoice?.id) return;
    await updateUserInvoice({
      actionType: UpdateUserInvoiceActionType.RejectUserInvoice,
      valueId: selectedCourse.invoice.id,
      isRejectedByAdmin: false,
      rejectedByAdminMessage: '',
    });
  };

  const handleDeactivate = async () => {
    if (!selectedCourse?.invoice?.id) return;
    const values = await rejectForm.validateFields();
    await updateUserInvoice({
      actionType: UpdateUserInvoiceActionType.RejectUserInvoice,
      valueId: selectedCourse.invoice.id,
      isRejectedByAdmin: true,
      rejectedByAdminMessage: values.reason,
    });
    setShowRejectForm(false);
    rejectForm.resetFields();
  };

  const invoice = selectedCourse?.invoice;

  return (
    <>
      <Modal
        title={
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-primary" />
            <span>دوره‌های خریداری شده توسط {userName}</span>
            {!isLoading && <Tag color="blue">{purchasedCourses.length} دوره</Tag>}
          </div>
        }
        open={open}
        onCancel={handleClose}
        footer={null}
        width={800}
        className="user-purchased-courses-modal"
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Spin size="large" />
          </div>
        ) : purchasedCourses.length === 0 ? (
          <Empty
            description="این کاربر هنوز هیچ دوره‌ای خریداری نکرده است"
            className="py-8"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto py-2">
            {purchasedCourses.map((course) => (
              <div
                key={course.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-md transition-shadow"
              >
                {course.imageUrl ? (
                  <img
                    src={course.imageUrl}
                    alt={course.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded">
                    <BookOpen size={32} className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">{course.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{course.category.name}</p>
                  {course.invoice?.isRejectedByAdmin && (
                    <Tag color="red" className="mt-1 text-xs">مسدود شده</Tag>
                  )}
                </div>
                {superAdmin && course.invoice?.id && (
                  <Button
                    size="small"
                    icon={<Settings size={14} />}
                    onClick={() => {
                      setSelectedCourseId(course.id);
                      setShowRejectForm(false);
                      rejectForm.resetFields();
                    }}
                  >
                    مدیریت
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-primary" />
            <span>مدیریت دسترسی — {selectedCourse?.name}</span>
          </div>
        }
        open={!!selectedCourse}
        onCancel={handleCloseAccessModal}
        footer={null}
        width={560}
        destroyOnClose
        zIndex={1100}
      >
        {!invoice ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="فاکتور یافت نشد"
            className="py-8"
          />
        ) : (
          <div className="border rounded-xl p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-gray-700 text-sm">مدیریت دسترسی</span>
              <Tag color={invoice.isRejectedByAdmin ? 'red' : 'green'} className="text-sm">
                {invoice.isRejectedByAdmin ? 'غیرفعال توسط ادمین' : 'دسترسی فعال'}
              </Tag>
            </div>

            {invoice.isRejectedByAdmin ? (
              <div className="space-y-3">
                {invoice.rejectedByAdminMessage && (
                  <Alert
                    message={
                      <span className="text-sm">
                        دلیل غیرفعال‌سازی: <strong>{invoice.rejectedByAdminMessage}</strong>
                      </span>
                    }
                    type="error"
                    showIcon
                  />
                )}
                <Popconfirm
                  title="فعال کردن دسترسی"
                  description="آیا از فعال‌سازی دسترسی این کاربر مطمئن هستید؟"
                  onConfirm={handleActivate}
                  okText="بله، فعال کن"
                  cancelText="انصراف"
                  okButtonProps={{ loading: isUpdating }}
                >
                  <Button
                    type="primary"
                    icon={<ShieldCheck size={16} />}
                    loading={isUpdating}
                  >
                    فعال کردن دسترسی
                  </Button>
                </Popconfirm>
              </div>
            ) : (
              <div className="space-y-3">
                {!showRejectForm ? (
                  <Button
                    danger
                    icon={<ShieldOff size={16} />}
                    onClick={() => setShowRejectForm(true)}
                  >
                    مسدودسازی
                  </Button>
                ) : (
                  <Form form={rejectForm} layout="vertical" className="mt-2">
                    <Form.Item
                      name="reason"
                      label="پیام مسدودسازی"
                      rules={[
                        { required: true, message: 'لطفاً پیام را وارد کنید' },
                        { min: 5, message: 'پیام باید حداقل ۵ کاراکتر باشد' },
                      ]}
                    >
                      <Input.TextArea
                        rows={3}
                        placeholder="پیامی که به کاربر نمایش داده می‌شود..."
                        showCount
                        maxLength={500}
                      />
                    </Form.Item>
                    <Space>
                      <Button
                        type="primary"
                        danger
                        icon={<ShieldOff size={16} />}
                        onClick={handleDeactivate}
                        loading={isUpdating}
                      >
                        تایید مسدودسازی
                      </Button>
                      <Button onClick={() => { setShowRejectForm(false); rejectForm.resetFields(); }}>
                        انصراف
                      </Button>
                    </Space>
                  </Form>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};
