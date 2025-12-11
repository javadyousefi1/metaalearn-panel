import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Switch, Select, Space, Alert, Upload, Button, Segmented, message } from "antd";
import { Video, FileText, FileEdit, Folder, Upload as UploadIcon, Image } from 'lucide-react';
import type { UploadFile, SegmentedValue } from 'antd';
import { useParams } from 'react-router-dom';
import DatePicker from "@/components/datePicker/DatePicker";
import type { CourseSession } from "@/types/session.types";
import { useGetAllSchedules } from '@/hooks';
import moment from 'moment-jalaali';

// Upload Type Enum
enum CourseSessionUploadType {
  Video = 1,
  File = 2,
  VideoCover = 3
}

interface CourseSessionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<CourseSession>) => Promise<void>;
  onUploadMedia?: (sessionId: string, file: File, uploadType: CourseSessionUploadType) => Promise<void>;
  loading?: boolean;
  uploadLoading?: boolean;
  session?: CourseSession | null;
  parentId?: string | null;
  level1ParentId?: string | null; // For level 3 sessions
  nextIndex?: number;
  allSessions?: CourseSession[]; // All sessions to build hierarchy
}

export const CourseSessionModal: React.FC<CourseSessionModalProps> = ({
  open,
  onClose,
  onSubmit,
  onUploadMedia,
  loading = false,
  uploadLoading = false,
  session = null,
  parentId = null,
  level1ParentId = null,
  nextIndex = 0,
  allSessions = [],
}) => {
  const { id: courseId } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const [sessionLevel, setSessionLevel] = useState<1 | 2 | 3>(1);
  const [selectedLevel1, setSelectedLevel1] = useState<string | null>(null);
  const [selectedLevel2, setSelectedLevel2] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadType, setUploadType] = useState<CourseSessionUploadType>(CourseSessionUploadType.Video);
  const [activeTab, setActiveTab] = useState<SegmentedValue>('info');

  // Fetch course schedules
  const { data: schedules = [] } = useGetAllSchedules(
    { CourseId: courseId, PageIndex: 1, PageSize: 100 },
    !!courseId && open
  );

  // Get hierarchy information for existing session
  const getSessionLevel = (session: CourseSession | null): 1 | 2 | 3 => {
    if (!session || !session.parentId) return 1;

    // Check if parent has a parent (meaning this is level 3)
    const parent = allSessions.find(s => s.id === session.parentId);
    if (parent?.parentId) return 3;

    return 2;
  };

  // Initialize form with session data when editing
  useEffect(() => {
    if (open && session) {
      const level = getSessionLevel(session);
      setSessionLevel(level);

      // Find parent hierarchy for level 3
      if (level === 3 && session.parentId) {
        const level2Parent = allSessions.find(s => s.id === session.parentId);
        if (level2Parent) {
          setSelectedLevel1(level2Parent.parentId);
          setSelectedLevel2(level2Parent.id);
        }
      } else if (level === 2 && session.parentId) {
        setSelectedLevel1(session.parentId);
      }

      form.setFieldsValue({
        ...session,
        sessionLevel: level,
        occurrenceTime: session.occurrenceTime
          ? moment(session.occurrenceTime).format('YYYY/MM/DD HH:mm')
          : null,
        practiceDueTime: session.practiceDueTime
          ? moment(session.practiceDueTime).format('YYYY/MM/DD HH:mm')
          : null,
        courseScheduleIds: session.schedules?.map(item => item.id) || null,
      });
    } else if (open) {
      // Determine level based on provided parentId
      let level: 1 | 2 | 3 = 1;
      if (parentId) {
        const parent = allSessions.find(s => s.id === parentId);
        if (parent?.parentId) {
          level = 3;
          setSelectedLevel1(parent.parentId);
          setSelectedLevel2(parentId);
        } else {
          level = 2;
          setSelectedLevel1(parentId);
        }
      } else if (level1ParentId) {
        level = 3;
        setSelectedLevel1(level1ParentId);
      }

      setSessionLevel(level);
      form.setFieldsValue({
        sessionLevel: level,
        index: nextIndex,
        isPracticeAvailable: false,
        isTopic: false,
        courseScheduleIds: [],
      });
    }
  }, [open, session, form, nextIndex, parentId, level1ParentId, allSessions]);

  const handleSubmitInfo = async () => {
    const values = await form.validateFields();

    // Determine correct parentId based on session level
    let finalParentId: string | null = null;
    if (sessionLevel === 2) {
      finalParentId = selectedLevel1;
    } else if (sessionLevel === 3) {
      finalParentId = selectedLevel2;
    }

    // Format dates to ISO string
    const formattedValues = {
      ...values,
      occurrenceTime: values.occurrenceTime
        ? moment(values.occurrenceTime).toISOString()
        : null,
      practiceDueTime: values.practiceDueTime
        ? moment(values.practiceDueTime).toISOString()
        : null,
      parentId: finalParentId,
      index: values.index ?? nextIndex,
      courseScheduleIds: values.courseScheduleIds || null,
    };

    await onSubmit(formattedValues);
    form.resetFields();
    setSessionLevel(1);
    setSelectedLevel1(null);
    setSelectedLevel2(null);
    setFileList([]);
    setUploadType(CourseSessionUploadType.Video);
  };

  const handleUploadMedia = async () => {
    if (!session?.id || !onUploadMedia) {
      message.warning('لطفاً ابتدا جلسه را ایجاد کنید');
      return;
    }

    const file = fileList[0]?.originFileObj;

    if (!file) {
      message.warning('لطفاً فایلی را انتخاب کنید');
      return;
    }
    console.log(file ,"file file")
    await onUploadMedia(session.id, file, uploadType);
    setFileList([]);
    setUploadType(CourseSessionUploadType.Video);
  };

  const handleCancel = () => {
    form.resetFields();
    setSessionLevel(1);
    setSelectedLevel1(null);
    setSelectedLevel2(null);
    setFileList([]);
    setUploadType(CourseSessionUploadType.Video);
    setActiveTab('info');
    onClose();
  };

  // Get level 1 sessions (parentId = null)
  const level1Sessions = allSessions.filter(s => !s.parentId);

  // Get level 2 sessions for selected level 1
  const level2Sessions = selectedLevel1
    ? allSessions.filter(s => s.parentId === selectedLevel1)
    : [];

  // Get level label
  const getLevelLabel = (level: 1 | 2 | 3): string => {
    switch (level) {
      case 1: return 'فصل اصلی';
      case 2: return 'زیر فصل';
      case 3: return 'مبحث';
    }
  };

  return (
    <Modal
      title={
        <span className="text-xl font-bold">
          {session ? "ویرایش جلسه" : "افزودن جلسه جدید"}
        </span>
      }
      open={open}
      onCancel={handleCancel}
      width={800}
      centered
      destroyOnClose
      footer={
        <div className="flex justify-end gap-2">
          <Button onClick={handleCancel} size="large">
            انصراف
          </Button>
          {activeTab === 'info' ? (
            <Button
              type="primary"
              onClick={handleSubmitInfo}
              loading={loading}
              size="large"
            >
              {session ? "به‌روزرسانی اطلاعات" : "ذخیره جلسه"}
            </Button>
          ) : (
            <Button
              type="primary"
              onClick={handleUploadMedia}
              loading={uploadLoading}
              disabled={!session || !fileList.length}
              size="large"
              icon={<UploadIcon size={16} />}
            >
              آپلود فایل
            </Button>
          )}
        </div>
      }
    >
      <div className="py-4 max-h-[70vh] overflow-y-auto">
        {/* Segmented Control */}
        <div className="mb-6 flex justify-center">
          <Segmented
            value={activeTab}
            onChange={setActiveTab}
            size="large"
            options={[
              {
                label: (
                  <div className="flex items-center gap-2 px-4">
                    <FileEdit size={18} />
                    <span>اطلاعات جلسه</span>
                  </div>
                ),
                value: 'info',
              },
              {
                label: (
                  <div className="flex items-center gap-2 px-4">
                    <Folder size={18} />
                    <span>فایل‌ها و رسانه</span>
                  </div>
                ),
                value: 'media',
              },
            ]}
          />
        </div>

        <Form
          form={form}
          layout="vertical"
          size="large"
          requiredMark={false}
          disabled={loading}
        >
          {/* Info Tab */}
          {activeTab === 'info' && (
            <>
              {/* Level Selector - Only for child sessions */}
              {!session && (parentId || level1ParentId) && (
                <>
                  <Alert
                    message={`در حال ایجاد: ${getLevelLabel(sessionLevel)}`}
                    type="info"
                    showIcon
                    className="mb-4"
                  />
                  <Form.Item
                    name="sessionLevel"
                    label="سطح جلسه"
                    rules={[{ required: true, message: "لطفاً سطح جلسه را انتخاب کنید" }]}
                  >
                    <Select
                      value={sessionLevel}
                      onChange={(value) => {
                        setSessionLevel(value);
                        setSelectedLevel1(null);
                        setSelectedLevel2(null);
                      }}
                      placeholder="سطح جلسه را انتخاب کنید"
                      disabled={!!parentId || !!level1ParentId}
                    >
                      <Select.Option value={1}>سطح ۱ - فصل اصلی</Select.Option>
                      <Select.Option value={2}>سطح ۲ - زیر فصل</Select.Option>
                      <Select.Option value={3}>سطح ۳ - مبحث</Select.Option>
                    </Select>
                  </Form.Item>

                  {/* Parent Selectors */}
                  {sessionLevel === 2 && (
                    <Form.Item
                      label="انتخاب فصل اصلی"
                      rules={[{ required: true, message: "لطفاً فصل اصلی را انتخاب کنید" }]}
                    >
                      <Select
                        value={selectedLevel1}
                        onChange={setSelectedLevel1}
                        placeholder="فصل اصلی را انتخاب کنید"
                        disabled={!!parentId}
                      >
                        {level1Sessions.map(s => (
                          <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  )}

                  {sessionLevel === 3 && (
                    <Space direction="vertical" className="w-full">
                      <Form.Item
                        label="انتخاب فصل اصلی"
                        rules={[{ required: true, message: "لطفاً فصل اصلی را انتخاب کنید" }]}
                      >
                        <Select
                          value={selectedLevel1}
                          onChange={(value) => {
                            setSelectedLevel1(value);
                            setSelectedLevel2(null);
                          }}
                          placeholder="فصل اصلی را انتخاب کنید"
                          disabled={!!level1ParentId}
                        >
                          {level1Sessions.map(s => (
                            <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
                          ))}
                        </Select>
                      </Form.Item>

                      <Form.Item
                        label="انتخاب زیر فصل"
                        rules={[{ required: true, message: "لطفاً زیر فصل را انتخاب کنید" }]}
                      >
                        <Select
                          value={selectedLevel2}
                          onChange={setSelectedLevel2}
                          placeholder="ابتدا فصل اصلی را انتخاب کنید"
                          disabled={!selectedLevel1 || !!parentId}
                        >
                          {level2Sessions.map(s => (
                            <Select.Option key={s.id} value={s.id}>{s.name}</Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Space>
                  )}
                </>
              )}

          {/* Session Name */}
          <Form.Item
            name="name"
            label="عنوان جلسه"
            rules={[
              { required: true, message: "لطفاً عنوان جلسه را وارد کنید" },
              { min: 3, message: "عنوان باید حداقل ۳ کاراکتر باشد" },
            ]}
          >
            <Input placeholder="عنوان جلسه را وارد کنید" />
          </Form.Item>

          {/* Description */}
          <Form.Item
            name="description"
            label="توضیحات"
            rules={[
              { required: true, message: "لطفاً توضیحات را وارد کنید" },
              { min: 10, message: "توضیحات باید حداقل ۱۰ کاراکتر باشد" },
            ]}
          >
            <Input.TextArea rows={3} placeholder="توضیحات جلسه را وارد کنید" />
          </Form.Item>

          {/* Index */}
          <Form.Item
            name="index"
            label="ترتیب نمایش"
            rules={[
              { required: true, message: "لطفاً ترتیب نمایش را وارد کنید" },
            ]}
          >
            <Input type="number" placeholder="ترتیب نمایش" disabled />
          </Form.Item>

          {/* Occurrence Time */}
          <DatePicker
            className="w-full"
            placeholder="زمان برگزاری را انتخاب کنید"
            format="jYYYY/jMM/jDD"
            label={"زمان برگزاری"}
            isFormItem
            name={"occurrenceTime"}
            showTime
          />

          {/* Practice Due Time */}
          <DatePicker
            showTime
            className="w-full"
            placeholder="زمان برگزاری را انتخاب کنید"
            format="jYYYY/jMM/jDD"
            label="مهلت تمرین"
            isFormItem
            name={"practiceDueTime"}
          />

          {/* Course Schedules */}
          <Form.Item
            name="courseScheduleIds"
            label="گروه‌های دوره"
          >
            <Select
              mode="multiple"
              placeholder="انتخاب گروه‌ها"
              size="large"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {schedules.map((schedule) => (
                <Select.Option key={schedule.id} value={schedule.id}>
                  {schedule.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Practice Available */}
          <Form.Item
            name="isPracticeAvailable"
            label="تمرین در دسترس است"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          {/* Is Topic */}
          <Form.Item
            name="isTopic"
            label="موضوع (Topic)"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
            </>
          )}

          {/* Media Tab */}
          {activeTab === 'media' && (
            <>
              {!session ? (
                <Alert
                  message="لطفاً ابتدا اطلاعات جلسه را ذخیره کنید"
                  description="برای آپلود فایل‌های رسانه‌ای، ابتدا باید جلسه را ایجاد کنید. به بخش 'اطلاعات جلسه' بروید و جلسه را ذخیره کنید."
                  type="warning"
                  showIcon
                  className="mb-4"
                />
              ) : (
                <Alert
                  message="فایل‌های رسانه‌ای جلسه را در این بخش مدیریت کنید"
                  description="نوع فایل را انتخاب کرده و سپس فایل مورد نظر را آپلود کنید."
                  type="info"
                  showIcon
                  className="mb-4"
                />
              )}

              {/* Current Files Display */}
              {session && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-3">فایل‌های فعلی:</h4>
                  <Space direction="vertical" className="w-full">
                    {session.videoUrl && (
                      <div className="flex items-center gap-2">
                        <Video size={16} className="text-blue-500" />
                        <span className="text-sm text-gray-600">ویدیو:</span>
                        <a href={session.videoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                          مشاهده
                        </a>
                      </div>
                    )}
                    {session.fileUrl && (
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-green-500" />
                        <span className="text-sm text-gray-600">فایل:</span>
                        <a href={session.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                          دانلود
                        </a>
                      </div>
                    )}
                    {!session.videoUrl && !session.fileUrl && (
                      <div className="text-sm text-gray-400">هیچ فایلی آپلود نشده است</div>
                    )}
                  </Space>
                </div>
              )}

              {/* Upload Type Selection */}
              <Form.Item
                label="نوع فایل"
                required
              >
                <Select
                  value={uploadType}
                  onChange={setUploadType}
                  size="large"
                  disabled={!session}
                >
                  <Select.Option value={CourseSessionUploadType.Video}>
                    <Space>
                      <Video size={16} />
                      <span>ویدیو</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value={CourseSessionUploadType.File}>
                    <Space>
                      <FileText size={16} />
                      <span>فایل ضمیمه</span>
                    </Space>
                  </Select.Option>
                  <Select.Option value={CourseSessionUploadType.VideoCover}>
                    <Space>
                      <Image size={16} />
                      <span>کاور ویدیو</span>
                    </Space>
                  </Select.Option>
                </Select>
              </Form.Item>

              {/* File Upload */}
              <Form.Item
                label="انتخاب فایل"
                required
              >
                <Upload
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                  beforeUpload={() => false}
                  maxCount={1}
                  accept={
                    uploadType === CourseSessionUploadType.Video
                      ? 'video/*'
                      : uploadType === CourseSessionUploadType.VideoCover
                      ? 'image/*'
                      : '*'
                  }
                  disabled={!session}
                >
                  <Button
                    icon={
                      uploadType === CourseSessionUploadType.Video
                        ? <Video size={16} />
                        : uploadType === CourseSessionUploadType.VideoCover
                        ? <Image size={16} />
                        : <FileText size={16} />
                    }
                    size="large"
                    block
                    disabled={!session}
                  >
                    {uploadType === CourseSessionUploadType.Video
                      ? 'انتخاب ویدیو'
                      : uploadType === CourseSessionUploadType.VideoCover
                      ? 'انتخاب تصویر کاور'
                      : 'انتخاب فایل'}
                  </Button>
                </Upload>
              </Form.Item>
            </>
          )}
        </Form>
      </div>
    </Modal>
  );
};
