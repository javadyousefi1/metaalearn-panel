import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  Input,
  Slider,
  InputNumber,
  Alert,
  Avatar,
  Divider,
  Tag,
} from 'antd';
import { Award, UserCircle } from 'lucide-react';
import { useGetAllSchedules } from '@/hooks';
import {
  CertificateListItem,
  UpdateCertificatePayload,
  UpdateUserCertificateRqType,
  getCertificateStatusName,
  getCertificateStatusColor,
} from '@/types/certificate.types';

interface CertificateUpdateModalProps {
  open: boolean;
  certificate: CertificateListItem | null;
  onClose: () => void;
  onSubmit: (payload: UpdateCertificatePayload) => Promise<void>;
  loading: boolean;
}

const ACTION_OPTIONS = [
  {
    value: UpdateUserCertificateRqType.Verify,
    label: 'تایید مدرک',
    color: '#52c41a',
  },
  {
    value: UpdateUserCertificateRqType.Reject,
    label: 'رد مدرک',
    color: '#ff4d4f',
  },
  {
    value: UpdateUserCertificateRqType.Revoke,
    label: 'باطل کردن مدرک',
    color: '#fa541c',
  },
];

// Custom controlled component: Slider + InputNumber synced
const RatingInput: React.FC<{ value?: number; onChange?: (v: number) => void }> = ({
  value = 0,
  onChange,
}) => (
  <div className="flex items-center gap-3">
    <div className="flex-1">
      <Slider
        min={0}
        max={5}
        step={0.5}
        value={value}
        onChange={onChange}
        tooltip={{ formatter: (v) => `${v} از ۵` }}
      />
    </div>
    <InputNumber
      min={0}
      max={5}
      step={0.5}
      precision={1}
      value={value}
      onChange={(v) => onChange?.(v ?? 0)}
      size="small"
      style={{ width: 72 }}
    />
  </div>
);

export const CertificateUpdateModal: React.FC<CertificateUpdateModalProps> = ({
  open,
  certificate,
  onClose,
  onSubmit,
  loading,
}) => {
  const [form] = Form.useForm();
  const actionType: UpdateUserCertificateRqType = Form.useWatch('rqType', form);

  const { data: schedules, isLoading: isLoadingSchedules } = useGetAllSchedules(
    certificate ? { CourseId: certificate.course.id, PageIndex: 1, PageSize: 100 } : undefined,
    !!certificate && open,
  );

  useEffect(() => {
    if (open) {
      form.resetFields();
      form.setFieldValue('rqType', UpdateUserCertificateRqType.Verify);
    }
  }, [open, form]);

  const handleSubmit = async () => {
    if (!certificate) return;
    try {
      const values = await form.validateFields();

      const payload: UpdateCertificatePayload = {
        rqType: values.rqType,
        certificateId: certificate.id,
        message: values.message || undefined,
      };

      if (values.rqType === UpdateUserCertificateRqType.Verify && schedules?.length) {
        payload.scheduleRatings = schedules.map((s) => ({
          courseScheduleId: s.id,
          rate: values.ratings?.[s.id] ?? 0,
        }));
      }

      await onSubmit(payload);
      onClose();
    } catch {
      // validation failed - keep modal open
    }
  };

  const isDanger =
    actionType === UpdateUserCertificateRqType.Reject ||
    actionType === UpdateUserCertificateRqType.Revoke;

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Award size={20} style={{ color: '#4B26AD' }} />
          <span>بروزرسانی وضعیت مدرک</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="ثبت"
      cancelText="انصراف"
      confirmLoading={loading}
      okButtonProps={{ danger: isDanger }}
      width={600}
      centered
      destroyOnClose
    >
      {certificate && (
        <div className="space-y-4 py-2">
          {/* Certificate info */}
          <Alert
            showIcon={false}
            type="info"
            message={
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  {certificate.user.imageUrl ? (
                    <Avatar size={36} src={certificate.user.imageUrl} />
                  ) : (
                    <Avatar
                      size={36}
                      icon={<UserCircle size={20} />}
                      style={{ backgroundColor: '#4B26AD' }}
                    />
                  )}
                  <div>
                    <div className="font-medium">
                      {certificate.user.fullNameFa || 'بدون نام'}
                    </div>
                    <div className="text-xs text-gray-500">{certificate.user.phoneNumber}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {certificate.course.imageUrl && (
                    <Avatar size={28} src={certificate.course.imageUrl} shape="square" />
                  )}
                  <span className="font-medium text-sm">{certificate.course.name}</span>
                </div>
                <Tag color={getCertificateStatusColor(certificate.statusType)}>
                  {getCertificateStatusName(certificate.statusType)}
                </Tag>
              </div>
            }
          />

          <Form form={form} layout="vertical" size="large">
            {/* Action type */}
            <Form.Item
              name="rqType"
              label="نوع عملیات"
              rules={[{ required: true, message: 'نوع عملیات را انتخاب کنید' }]}
            >
              <Select
                options={ACTION_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: (
                    <span style={{ color: opt.color, fontWeight: 500 }}>{opt.label}</span>
                  ),
                }))}
                placeholder="انتخاب کنید..."
              />
            </Form.Item>

            {/* Schedule ratings — only for Verify */}
            {actionType === UpdateUserCertificateRqType.Verify && (
              <>
                <Divider orientation="right" plain style={{ marginTop: 0 }}>
                  نمرات گروه‌بندی‌ها
                </Divider>

                {isLoadingSchedules ? (
                  <div className="text-center text-gray-400 py-3 text-sm">
                    در حال دریافت گروه‌بندی‌ها...
                  </div>
                ) : !schedules?.length ? (
                  <div className="text-center text-gray-400 py-3 text-sm">
                    گروه‌بندی‌ای برای این دوره ثبت نشده است
                  </div>
                ) : (
                  <div className="rounded-lg border border-gray-100 bg-gray-50 px-5 pt-4 pb-1 mb-4">
                    {schedules.map((schedule, idx) => (
                      <React.Fragment key={schedule.id}>
                        <Form.Item
                          name={['ratings', schedule.id]}
                          label={
                            <span className="font-medium text-sm">{schedule.name}</span>
                          }
                          initialValue={0}
                        >
                          <RatingInput />
                        </Form.Item>
                        {idx < schedules.length - 1 && (
                          <Divider style={{ margin: '4px 0 12px' }} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Optional message */}
            <Form.Item name="message" label="پیام (اختیاری)">
              <Input.TextArea
                rows={3}
                placeholder="توضیحات یا دلیل..."
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>
        </div>
      )}
    </Modal>
  );
};
