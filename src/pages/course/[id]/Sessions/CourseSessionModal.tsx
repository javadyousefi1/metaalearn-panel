import React, { useEffect, useState, useRef, useMemo } from "react";
import { Modal, Form, Input, Switch, Select, Space, Alert, Upload, Button, Segmented, message, Progress, Popconfirm, Tooltip } from "antd";
import { Video, FileText, FileEdit, Folder, Upload as UploadIcon, Image, ShieldCheck, RefreshCw, Link2 } from 'lucide-react';
import type { UploadFile, SegmentedValue } from 'antd';
import { useParams } from 'react-router-dom';
import DatePicker from "@/components/datePicker/DatePicker";
import { CourseSessionUploadType } from "@/types/session.types";
import type { CourseSession, VideoProcessingStatusResponse } from "@/types/session.types";
import { useGetAllSchedules, useAuth } from '@/hooks';
import { isSuperAdminUser } from '@/utils';
import moment from 'moment-jalaali';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { LinkExistingSessionVideo } from './LinkExistingSessionVideo';

// Background video-processing stage keys reported by ProcessCourseSessionVideoUploadJob, mapped to
// Persian labels shown next to the upload progress bar while polling.
const VIDEO_PROCESSING_STAGE_LABELS: Record<string, string> = {
  Queued: 'در صف پردازش',
  Starting: 'در حال آماده‌سازی',
  DownloadingSource: 'در حال آماده‌سازی فایل منبع',
  Transcoding: 'در حال تبدیل ویدیو',
  UploadingSegments: 'در حال آپلود بخش‌های ویدیو',
  Ready: 'آماده پخش',
  Failed: 'خطا در پردازش',
};

const getVideoProcessingStageLabel = (stage: string | null | undefined): string =>
  (stage && VIDEO_PROCESSING_STAGE_LABELS[stage]) || 'در حال پردازش ویدیو...';

// Temporarily off — set to true to re-enable «بازسازی ویدیو» in the video toolkit.
const RENEW_VIDEO_ENABLED = false;

type MediaSourceMode = 'upload' | 'reuse';

