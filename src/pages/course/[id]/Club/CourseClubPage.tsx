import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Empty,
  Form,
  Input,
  Select,
  Spin,
  Switch,
  Tooltip,
  Upload,
  message,
} from 'antd';
import { CalendarDays, ImagePlus, Link2, Plus, RotateCcw, Save, Trash2, User, Users } from 'lucide-react';
import moment from 'moment-jalaali';
import { useCourses, useGetCourseById } from '@/hooks';
import { courseService } from '@/services';
import { queryKeys } from '@/config';
import { ClubDayOfWeekLabels } from '@/enums';
import JalaliAntdDatePicker from '@/components/datePicker/JalaliAntdDatePicker';
import type { CourseClubRs, CourseClubUpsertRq } from '@/types/courseClub.types';
import { ClubIconPicker } from './ClubIconPicker';
import { ClubTimeRangeInput } from './ClubTimeRangeInput';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

interface ScheduleLineFormValue {
  svg?: string;
  dayOfWeek?: number;
  timeRange?: string;
}

interface GuestFormValue {
  /** Server id; empty for guests that are not saved yet */
  id?: string;
  fullName?: string;
  description?: string | null;
  /** ISO date */
  time?: string | null;
  /** Display only, changed through the upload endpoint */
  imageUrl?: string | null;
}

interface ClubFormValues {
  linkUrl?: string | null;
  scheduleLines: ScheduleLineFormValue[];
  guests: GuestFormValue[];
}

const toFormValues = (club?: CourseClubRs | null): ClubFormValues => ({
  linkUrl: club?.linkUrl ?? '',
  scheduleLines: (club?.scheduleLines ?? []).map((line) => ({
    svg: line.svg,
    dayOfWeek: line.dayOfWeek,
    timeRange: line.timeRange,
  })),
  guests: (club?.guests ?? []).map((guest) => ({
    id: guest.id,
    fullName: guest.fullName,
    description: guest.description ?? '',
    time: guest.time,
    imageUrl: guest.imageUrl,
  })),
});

const toPayload = (values: ClubFormValues): CourseClubUpsertRq => ({
  scheduleLines: (values.scheduleLines ?? []).map((line) => ({
    svg: line.svg ?? '',
    dayOfWeek: line.dayOfWeek ?? 0,
    timeRange: (line.timeRange ?? '').trim(),
  })),
  guests: (values.guests ?? []).map((guest) => ({
    ...(guest.id ? { id: guest.id } : {}),
    fullName: (guest.fullName ?? '').trim(),
    description: guest.description?.trim() || null,
    time: guest.time || null,
  })),
  linkUrl: values.linkUrl?.trim() || null,
});

