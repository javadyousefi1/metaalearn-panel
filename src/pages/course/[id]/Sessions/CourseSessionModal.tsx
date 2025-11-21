import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Switch, Select, Space, Alert } from "antd";
import DatePicker from "@/components/datePicker/DatePicker";
import type { CourseSession } from "@/types/session.types";
import moment from 'moment-jalaali';

interface CourseSessionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<CourseSession>) => Promise<void>;
  loading?: boolean;
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
  loading = false,
  session = null,
  parentId = null,
  level1ParentId = null,
  nextIndex = 0,
  allSessions = [],
}) => {
  const [form] = Form.useForm();
  const [sessionLevel, setSessionLevel] = useState<1 | 2 | 3>(1);
  const [selectedLevel1, setSelectedLevel1] = useState<string | null>(null);
  const [selectedLevel2, setSelectedLevel2] = useState<string | null>(null);

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
          ? moment(session.occurrenceTime)
          : null,
        practiceDueTime: session.practiceDueTime
          ? moment(session.practiceDueTime)
          : null,
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
      });
    }
  }, [open, session, form, nextIndex, parentId, level1ParentId, allSessions]);

  const handleSubmit = async () => {
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
        : "",
      practiceDueTime: values.practiceDueTime
        ? moment(values.practiceDueTime).toISOString()
        : "",
      parentId: finalParentId,
      index: values.index ?? nextIndex,
    };

    await onSubmit(formattedValues);
    form.resetFields();
    setSessionLevel(1);
    setSelectedLevel1(null);
    setSelectedLevel2(null);
  };

  const handleCancel = () => {
    form.resetFields();
    setSessionLevel(1);
    setSelectedLevel1(null);
    setSelectedLevel2(null);
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
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={session ? "به‌روزرسانی" : "افزودن"}
      cancelText="انصراف"
      confirmLoading={loading}
      width={800}
      centered
      destroyOnClose
    >
      <div className="py-4 max-h-[70vh] overflow-y-auto">
        <Form
          form={form}
          layout="vertical"
          size="large"
          requiredMark={false}
          disabled={loading}
        >
          {/* Level Selector - Only for new sessions */}
          {!session && (
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
            value={form.getFieldValue("occurrenceTime")}
            isRequired
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
            value={form.getFieldValue("practiceDueTime")}
            isRequired
          />

          {/* Video URL */}
          <Form.Item
            name="videoUrl"
            label="لینک ویدیو"
            rules={[{ type: "url", message: "لطفاً یک آدرس معتبر وارد کنید" }]}
          >
            <Input placeholder="https://example.com/video.mp4" />
          </Form.Item>

          {/* File URL */}
          <Form.Item
            name="fileUrl"
            label="لینک فایل"
            rules={[{ type: "url", message: "لطفاً یک آدرس معتبر وارد کنید" }]}
          >
            <Input placeholder="https://example.com/file.pdf" />
          </Form.Item>

          {/* Online Meeting URL */}
          <Form.Item
            name="onlineMeetingUrl"
            label="لینک جلسه آنلاین"
            rules={[{ type: "url", message: "لطفاً یک آدرس معتبر وارد کنید" }]}
          >
            <Input placeholder="https://meet.google.com/..." />
          </Form.Item>

          {/* Practice Available */}
          <Form.Item
            name="isPracticeAvailable"
            label="تمرین در دسترس است"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};