interface CourseSessionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<CourseSession>) => Promise<void>;
  onUploadMedia?: (sessionId: string, file: File, uploadType: CourseSessionUploadType) => Promise<void>;
  loading?: boolean;
  uploadLoading?: boolean;
  uploadProgress?: number;
  isUploadSuccess?: boolean;
  isUploadError?: boolean;
  videoProcessingStatus?: VideoProcessingStatusResponse | null;
  onResetUploadState?: () => void;
  onCheckVideoIntegrity?: (sessionId: string) => Promise<void>;
  onRenewVideo?: (sessionId: string) => Promise<void>;
  onAttachSharedVideo?: (sourceSessionId: string) => Promise<void>;
  checkingVideoIntegrity?: boolean;
  renewingVideo?: boolean;
  attachingSharedVideo?: boolean;
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
  uploadProgress = 0,
  isUploadSuccess = false,
  isUploadError = false,
  videoProcessingStatus = null,
  onResetUploadState,
  onCheckVideoIntegrity,
  onRenewVideo,
  onAttachSharedVideo,
  checkingVideoIntegrity = false,
  renewingVideo = false,
  attachingSharedVideo = false,
  session = null,
  parentId = null,
  level1ParentId = null,
  nextIndex = 0,
  allSessions = [],
}) => {
  const { id: courseId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const superAdmin = isSuperAdminUser(user ?? null);
  const [form] = Form.useForm();
  const [sessionLevel, setSessionLevel] = useState<1 | 2 | 3>(1);
  const [selectedLevel1, setSelectedLevel1] = useState<string | null>(null);
  const [selectedLevel2, setSelectedLevel2] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadType, setUploadType] = useState<CourseSessionUploadType>(CourseSessionUploadType.Video);
  const [mediaSourceMode, setMediaSourceMode] = useState<MediaSourceMode>('upload');
  const [reuseSourceSessionId, setReuseSourceSessionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<SegmentedValue>('info');
  const quillRef = useRef<ReactQuill>(null);
  // Fetch course schedules
  const { data: schedules = [] } = useGetAllSchedules(
    { CourseId: courseId, PageIndex: 1, PageSize: 100 },
    !!courseId && open
  );

  // Quill editor modules configuration
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
        ['blockquote', 'code-block'],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        [{ 'direction': 'rtl' }], // RTL support
        ['clean']
      ],
    },
    clipboard: {
      // Allow pasted HTML content
      matchVisual: false,
    },
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'blockquote', 'code-block',
    'align',
    'link', 'image', 'video',
    'direction'
  ];

  // Get hierarchy information for existing session
  const getSessionLevel = (session: CourseSession | null): 1 | 2 | 3 => {
    if (!session || !session.parentId) return 1;

    // Check if parent has a parent (meaning this is level 3)
    const parent = allSessions.find(s => s.id === session.parentId);
    if (parent?.parentId) return 3;

    return 2;
  };

  // Reset upload state when tab changes
  useEffect(() => {
    if (onResetUploadState && activeTab === 'media') {
      onResetUploadState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

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

      // Set description using clipboard.convert to preserve HTML structure
      setTimeout(() => {
        if (quillRef.current) {
          const editor = quillRef.current.getEditor();
          if (session.description) {
            const delta = editor.clipboard.convert(session.description);
            editor.setContents(delta, 'silent');
          } else {
            editor.setText('');
          }
        }
      }, 100);
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

      // Clear Quill content for new session
      setTimeout(() => {
        if (quillRef.current) {
          quillRef.current.getEditor().setText('');
        }
      }, 100);
    }
  }, [open, session?.id, form, nextIndex, parentId, level1ParentId, allSessions, session]);

  const handleSubmitInfo = async () => {
    const values = await form.validateFields();

    // Get description from Quill editor
    const description = quillRef.current?.getEditor().root.innerHTML || '';

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
      description,
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
    setMediaSourceMode('upload');
    setReuseSourceSessionId(null);

    // Clear Quill content
    if (quillRef.current) {
      quillRef.current.getEditor().setText('');
    }
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

  const handleAttachSharedVideo = async () => {
    if (!session?.id || !onAttachSharedVideo) {
      message.warning('لطفاً ابتدا جلسه را ایجاد کنید');
      return;
    }

    if (!reuseSourceSessionId) {
      message.warning('لطفاً جلسه مبدأ را انتخاب کنید');
      return;
    }

    await onAttachSharedVideo(reuseSourceSessionId);
    setReuseSourceSessionId(null);
  };

  const handleCancel = () => {
    form.resetFields();
    setSessionLevel(1);
    setSelectedLevel1(null);
    setSelectedLevel2(null);
    setFileList([]);
    setUploadType(CourseSessionUploadType.Video);
    setMediaSourceMode('upload');
    setReuseSourceSessionId(null);
    setActiveTab('info');

    // Clear Quill content
    if (quillRef.current) {
      quillRef.current.getEditor().setText('');
    }

    if (onResetUploadState) {
      onResetUploadState();
    }
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
        <div className="flex items-center gap-2">
          <span className={"text-lg"}>{session ? "ویرایش جلسه" : "افزودن جلسه جدید"}</span> <span className={"text-sm text-gray-500 font-medium"}>{session?.name}</span>
        </div>
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
          ) : mediaSourceMode === 'reuse' ? (
            <Button
              type="primary"
              onClick={handleAttachSharedVideo}
              loading={attachingSharedVideo}
              disabled={!session || !reuseSourceSessionId || !onAttachSharedVideo}
              size="large"
              icon={<Link2 size={16} />}
            >
              اتصال ویدیو
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
          <div style={{ display: activeTab === 'info' ? 'block' : 'none' }}>
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
            label="توضیحات"
          >
            <div className="rounded-lg overflow-hidden">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                modules={modules}
                formats={formats}
                placeholder="توضیحات جلسه را وارد کنید..."
                style={{ minHeight: '200px', direction: 'rtl' }}
              />
            </div>
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
          </div>

          {/* Media Tab */}
          <div style={{ display: activeTab === 'media' ? 'block' : 'none' }}>
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
                <p className="text-sm text-gray-500 mb-4">
                  ویدیوی موجود را از «جعبه‌ابزار ویدیو» مدیریت کنید؛ برای افزودن یا جایگزینی، از بخش زیر آپلود یا استفاده از ویدیوی موجود را انتخاب کنید.
                </p>
              )}

              {/* Upload Status Alerts */}
              {isUploadSuccess && (
                <Alert
                  message={
                    uploadType === CourseSessionUploadType.Video
                      ? 'ویدیو با موفقیت آپلود و پردازش شد'
                      : 'فایل با موفقیت آپلود شد'
                  }
                  description={
                    uploadType === CourseSessionUploadType.Video
                      ? 'ویدیوی جلسه آماده پخش است و در جعبه‌ابزار ویدیو قابل مدیریت است.'
                      : 'فایل شما با موفقیت آپلود شد و در لیست فایل‌های فعلی قابل مشاهده است.'
                  }
                  type="success"
                  showIcon
                  closable
                  onClose={() => onResetUploadState?.()}
                  className="mb-4"
                />
              )}

              {isUploadError && (
                <Alert
                  message="خطا در آپلود فایل"
                  description={
                    videoProcessingStatus?.status === 'Failed' && videoProcessingStatus.error
                      ? videoProcessingStatus.error
                      : 'متأسفانه در آپلود فایل خطایی رخ داد. لطفاً دوباره تلاش کنید.'
                  }
                  type="error"
                  showIcon
                  closable
                  onClose={() => onResetUploadState?.()}
                  className="mb-4"
                />
              )}

              {/* Video toolkit — manage existing video (separate from upload) */}
              {session?.hasVideo && (
                <div className="mb-6 rounded-xl border border-indigo-100 bg-gradient-to-l from-indigo-50/80 to-blue-50/40 p-4">
                  <div className="mb-4 flex items-start gap-3">
                    <div className="rounded-lg bg-indigo-100 p-2.5 shrink-0">
                      <Video size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">جعبه‌ابزار ویدیو</h4>
                      <p className="mt-1 text-xs leading-relaxed text-gray-500">
                        ابزارهای مدیریت ویدیوی فعلی — مشاهده، بررسی سلامت و بازسازی. این بخش
                        جدا از آپلود فایل جدید است.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <Button
                      icon={<Video size={16} />}
                      href={`https://metaalearn.com/course/${courseId}/session?sessionId=${session.id}`}
                      target="_blank"
                      className="h-auto py-2.5"
                    >
                      مشاهده ویدیو
                    </Button>
                    {superAdmin && onCheckVideoIntegrity ? (
                      <Button
                        icon={<ShieldCheck size={16} />}
                        onClick={() => onCheckVideoIntegrity(session.id)}
                        loading={checkingVideoIntegrity}
                        block
                        className="h-auto py-2.5"
                      >
                        بررسی سلامت
                      </Button>
                    ) : (
                      <Tooltip title="فقط سوپرادمین">
                        <span className="inline-block w-full cursor-not-allowed">
                          <Button
                            icon={<ShieldCheck size={16} />}
                            disabled
                            block
                            className="pointer-events-none h-auto py-2.5"
                          >
                            بررسی سلامت
                          </Button>
                        </span>
                      </Tooltip>
                    )}
                    {RENEW_VIDEO_ENABLED && superAdmin && onRenewVideo && !session.linkedVideoSource ? (
                      <Popconfirm
                        title="بازسازی ویدیو"
                        description="ویدیو از روی بخش‌های موجود بازسازی و با فرمت جدید تبدیل می‌شود. آیا ادامه می‌دهید؟"
                        onConfirm={() => onRenewVideo(session.id)}
                        okText="بله، بازسازی شود"
                        cancelText="انصراف"
                      >
                        <Button
                          icon={<RefreshCw size={16} />}
                          loading={renewingVideo}
                          className="h-auto w-full py-2.5"
                        >
                          بازسازی ویدیو
                        </Button>
                      </Popconfirm>
                    ) : (
                      <Tooltip
                        title={
                          session.linkedVideoSource
                            ? 'برای ویدیوی مشترک در دسترس نیست'
                            : RENEW_VIDEO_ENABLED
                              ? 'فقط سوپرادمین'
                              : 'به‌زودی فعال می‌شود'
                        }
                      >
                        <span className="inline-block w-full cursor-not-allowed">
                          <Button
                            icon={<RefreshCw size={16} />}
                            disabled
                            block
                            className="pointer-events-none h-auto py-2.5"
                          >
                            بازسازی ویدیو
                          </Button>
                        </span>
                      </Tooltip>
                    )}
                  </div>
                </div>
              )}

              {/* Current attachment (non-video) */}
              {session?.fileUrl && (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 px-4 py-3">
                  <Space size="small">
                    <FileText size={18} className="text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">فایل ضمیمه</p>
                      <p className="text-xs text-gray-500">فایل آپلودشده برای این جلسه</p>
                    </div>
                  </Space>
                  <Button
                    type="primary"
                    ghost
                    icon={<FileText size={16} />}
                    href={session.fileUrl.replace('http', 'https')}
                    target="_blank"
                  >
                    دانلود
                  </Button>
                </div>
              )}

              {/* Single media source card: upload OR reuse via dropdown */}
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/40 p-4">
                <div className="mb-4 flex items-start gap-3">
                  <div className="rounded-lg bg-white p-2.5 shadow-sm shrink-0">
                    {mediaSourceMode === 'reuse'
                      ? <Link2 size={20} className="text-gray-600" />
                      : <UploadIcon size={20} className="text-gray-600" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">افزودن یا جایگزینی فایل</h4>
                    <p className="mt-1 text-xs text-gray-500">
                      آپلود فایل جدید، یا استفاده از ویدیویی که قبلاً برای جلسه دیگری آپلود شده است.
                    </p>
                  </div>
                </div>

                <Form.Item label="نحوه افزودن" required>
                  <Select
                    value={mediaSourceMode}
                    onChange={(value: MediaSourceMode) => {
                      setMediaSourceMode(value);
                      setReuseSourceSessionId(null);
                      if (value === 'reuse') {
                        setFileList([]);
                      }
                    }}
                    size="large"
                    disabled={!session}
                  >
                    <Select.Option value="upload">
                      <Space>
                        <UploadIcon size={16} />
                        <span>آپلود فایل جدید</span>
                      </Space>
                    </Select.Option>
                    {onAttachSharedVideo && (
                      <Select.Option value="reuse">
                        <Space>
                          <Link2 size={16} />
                          <span>استفاده از ویدیوی موجود</span>
                        </Space>
                      </Select.Option>
                    )}
                  </Select>
                </Form.Item>

                {mediaSourceMode === 'reuse' && session && onAttachSharedVideo ? (
                  <LinkExistingSessionVideo
                    targetSessionId={session.id}
                    linkedVideoSource={session.linkedVideoSource}
                    loading={attachingSharedVideo}
                    disabled={uploadLoading}
                    onSourceSessionChange={setReuseSourceSessionId}
                  />
                ) : (
                  <>
                    <Form.Item label="نوع فایل" required>
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

                    <Form.Item label="انتخاب فایل" required>
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
                        disabled={!session || uploadLoading}
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
                          disabled={!session || uploadLoading}
                        >
                          {uploadType === CourseSessionUploadType.Video
                            ? 'انتخاب ویدیو'
                            : uploadType === CourseSessionUploadType.VideoCover
                            ? 'انتخاب تصویر کاور'
                            : 'انتخاب فایل'}
                        </Button>
                      </Upload>
                    </Form.Item>

                    {uploadLoading && (
                      <div className="mt-4">
                        <div
                          className={`flex items-center mb-2 ${
                            uploadProgress > 0 ? 'justify-between' : 'justify-start'
                          }`}
                        >
                          <span className="text-sm text-gray-600">
                            {uploadType === CourseSessionUploadType.Video
                              ? uploadProgress >= 100
                                ? getVideoProcessingStageLabel(videoProcessingStatus?.stage)
                                : 'در حال پردازش ویدیو آپلود شده'
                              : 'در حال آپلود...'}
                          </span>
                          {uploadProgress > 0 && !(uploadType === CourseSessionUploadType.Video && uploadProgress >= 100) && (
                            <span className="text-sm font-medium text-primary">{uploadProgress}%</span>
                          )}
                        </div>
                        {uploadProgress > 0 && (
                          <Progress
                            percent={
                              uploadType === CourseSessionUploadType.Video && uploadProgress >= 100
                                ? 100
                                : uploadProgress
                            }
                            status={
                              uploadType === CourseSessionUploadType.Video && uploadProgress >= 100
                                ? 'active'
                                : uploadProgress === 100
                                  ? 'success'
                                  : 'active'
                            }
                            strokeColor={{
                              '0%': '#108ee9',
                              '100%': '#87d068',
                            }}
                            showInfo={false}
                          />
                        )}
                        {uploadType === CourseSessionUploadType.Video && uploadProgress >= 100 && (
                          <p className="mt-2 text-xs text-gray-400">
                            آپلود ویدیو در حال تمام شدن است؛ پردازش ویدیو در پس‌زمینه انجام می‌شود.
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          </div>
        </Form>
      </div>
    </Modal>
  );
};
