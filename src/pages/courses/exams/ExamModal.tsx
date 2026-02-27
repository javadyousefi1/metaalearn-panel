import React, { useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Button,
  Divider,
  Radio,
  Space,
} from 'antd';
import { Plus, Trash2, GraduationCap } from 'lucide-react';
import moment from 'moment-jalaali';
import JalaliAntdDatePicker from '@/components/datePicker/JalaliAntdDatePicker';
import { useGetAllSchedules } from '@/hooks';
import { CredentialExam } from '@/types/exam.types';
import { CredentialExamType } from '@/enums';

interface ExamModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  loading?: boolean;
  exam?: CredentialExam | null;
  courseId: string;
}

const examTypeOptions = Object.entries(CredentialExamType)
  .filter(([key]) => !isNaN(Number(key)))
  .map(([key, label]) => ({ value: Number(key), label }));

export const ExamModal: React.FC<ExamModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
  exam,
  courseId,
}) => {
  const [form] = Form.useForm();
  const hasOccurrenceTimeWindow = Form.useWatch('hasOccurrenceTimeWindow', form);

  const { data: schedules = [] } = useGetAllSchedules(
    { CourseId: courseId, PageIndex: 1, PageSize: 100 },
    !!courseId && open
  );

  useEffect(() => {
    if (!open) return;

    if (exam) {
      form.setFieldsValue({
        description: exam.description,
        examType: exam.type,
        courseScheduleIds: exam.schedules?.map((s) => s.id) || [],
        isCountedInDegree: exam.isCountedInDegree,
        timeWindowLimit: exam.timeWindowLimit,
        hasOccurrenceTimeWindow: exam.hasOccurrenceTimeWindow,
        occurrenceStartTime: exam.hasOccurrenceTimeWindow && exam.occurrenceStartTime
          ? moment(exam.occurrenceStartTime)
          : null,
        occurrenceEndTime: exam.hasOccurrenceTimeWindow && exam.occurrenceEndTime
          ? moment(exam.occurrenceEndTime)
          : null,
        questions: exam.questions.map((q) => ({
          questionText: q.questionText,
          answer0: q.answers[0] || '',
          answer1: q.answers[1] || '',
          answer2: q.answers[2] || '',
          answer3: q.answers[3] || '',
          correctAnswerIndex: q.correctAnswerIndex,
        })),
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        isCountedInDegree: true,
        timeWindowLimit: 60,
        hasOccurrenceTimeWindow: false,
        examType: 2,
        courseScheduleIds: [],
        questions: [],
      });
    }
  }, [exam, open, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    await onSubmit(values);
    form.resetFields();
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <GraduationCap size={20} className="text-primary" />
          <span className="text-xl font-bold">
            {exam ? 'ویرایش آزمون' : 'افزودن آزمون جدید'}
          </span>
        </div>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={exam ? 'به‌روزرسانی' : 'افزودن'}
      cancelText="انصراف"
      confirmLoading={loading}
      width={800}
      centered
      destroyOnClose
    >
      <div className="py-4 max-h-[75svh] overflow-y-auto">
        <Form
          form={form}
          layout="vertical"
          size="large"
          requiredMark={false}
          disabled={loading}
        >
          {/* Description */}
          <Form.Item
            name="description"
            label="عنوان / توضیحات آزمون"
            rules={[{ required: true, message: 'لطفاً عنوان آزمون را وارد کنید' }]}
          >
            <Input.TextArea rows={2} placeholder="عنوان یا توضیحات آزمون را وارد کنید" />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Exam Type */}
            <Form.Item
              name="examType"
              label="نوع آزمون"
              rules={[{ required: true, message: 'لطفاً نوع آزمون را انتخاب کنید' }]}
            >
              <Select placeholder="انتخاب نوع آزمون" options={examTypeOptions} />
            </Form.Item>

            {/* Time Window Limit */}
            <Form.Item
              name="timeWindowLimit"
              label="مدت زمان آزمون (دقیقه)"
              rules={[{ required: true, message: 'لطفاً مدت زمان را وارد کنید' }]}
            >
              <InputNumber className="w-full" min={0} placeholder="60" />
            </Form.Item>
          </div>

          {/* Schedule IDs */}
          <Form.Item
            name="courseScheduleIds"
            label="گروه‌بندی‌های مرتبط"
            extra={`${schedules.length} گروه‌بندی در دسترس`}
          >
            <Select
              mode="multiple"
              placeholder="گروه‌بندی‌های مرتبط با این آزمون را انتخاب کنید"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={schedules.map((s: any) => ({
                label: s.name,
                value: s.id,
              }))}
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Is Counted in Degree */}
            <Form.Item
              name="isCountedInDegree"
              label="در نمره لحاظ شود"
              valuePropName="checked"
            >
              <Switch checkedChildren="بله" unCheckedChildren="خیر" />
            </Form.Item>

            {/* Has Occurrence Time Window */}
            <Form.Item
              name="hasOccurrenceTimeWindow"
              label="بازه زمانی مشخص"
              valuePropName="checked"
            >
              <Switch checkedChildren="بله" unCheckedChildren="خیر" />
            </Form.Item>
          </div>

          {/* Occurrence Time Window */}
          {hasOccurrenceTimeWindow && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="occurrenceStartTime"
                label="زمان شروع"
                rules={[{ required: true, message: 'لطفاً زمان شروع را وارد کنید' }]}
              >
                <JalaliAntdDatePicker
                  showTime
                  format="YYYY/MM/DD HH:mm"
                  className="w-full"
                  placeholder="انتخاب زمان شروع"
                />
              </Form.Item>

              <Form.Item
                name="occurrenceEndTime"
                label="زمان پایان"
                rules={[{ required: true, message: 'لطفاً زمان پایان را وارد کنید' }]}
              >
                <JalaliAntdDatePicker
                  showTime
                  format="YYYY/MM/DD HH:mm"
                  className="w-full"
                  placeholder="انتخاب زمان پایان"
                />
              </Form.Item>
            </div>
          )}

          <Divider orientation="right">
            <span className="text-base font-semibold">سوالات آزمون</span>
          </Divider>

          {/* Questions */}
          <Form.List name="questions">
            {(fields, { add, remove }) => (
              <div className="space-y-4">
                {fields.map(({ key, name: fieldName, ...restField }, questionIndex) => (
                  <div
                    key={key}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-gray-700">
                        سوال {questionIndex + 1}
                      </span>
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<Trash2 size={14} />}
                        onClick={() => remove(fieldName)}
                      >
                        حذف سوال
                      </Button>
                    </div>

                    {/* Question Text */}
                    <Form.Item
                      {...restField}
                      name={[fieldName, 'questionText']}
                      label="متن سوال"
                      rules={[{ required: true, message: 'لطفاً متن سوال را وارد کنید' }]}
                    >
                      <Input.TextArea rows={2} placeholder="متن سوال را وارد کنید" size="large" />
                    </Form.Item>

                    {/* Answers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                      {[0, 1, 2, 3].map((answerIdx) => (
                        <Form.Item
                          key={answerIdx}
                          {...restField}
                          name={[fieldName, `answer${answerIdx}`]}
                          label={`گزینه ${answerIdx + 1}`}
                          rules={[{ required: true, message: `لطفاً گزینه ${answerIdx + 1} را وارد کنید` }]}
                          className="mb-0"
                        >
                          <Input placeholder={`گزینه ${answerIdx + 1}`} size="large" />
                        </Form.Item>
                      ))}
                    </div>

                    {/* Correct Answer */}
                    <Form.Item
                      {...restField}
                      name={[fieldName, 'correctAnswerIndex']}
                      label="گزینه صحیح"
                      rules={[{ required: true, message: 'لطفاً گزینه صحیح را انتخاب کنید' }]}
                    >
                      <Radio.Group>
                        <Space wrap>
                          {[1, 2, 3, 4].map((i) => (
                            <Radio key={i} value={i}>
                              گزینه {i}
                            </Radio>
                          ))}
                        </Space>
                      </Radio.Group>
                    </Form.Item>
                  </div>
                ))}

                <Button
                  type="dashed"
                  onClick={() => add({ correctAnswerIndex: 1 })}
                  icon={<Plus size={16} />}
                  className="w-full"
                  size="large"
                >
                  افزودن سوال جدید
                </Button>
              </div>
            )}
          </Form.List>
        </Form>
      </div>
    </Modal>
  );
};
