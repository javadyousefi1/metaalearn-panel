import React, { useEffect } from 'react';
import { Modal, Form, Select, Input, Avatar, Tag, Image, Descriptions } from 'antd';
import { ShieldCheck, User, Calendar, Mail, Phone, CreditCard, Users } from 'lucide-react';
import { useUpdateUserIdentity } from '@/hooks';
import { IdentityStatusType, IdentityActionType, UserListItem, getIdentityStatusName, getIdentityStatusColor, getIdentityActionName } from '@/types/user.types';
import { formatDate } from '@/utils';

interface UserIdentityModalProps {
  open: boolean;
  onClose: () => void;
  user: UserListItem;
}

export const UserIdentityModal: React.FC<UserIdentityModalProps> = ({
  open,
  onClose,
  user,
}) => {
  const [form] = Form.useForm();
  const { updateUserIdentity, isUpdating } = useUpdateUserIdentity();

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Don't send message if status is Verified
      const payload: any = {
        actionType: values.actionType,
        userId: user.id,
      };

      if (values.actionType !== IdentityActionType.Verify && values.message) {
        payload.message = values.message;
      }

      await updateUserIdentity(payload);
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('Identity update error:', error);
    }
  };

  // Helper function to get gender name
  const getGenderName = (genderType: number) => {
    switch (genderType) {
      case 1:
        return 'مرد';
      case 2:
        return 'زن';
      default:
        return 'نامشخص';
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  // Watch the actionType field to determine if message is required
  const actionType = Form.useWatch('actionType', form);
  const isMessageRequired = actionType !== IdentityActionType.Verify && actionType !== undefined;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-primary" />
          <span className="text-xl font-bold">مدیریت هویت کاربر</span>
        </div>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText="تایید و ذخیره"
      cancelText="انصراف"
      confirmLoading={isUpdating}
      width={900}
      centered
      destroyOnClose
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      <div className="py-4 space-y-6 pl-6">
        {/* User Header Section */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <Avatar
            size={64}
            src={user.imageUrl}
            icon={<User />}
            className="border-2 border-white shadow-md"
          />
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800">{user.fullNameFa || 'بدون نام'}</h3>
            <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
              <Phone size={14} />
              {user.phoneNumber}
            </p>
            {user.username && (
              <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                <User size={14} />
                @{user.username}
              </p>
            )}
          </div>
          <div className="text-left">
            <Tag color={user.isActive ? 'green' : 'red'} className="mb-2">
              {user.isActive ? 'فعال' : 'غیرفعال'}
            </Tag>
            {user.identity && (
              <Tag color={getIdentityStatusColor(user.identity.statusType)}>
                {getIdentityStatusName(user.identity.statusType)}
              </Tag>
            )}
          </div>
        </div>

        {/* Profile Information */}
        {user.profile && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <CreditCard size={18} className="text-primary" />
              اطلاعات پروفایل
            </h4>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="نام (انگلیسی)">
                {user.profile.firstNameEn || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="نام خانوادگی (انگلیسی)">
                {user.profile.lastNameEn || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={
                <span className="flex items-center gap-1">
                  <Mail size={14} />
                  ایمیل
                </span>
              }>
                {user.profile.email || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="جنسیت">
                {user.profile.genderType ? getGenderName(user.profile.genderType) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label={
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  تاریخ تولد
                </span>
              }>
                {user.profile.birthDateTime ? formatDate(user.profile.birthDateTime) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="نام پدر">
                {user.profile.fatherName || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="کد ملی" span={2}>
                <span className="font-mono text-base font-semibold">{user.profile.nationalId || '-'}</span>
              </Descriptions.Item>
              {user.profile.aboutMe && (
                <Descriptions.Item label="درباره من" span={2}>
                  {user.profile.aboutMe}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}

        {/* Identity Verification Images - Most Important for Verification */}
        <div className="border-2 border-primary rounded-lg p-4 bg-purple-50">
          <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary" />
            تصاویر احراز هویت (برای تایید هویت)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Birth Certificate Image (شناسنامه) */}
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">تصویر شناسنامه</p>
              {user.profile?.nationalIdImageUrl ? (
                <Image
                  src={user.profile.nationalIdImageUrl}
                  alt="Birth Certificate"
                  className="w-full rounded-lg shadow-lg"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                  <CreditCard size={48} className="text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">تصویر شناسنامه آپلود نشده</p>
                  <p className="text-gray-400 text-xs mt-1">کاربر هنوز تصویر شناسنامه خود را بارگذاری نکرده است</p>
                </div>
              )}
            </div>

            {/* National ID Card Image (کارت ملی) */}
            <div className="bg-white p-4 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-2">تصویر کارت ملی</p>
              {user.profile?.idImageUrl ? (
                <Image
                  src={user.profile.idImageUrl}
                  alt="National ID Card"
                  className="w-full rounded-lg shadow-lg"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                  <User size={48} className="text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">تصویر کارت ملی آپلود نشده</p>
                  <p className="text-gray-400 text-xs mt-1">کاربر هنوز تصویر کارت ملی خود را بارگذاری نکرده است</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Identity Status Information */}
        {user.identity && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <ShieldCheck size={18} className="text-primary" />
              اطلاعات وضعیت هویت فعلی
            </h4>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="وضعیت فعلی">
                <Tag color={getIdentityStatusColor(user.identity.statusType)}>
                  {getIdentityStatusName(user.identity.statusType)}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="زمان درخواست">
                {user.identity.requestedTime ? formatDate(user.identity.requestedTime) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="زمان تایید">
                {user.identity.verifiedTime ? formatDate(user.identity.verifiedTime) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="تایید شده توسط">
                {user.identity.verifiedBy || '-'}
              </Descriptions.Item>
              {user.identity.message && (
                <Descriptions.Item label="پیام" span={2}>
                  <div className="bg-gray-50 p-2 rounded">{user.identity.message}</div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}

        {/* Account Information */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Users size={18} className="text-primary" />
            اطلاعات حساب کاربری
          </h4>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="کد رفرال">
              <span className="font-mono text-sm">{user.referralId || '-'}</span>
            </Descriptions.Item>
            <Descriptions.Item label="نقش‌ها">
              <div className="flex flex-wrap gap-1">
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <Tag key={role} color="blue" className="text-xs">
                      {role}
                    </Tag>
                  ))
                ) : (
                  <span>-</span>
                )}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="تاریخ ثبت نام">
              {formatDate(user.createdTime)}
            </Descriptions.Item>
            <Descriptions.Item label="آخرین بروزرسانی">
              {user.updatedTime ? formatDate(user.updatedTime) : '-'}
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-gray-300 my-6"></div>

        {/* Action Form - Update Identity Status */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-base font-bold text-gray-800 mb-4">اقدام احراز هویت</h4>
          <Form
            form={form}
            layout="vertical"
            size="large"
            requiredMark={false}
            disabled={isUpdating}
          >
            {/* Action Selection */}
            <Form.Item
              name="actionType"
              label="اقدام مورد نظر"
              rules={[
                { required: true, message: 'لطفاً اقدام مورد نظر را انتخاب کنید' },
              ]}
              extra="اقدامی که می‌خواهید برای هویت کاربر انجام دهید"
            >
              <Select
                placeholder="انتخاب اقدام"
                options={[
                  {
                    label: getIdentityActionName(IdentityActionType.Request),
                    value: IdentityActionType.Request,
                  },
                  {
                    label: getIdentityActionName(IdentityActionType.Verify),
                    value: IdentityActionType.Verify,
                  },
                  {
                    label: getIdentityActionName(IdentityActionType.Reject),
                    value: IdentityActionType.Reject,
                  },
                  {
                    label: getIdentityActionName(IdentityActionType.Revoke),
                    value: IdentityActionType.Revoke,
                  },
                ]}
              />
            </Form.Item>

            {/* Message field - only show if not Verify */}
            {actionType !== undefined && (
              <Form.Item
                name="message"
                label="پیام"
                rules={[
                  {
                    required: isMessageRequired,
                    message: 'لطفاً پیام را وارد کنید',
                  },
                ]}
                extra={
                  actionType === IdentityActionType.Verify
                    ? 'برای تایید هویت، پیام اختیاری است'
                    : 'پیام برای کاربر (در صورت رد یا لغو، دلیل را ذکر کنید)'
                }
              >
                <Input.TextArea
                  rows={4}
                  placeholder="پیام خود را وارد کنید..."
                  disabled={actionType === IdentityActionType.Verify}
                />
              </Form.Item>
            )}
          </Form>
        </div>
      </div>
    </Modal>
  );
};