export const CourseClubPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [form] = Form.useForm<ClubFormValues>();
  const guests = (Form.useWatch('guests', form) ?? []) as GuestFormValue[];

  const { data: course, isLoading, refetch, dataUpdatedAt } = useGetCourseById(id);
  const { updateCourse, isUpdating } = useCourses();
  const [isTogglingClub, setIsTogglingClub] = useState(false);
  const [uploadingGuestId, setUploadingGuestId] = useState<string | null>(null);

  const isClub = !!course?.isClub;
  const buyers = course?.courseClubBuyerUsers ?? [];

  const applyServerValues = useCallback(
    (club?: CourseClubRs | null) => {
      form.resetFields();
      form.setFieldsValue(toFormValues(club));
    },
    [form],
  );

  // Load server data into the form, but never overwrite unsaved edits.
  useEffect(() => {
    if (!course || form.isFieldsTouched()) return;
    applyServerValues(course.courseClub);
  }, [course, dataUpdatedAt, form, applyServerValues]);

  const handleToggleClub = async (checked: boolean) => {
    setIsTogglingClub(true);
    try {
      await updateCourse({ id, isClub: checked });
      await refetch();
    } catch {
      // Error message is shown by the http service
    } finally {
      setIsTogglingClub(false);
    }
  };

  const handleSave = async () => {
    try {
      await form.validateFields();
    } catch {
      message.error('لطفاً خطاهای فرم را برطرف کنید');
      return;
    }

    const values = form.getFieldsValue(true) as ClubFormValues;
    try {
      await updateCourse({ id, courseClub: toPayload(values) });
    } catch {
      return;
    }

    // Reload to get server-generated ids for new guests
    const { data } = await refetch();
    applyServerValues(data?.courseClub);
  };

  const handleReset = () => {
    applyServerValues(course?.courseClub);
  };

  const handleUploadGuestImage = async (guestId: string, file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      message.error('فقط تصاویر JPEG یا PNG مجاز هستند');
      return;
    }

    setUploadingGuestId(guestId);
    try {
      const { imageUrl } = await courseService.uploadClubGuestImage(id, guestId, file);
      // The guest may have moved in the list while uploading, so find it by id.
      const currentGuests = (form.getFieldValue('guests') ?? []) as GuestFormValue[];
      const index = currentGuests.findIndex((guest) => guest.id === guestId);
      if (index !== -1) {
        form.setFieldValue(['guests', index, 'imageUrl'], imageUrl);
      }
      message.success('عکس مهمان آپلود شد');
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.detail(id) });
    } catch {
      // Error message is shown by the http service
    } finally {
      setUploadingGuestId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!course) {
    return <Empty description="دوره یافت نشد" />;
  }

  const isFormDisabled = !isClub || isUpdating;

  return (
    <div className="space-y-4">
      {/* Club toggle */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="mb-1 text-base font-semibold">دوره کلاب</h3>
            <p className="text-sm text-gray-500">
              فقط یک دوره می‌تواند کلاب باشد. با غیرفعال کردن، اطلاعات کلاب حفظ می‌شود ولی در سایت نمایش
              داده نمی‌شود.
            </p>
          </div>
          <Switch
            checked={isClub}
            loading={isTogglingClub}
            onChange={handleToggleClub}
            checkedChildren="کلاب"
            unCheckedChildren="عادی"
          />
        </div>
      </Card>

      {!isClub && (
        <Alert
          type="info"
          showIcon
          message="برای ویرایش برنامه، مهمان‌ها و لینک کلاب، ابتدا این دوره را به عنوان کلاب فعال کنید."
        />
      )}

      <Form<ClubFormValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        disabled={isFormDisabled}
        initialValues={{ linkUrl: '', scheduleLines: [], guests: [] }}
      >
        <div className="space-y-4">
          {/* Link */}
          <Card
            title={
              <span className="flex items-center gap-2">
                <Link2 size={18} />
                لینک کلاب
              </span>
            }
          >
            <Form.Item
              name="linkUrl"
              label="لینک (مثلاً گروه تلگرام)"
              rules={[
                { type: 'url', message: 'لینک معتبر نیست' },
                { max: 2000, message: 'لینک حداکثر ۲۰۰۰ کاراکتر است' },
              ]}
              className="mb-0"
            >
              <Input dir="ltr" placeholder="https://t.me/..." allowClear />
            </Form.Item>
          </Card>

          {/* Weekly schedule */}
          <Card
            title={
              <span className="flex items-center gap-2">
                <CalendarDays size={18} />
                برنامه هفتگی
              </span>
            }
          >
            <Form.List name="scheduleLines">
              {(fields, { add, remove }) => (
                <div className="space-y-3">
                  {fields.map((field) => (
                    <div
                      key={field.key}
                      className="grid grid-cols-1 items-start gap-3 rounded-lg border bg-gray-50 p-3 md:grid-cols-12"
                    >
                      <Form.Item
                        name={[field.name, 'svg']}
                        label="آیکون"
                        rules={[{ required: true, message: 'آیکون را انتخاب کنید' }]}
                        className="mb-0 md:col-span-4"
                      >
                        <ClubIconPicker />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, 'dayOfWeek']}
                        label="روز"
                        rules={[{ required: true, message: 'روز را انتخاب کنید' }]}
                        className="mb-0 md:col-span-3"
                      >
                        <Select placeholder="انتخاب روز" options={ClubDayOfWeekLabels} />
                      </Form.Item>
                      <Form.Item
                        name={[field.name, 'timeRange']}
                        label="بازه زمانی"
                        rules={[
                          { required: true, message: 'بازه زمانی را وارد کنید' },
                          { max: 100, message: 'حداکثر ۱۰۰ کاراکتر' },
                        ]}
                        className="mb-0 md:col-span-4"
                      >
                        <ClubTimeRangeInput />
                      </Form.Item>
                      <div className="flex justify-end md:col-span-1 md:pt-[30px]">
                        <Tooltip title="حذف">
                          <Button
                            type="text"
                            danger
                            icon={<Trash2 size={16} />}
                            onClick={() => remove(field.name)}
                          />
                        </Tooltip>
                      </div>
                    </div>
                  ))}

                  {fields.length === 0 && (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="برنامه‌ای ثبت نشده است" />
                  )}

                  <Button type="dashed" block icon={<Plus size={16} />} onClick={() => add({})}>
                    افزودن برنامه
                  </Button>
                </div>
              )}
            </Form.List>
          </Card>

          {/* Guests */}
          <Card
            title={
              <span className="flex items-center gap-2">
                <User size={18} />
                مهمان‌ها
              </span>
            }
          >
            <Form.List name="guests">
              {(fields, { add, remove }) => (
                <div className="space-y-3">
                  {fields.map((field) => {
                    const guest = guests[field.name] ?? {};
                    const guestId = guest.id;
                    const isUploading = !!guestId && uploadingGuestId === guestId;

                    return (
                      <div key={field.key} className="rounded-lg border bg-gray-50 p-3">
                        <div className="flex flex-col gap-4 md:flex-row">
                          {/* Photo */}
                          <div className="flex shrink-0 flex-col items-center gap-2">
                            <Avatar
                              size={88}
                              src={guest.imageUrl || undefined}
                              icon={<User size={40} />}
                              className="bg-gray-200 text-gray-500"
                            />
                            <Tooltip
                              title={guestId ? undefined : 'برای آپلود عکس، ابتدا مهمان را ذخیره کنید'}
                            >
                              <span>
                                <Upload
                                  accept={ALLOWED_IMAGE_TYPES.join(',')}
                                  showUploadList={false}
                                  disabled={!guestId || !isClub || isUploading}
                                  beforeUpload={(file) => {
                                    if (guestId) handleUploadGuestImage(guestId, file);
                                    return false;
                                  }}
                                >
                                  <Button
                                    size="small"
                                    icon={<ImagePlus size={14} />}
                                    loading={isUploading}
                                    disabled={!guestId || !isClub}
                                  >
                                    {guest.imageUrl ? 'تغییر عکس' : 'آپلود عکس'}
                                  </Button>
                                </Upload>
                              </span>
                            </Tooltip>
                          </div>

                          {/* Fields */}
                          <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-2">
                            <Form.Item
                              name={[field.name, 'fullName']}
                              label="نام و نام خانوادگی"
                              rules={[
                                { required: true, whitespace: true, message: 'نام مهمان را وارد کنید' },
                                { max: 200, message: 'حداکثر ۲۰۰ کاراکتر' },
                              ]}
                              className="mb-0"
                            >
                              <Input placeholder="مثال: سارا احمدی" />
                            </Form.Item>
                            <Form.Item
                              name={[field.name, 'time']}
                              label="زمان حضور"
                              className="mb-0"
                              getValueProps={(value?: string | null) => ({
                                value: value ? moment(value) : null,
                              })}
                              normalize={(value: { toISOString: () => string } | null) =>
                                value ? value.toISOString() : null
                              }
                            >
                              <JalaliAntdDatePicker
                                className="w-full"
                                showTime={{ format: 'HH:mm' }}
                                format="YYYY/MM/DD HH:mm"
                                placeholder="انتخاب تاریخ و ساعت"
                              />
                            </Form.Item>
                            <Form.Item
                              name={[field.name, 'description']}
                              label="توضیحات"
                              rules={[{ max: 2000, message: 'حداکثر ۲۰۰۰ کاراکتر' }]}
                              className="mb-0 md:col-span-2"
                            >
                              <Input.TextArea rows={2} placeholder="مثال: متخصص هوش مصنوعی و کارآفرین" />
                            </Form.Item>
                          </div>

                          <div className="flex justify-end md:items-start">
                            <Tooltip title="حذف مهمان">
                              <Button
                                type="text"
                                danger
                                icon={<Trash2 size={16} />}
                                onClick={() => remove(field.name)}
                              />
                            </Tooltip>
                          </div>
                        </div>
                        {!guestId && (
                          <p className="mt-2 text-xs text-gray-400">
                            مهمان جدید — بعد از ذخیره می‌توانید عکس آپلود کنید.
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {fields.length === 0 && (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="مهمانی ثبت نشده است" />
                  )}

                  <Button type="dashed" block icon={<Plus size={16} />} onClick={() => add({})}>
                    افزودن مهمان
                  </Button>
                </div>
              )}
            </Form.List>
          </Card>
        </div>
      </Form>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button icon={<RotateCcw size={16} />} onClick={handleReset} disabled={isFormDisabled}>
          بازنشانی
        </Button>
        <Button
          type="primary"
          icon={<Save size={16} />}
          onClick={handleSave}
          loading={isUpdating && !isTogglingClub}
          disabled={!isClub}
        >
          ذخیره اطلاعات کلاب
        </Button>
      </div>

      {/* Club members */}
      <Card
        title={
          <span className="flex items-center gap-2">
            <Users size={18} />
            اعضای کلاب (خریداران دوره)
            <span className="text-sm font-normal text-gray-400">({buyers.length.toLocaleString('fa-IR')})</span>
          </span>
        }
      >
        {buyers.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="هنوز عضوی ندارد" />
        ) : (
          <div className="flex max-h-80 flex-wrap gap-3 overflow-y-auto">
            {buyers.map((buyer) => (
              <div
                key={buyer.id}
                className="flex items-center gap-2 rounded-full border bg-white py-1 pl-3 pr-1"
              >
                <Avatar size={32} src={buyer.imageUrl || undefined} icon={<User size={16} />} />
                <span className="text-sm">{buyer.fullNameFa || 'بدون نام'}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
